'use strict';
/*
 * Office Manager — server.
 * Tashqi kutubxonalarsiz: Node.js 18+ yetarli.  Ishga tushirish:  node server/server.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Core = require('../shared/core.js');
const Store = require('./store.js');
const TelegramHub = require('./telegram.js');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const PUBLIC = path.join(ROOT, 'public');
const SESSION_DAYS = 30;

const store = new Store(DATA_DIR);
const app = {
  get state() { return store.state; },
  save: () => store.save(),
  act(type, payload, actor) {
    const r = Core.apply(store.state, type, payload, { now: Core.nowIn(store.state.settings.timezone), actor });
    store.save();
    return r;
  },
};
const tg = new TelegramHub(app);

/* ───────────────────────── Autentifikatsiya ───────────────────────── */
function auth() {
  const s = store.state;
  if (!s._auth) s._auth = { secret: crypto.randomBytes(32).toString('hex'), version: 1 };
  return s._auth;
}
function setPassword(pwd) {
  const a = auth();
  a.salt = crypto.randomBytes(16).toString('hex');
  a.hash = crypto.scryptSync(pwd, a.salt, 64).toString('hex');
  a.version = (a.version || 0) + 1; // eski sessiyalar bekor bo‘ladi
  store.save();
}
function checkPassword(pwd) {
  const a = auth();
  if (!a.hash) return false;
  const h = crypto.scryptSync(String(pwd || ''), a.salt, 64);
  return crypto.timingSafeEqual(h, Buffer.from(a.hash, 'hex'));
}
function sign(v) { return crypto.createHmac('sha256', auth().secret).update(v).digest('base64url'); }
function makeSession() {
  const exp = Date.now() + SESSION_DAYS * 86400e3;
  const v = `${exp}.${auth().version}`;
  return `${v}.${sign(v)}`;
}
function validSession(req) {
  const m = /(?:^|;\s*)om_sid=([^;]+)/.exec(req.headers.cookie || '');
  if (!m) return false;
  const [exp, ver, sig] = m[1].split('.');
  if (!exp || !sig || Number(exp) < Date.now() || Number(ver) !== auth().version) return false;
  const good = sign(`${exp}.${ver}`);
  return good.length === sig.length && crypto.timingSafeEqual(Buffer.from(good), Buffer.from(sig));
}
function cookie(req, value, maxAge) {
  const secure = req.headers['x-forwarded-proto'] === 'https' || process.env.COOKIE_SECURE === '1';
  return `om_sid=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}

const failures = new Map(); // ip -> { n, until }
function blocked(ip) { const f = failures.get(ip); return f && f.until > Date.now(); }
function noteFailure(ip) {
  const f = failures.get(ip) || { n: 0, until: 0 };
  f.n += 1;
  if (f.n >= 5) { f.until = Date.now() + 10 * 60e3; f.n = 0; }
  failures.set(ip, f);
}

if (process.env.ADMIN_PASSWORD) setPassword(process.env.ADMIN_PASSWORD);

/* ───────────────────────── Yordamchilar ───────────────────────── */
function send(res, code, body, headers) {
  const data = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers });
  res.end(data);
}
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > (limit || 1e6)) { reject(Object.assign(new Error('So‘rov juda katta'), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch (e) { reject(Object.assign(new Error('JSON noto‘g‘ri'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

function clientState() {
  const s = store.state;
  const out = { ...s };
  delete out._auth; delete out.sent;
  out.bots = s.bots.map((b) => ({
    id: b.id, username: b.username, name: b.name, active: b.active !== false, addedAt: b.addedAt,
    tokenHint: '••••' + String(b.token).slice(-4), ...tg.status(b.id),
  }));
  out.serverNow = Core.nowIn(s.settings.timezone);
  return out;
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
function serveStatic(req, res, pathname) {
  let file;
  if (pathname === '/core.js') file = path.join(ROOT, 'shared', 'core.js');
  else {
    const rel = pathname === '/' ? '/index.html' : pathname;
    file = path.normalize(path.join(PUBLIC, rel));
    if (!file.startsWith(PUBLIC)) return send(res, 403, { error: 'Taqiqlangan' });
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      // SPA: noma’lum sahifalar index.html ga
      if (!path.extname(pathname)) return fs.readFile(path.join(PUBLIC, 'index.html'), (e2, d2) => (e2 ? send(res, 404, 'Not found') : send(res, 200, d2, { 'content-type': MIME['.html'] })));
      return send(res, 404, { error: 'Topilmadi' });
    }
    send(res, 200, data, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' });
  });
}

/* ───────────────────────── API ───────────────────────── */
const routes = {
  'GET /api/session': (req) => ({ authed: validSession(req), needsSetup: !auth().hash, officeName: store.state.settings.officeName }),

  'POST /api/setup': async (req, res, body) => {
    if (auth().hash) throw status(403, 'Parol allaqachon o‘rnatilgan');
    if (String(body.password || '').length < 6) throw status(400, 'Parol kamida 6 belgidan iborat bo‘lsin');
    setPassword(body.password);
    if (body.officeName) store.state.settings.officeName = String(body.officeName).slice(0, 60);
    store.save();
    res.setHeader('set-cookie', cookie(req, makeSession(), SESSION_DAYS * 86400));
    return { ok: true };
  },

  'POST /api/login': async (req, res, body) => {
    const ip = req.socket.remoteAddress;
    if (blocked(ip)) throw status(429, 'Juda ko‘p urinish. 10 daqiqadan so‘ng qayta urinib ko‘ring');
    if (!checkPassword(body.password)) { noteFailure(ip); await new Promise((r) => setTimeout(r, 400)); throw status(401, 'Parol noto‘g‘ri'); }
    failures.delete(ip);
    res.setHeader('set-cookie', cookie(req, makeSession(), SESSION_DAYS * 86400));
    return { ok: true };
  },

  'POST /api/logout': (req, res) => { res.setHeader('set-cookie', cookie(req, '', 0)); return { ok: true }; },

  'GET /api/state': () => {
    if (Core.tick(store.state, Core.nowIn(store.state.settings.timezone))) store.save();
    return clientState();
  },

  'POST /api/action': (req, res, body) => {
    const result = app.act(String(body.type || ''), body.payload || {}, 'Admin');
    return { result, state: clientState() };
  },

  'POST /api/bots/add': async (req, res, body) => {
    const token = String(body.token || '').trim();
    if (!/^\d{5,}:[A-Za-z0-9_-]{30,}$/.test(token)) throw status(400, 'Token formati noto‘g‘ri. BotFather bergan tokenni to‘liq nusxalang');
    const S = store.state;
    if (S.bots.some((b) => b.token === token)) throw status(400, 'Bu bot allaqachon ulangan');
    let me;
    try { me = await tg.call(token, 'getMe', {}); } catch (e) { throw status(400, e.message); }
    try { await tg.call(token, 'deleteWebhook', { drop_pending_updates: false }); } catch (e) { /* e’tiborsiz */ }
    const bot = { id: Core.uid('b'), token, username: me.username, name: me.first_name, active: true, offset: 0, addedAt: new Date().toISOString() };
    S.bots.push(bot);
    Core.log(S, { now: Core.nowIn(S.settings.timezone), actor: 'Admin' }, 'telegram', `@${me.username} boti ulandi`);
    store.save();
    tg.start(bot);
    return { state: clientState(), bot: { id: bot.id, username: bot.username } };
  },

  'POST /api/bots/remove': (req, res, body) => {
    const S = store.state;
    const bot = S.bots.find((b) => b.id === body.id);
    if (!bot) throw status(404, 'Bot topilmadi');
    tg.stop(bot.id);
    S.bots = S.bots.filter((b) => b.id !== bot.id);
    const keys = S.chats.filter((c) => c.botId === bot.id).map((c) => c.key);
    S.chats = S.chats.filter((c) => c.botId !== bot.id);
    if (keys.includes(S.settings.expenseChat)) S.settings.expenseChat = null;
    if (keys.includes(S.settings.dutyChat)) S.settings.dutyChat = null;
    for (const t of S.tasks) if (keys.includes(t.chat)) t.chat = null;
    Core.log(S, { now: Core.nowIn(S.settings.timezone), actor: 'Admin' }, 'telegram', `@${bot.username} boti uzildi`);
    store.save();
    return { state: clientState() };
  },

  'POST /api/bots/restart': (req, res, body) => {
    const bot = store.state.bots.find((b) => b.id === body.id);
    if (!bot) throw status(404, 'Bot topilmadi');
    tg.stop(bot.id); bot.active = true; tg.start(bot); store.save();
    return { state: clientState() };
  },

  'POST /api/chats/add': async (req, res, body) => {
    const S = store.state;
    const bot = S.bots.find((b) => b.id === body.botId);
    if (!bot) throw status(400, 'Avval botni tanlang');
    const chatId = String(body.chatId || '').trim();
    if (!/^-?\d{5,}$/.test(chatId) && !/^@[A-Za-z0-9_]{4,}$/.test(chatId)) throw status(400, 'Chat ID noto‘g‘ri (masalan: -1001234567890)');
    let chat;
    try { chat = await tg.call(bot.token, 'getChat', { chat_id: chatId }); } catch (e) { throw status(400, e.message); }
    const c = tg.upsertChat(bot, chat);
    store.save();
    return { state: clientState(), key: c.key };
  },

  'POST /api/chats/remove': (req, res, body) => {
    const S = store.state;
    S.chats = S.chats.filter((c) => c.key !== body.key);
    if (S.settings.expenseChat === body.key) S.settings.expenseChat = null;
    if (S.settings.dutyChat === body.key) S.settings.dutyChat = null;
    for (const t of S.tasks) if (t.chat === body.key) t.chat = null;
    store.save();
    return { state: clientState() };
  },

  'POST /api/telegram/test': async (req, res, body) => {
    const S = store.state;
    const text = `✅ <b>Ulanish muvaffaqiyatli</b>\n\n<b>${Core.esc(S.settings.officeName)}</b> Office Manager bu guruhga xabar yubora oladi.\nXarajat va navbatchilik eslatmalari shu yerda paydo bo‘ladi.`;
    try { await tg.send(body.chat, text); } catch (e) { throw status(400, e.message); }
    return { ok: true };
  },

  'POST /api/notify': async (req, res, body) => {
    const S = store.state;
    const now = Core.nowIn(S.settings.timezone);
    let chat, msg, label;
    if (body.kind === 'expense') {
      const e = S.expenses.find((x) => x.id === body.id);
      if (!e) throw status(404, 'Xarajat topilmadi');
      chat = S.settings.expenseChat;
      msg = Core.msgExpense(S, e, e.status === 'paid' ? 'paid' : 'remind', now.date);
      label = e.title;
    } else if (body.kind === 'shift') {
      const sh = S.shifts.find((x) => x.id === body.id);
      const t = sh && S.tasks.find((x) => x.id === sh.taskId);
      if (!t) throw status(404, 'Navbat topilmadi');
      chat = t.chat || S.settings.dutyChat;
      msg = Core.msgShift(S, t, sh.date, sh.ids, sh.status === 'done' ? 'done' : 'today', sh);
      label = t.title;
    } else throw status(400, 'Noto‘g‘ri so‘rov');
    if (!chat) throw status(400, 'Telegram guruhi tanlanmagan — Telegram bo‘limida guruhni tanlang');
    try { await tg.send(chat, msg.text, msg.buttons); } catch (e) { throw status(400, e.message); }
    Core.log(S, { now, actor: 'Admin' }, 'telegram', `Telegramga yuborildi: ${label}`);
    store.save();
    return { state: clientState() };
  },

  'POST /api/password': (req, res, body) => {
    if (!checkPassword(body.current)) throw status(400, 'Joriy parol noto‘g‘ri');
    if (String(body.next || '').length < 6) throw status(400, 'Yangi parol kamida 6 belgidan iborat bo‘lsin');
    setPassword(body.next);
    res.setHeader('set-cookie', cookie(req, makeSession(), SESSION_DAYS * 86400));
    return { ok: true };
  },

  'GET /api/export': (req, res) => {
    const data = { ...store.state };
    delete data._auth;
    const name = `office-manager-${Core.nowIn(store.state.settings.timezone).date}.json`;
    send(res, 200, JSON.stringify(data, null, 2), { 'content-disposition': `attachment; filename="${name}"` });
    return undefined;
  },

  'POST /api/import': (req, res, body) => {
    const d = body.data;
    if (!d || typeof d !== 'object' || !d.settings || !Array.isArray(d.employees)) throw status(400, 'Fayl formati noto‘g‘ri');
    const keepAuth = store.state._auth;
    tg.stopAll();
    store.state = Core.normalize(d);
    store.state._auth = keepAuth;
    store.save();
    tg.startAll();
    return { state: clientState() };
  },
};

const PUBLIC_ROUTES = new Set(['GET /api/session', 'POST /api/setup', 'POST /api/login', 'POST /api/logout']);
function status(code, message) { return Object.assign(new Error(message), { status: code }); }

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const key = `${req.method} ${url.pathname}`;
  if (!url.pathname.startsWith('/api/')) return serveStatic(req, res, url.pathname);
  const handler = routes[key];
  if (!handler) return send(res, 404, { error: 'Topilmadi' });
  try {
    if (!PUBLIC_ROUTES.has(key) && !validSession(req)) return send(res, 401, { error: 'Tizimga kiring' });
    if (req.method === 'POST' && !/application\/json/.test(req.headers['content-type'] || '')) return send(res, 415, { error: 'JSON kutilmoqda' });
    const body = req.method === 'POST' ? await readBody(req, key === 'POST /api/import' ? 20e6 : 1e6) : {};
    const out = await handler(req, res, body);
    if (out !== undefined && !res.headersSent) send(res, 200, out);
  } catch (e) {
    const code = e.status || (e.userError ? 400 : 500);
    if (code === 500) console.error(e);
    if (!res.headersSent) send(res, code, { error: code === 500 ? 'Server xatosi' : e.message });
  }
});

/* ───────────────────────── Rejalashtiruvchi ───────────────────────── */
let busy = false;
const retryAt = new Map(); // key -> ms
async function schedule() {
  if (busy) return;
  busy = true;
  try {
    const S = store.state;
    const now = Core.nowIn(S.settings.timezone);
    let changed = Core.tick(S, now);
    for (const n of Core.dueNotifications(S, now)) {
      if ((retryAt.get(n.key) || 0) > Date.now()) continue;
      try {
        await tg.send(n.chat, n.text, n.buttons);
        S.sent[n.key] = Date.now();
        retryAt.delete(n.key);
        Core.log(S, { now, actor: 'Bot' }, 'telegram', `Telegramga yuborildi: ${n.label}`);
        changed = true;
      } catch (e) {
        console.error(`[scheduler] ${n.label}: ${e.message}`);
        retryAt.set(n.key, Date.now() + 5 * 60e3);
      }
    }
    if (changed) store.save();
  } catch (e) {
    console.error('[scheduler]', e);
  } finally {
    busy = false;
  }
}

server.listen(PORT, HOST, () => {
  console.log(`\n  Office Manager ishga tushdi →  http://localhost:${PORT}\n  Ma’lumotlar: ${store.file}\n`);
  tg.startAll();
  schedule();
  setInterval(schedule, 30e3);
});

function shutdown() { tg.stopAll(); try { store.save(); } catch (e) { /* */ } process.exit(0); }
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

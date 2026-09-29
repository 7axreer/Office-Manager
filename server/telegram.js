'use strict';
/* Telegram Bot API: long polling, xabar yuborish, inline tugmalar. Tashqi kutubxonasiz. */
const Core = require('../shared/core.js');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ALLOWED = ['message', 'callback_query', 'my_chat_member'];
const BASE = (process.env.TELEGRAM_API_URL || 'https://api.telegram.org').replace(/\/$/, '');

class TelegramHub {
  constructor(app) {
    this.app = app;          // { state, save(), act(type, payload, actor) }
    this.runtime = new Map(); // botId -> { status, error, checkedAt }
    this.loops = new Map();   // botId -> loop token
  }

  async call(token, method, params, timeoutMs) {
    let res;
    try {
      res = await fetch(`${BASE}/bot${token}/${method}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(params || {}),
        signal: AbortSignal.timeout(timeoutMs || 15000),
      });
    } catch (e) {
      const err = new Error(e.name === 'TimeoutError' ? 'Telegram javob bermadi (timeout)' : 'Telegram bilan aloqa yo‘q: ' + e.message);
      err.network = true;
      throw err;
    }
    const j = await res.json().catch(() => ({ ok: false, description: 'HTTP ' + res.status }));
    if (!j.ok) {
      const err = new Error(translate(j.description || 'Telegram xatosi'));
      err.code = j.error_code; err.params = j.parameters || {};
      throw err;
    }
    return j.result;
  }

  rt(id) {
    if (!this.runtime.has(id)) this.runtime.set(id, { status: 'starting', error: null, checkedAt: null });
    return this.runtime.get(id);
  }

  status(id) { return this.runtime.get(id) || { status: 'stopped', error: null }; }

  startAll() { for (const b of this.app.state.bots) if (b.active !== false) this.start(b); }
  stopAll() { for (const id of [...this.loops.keys()]) this.stop(id); }

  start(bot) {
    if (this.loops.has(bot.id)) return;
    const token = Symbol(bot.id);
    this.loops.set(bot.id, token);
    this.rt(bot.id).status = 'starting';
    this.loop(bot, token).catch((e) => console.error('[tg] loop', e));
  }

  stop(id) {
    this.loops.delete(id);
    const r = this.runtime.get(id);
    if (r) r.status = 'stopped';
  }

  async loop(bot, token) {
    const rt = this.rt(bot.id);
    let backoff = 2000;
    while (this.loops.get(bot.id) === token) {
      try {
        const updates = await this.call(bot.token, 'getUpdates', { offset: bot.offset || 0, timeout: 25, allowed_updates: ALLOWED }, 35000);
        if (this.loops.get(bot.id) !== token) break;
        Object.assign(rt, { status: 'ok', error: null, checkedAt: Date.now() });
        backoff = 2000;
        for (const u of updates) {
          bot.offset = u.update_id + 1;
          try { await this.handle(bot, u); } catch (e) { console.error('[tg] update', e.message); }
        }
        if (updates.length) this.app.save();
      } catch (e) {
        if (this.loops.get(bot.id) !== token) break;
        if (e.code === 401 || e.code === 404) {
          Object.assign(rt, { status: 'error', error: 'Token yaroqsiz yoki bot o‘chirilgan' });
          this.loops.delete(bot.id);
          break;
        }
        if (e.code === 409) {
          // webhook o‘rnatilgan bo‘lsa, long polling ishlamaydi
          try { await this.call(bot.token, 'deleteWebhook', {}); } catch (x) { /* keyingi urinishda */ }
          Object.assign(rt, { status: 'error', error: 'Bot boshqa joyda ishlayapti (webhook yoki boshqa server). Qayta ulanmoqda…' });
        } else {
          Object.assign(rt, { status: 'error', error: e.message });
        }
        await sleep(backoff);
        backoff = Math.min(backoff * 2, 60000);
      }
    }
  }

  /* ───────────── Chatlar ───────────── */
  findChat(key) { return this.app.state.chats.find((c) => c.key === key) || null; }

  upsertChat(bot, chat) {
    const S = this.app.state;
    const key = `${bot.id}:${chat.id}`;
    let c = S.chats.find((x) => x.key === key);
    const title = chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(' ') || String(chat.id);
    if (!c) {
      c = { key, botId: bot.id, chatId: String(chat.id), title, type: chat.type, addedAt: new Date().toISOString() };
      S.chats.push(c);
      Core.log(S, this.ctx('Bot'), 'telegram', `@${bot.username} «${title}» guruhiga qo‘shildi`);
      this.app.save();
    } else if (c.title !== title) {
      c.title = title;
    }
    return c;
  }

  removeChat(bot, chatId) {
    const S = this.app.state;
    const key = `${bot.id}:${chatId}`;
    const c = S.chats.find((x) => x.key === key);
    if (!c) return;
    S.chats = S.chats.filter((x) => x.key !== key);
    Core.log(S, this.ctx('Bot'), 'telegram', `@${bot.username} «${c.title}» guruhidan chiqarildi`);
    this.app.save();
  }

  migrateChat(bot, oldId, newId) {
    const S = this.app.state;
    const oldKey = `${bot.id}:${oldId}`, newKey = `${bot.id}:${newId}`;
    const c = S.chats.find((x) => x.key === oldKey);
    if (c) { c.key = newKey; c.chatId = String(newId); c.type = 'supergroup'; }
    if (S.settings.expenseChat === oldKey) S.settings.expenseChat = newKey;
    if (S.settings.dutyChat === oldKey) S.settings.dutyChat = newKey;
    for (const t of S.tasks) if (t.chat === oldKey) t.chat = newKey;
    this.app.save();
  }

  /** Platformada ishlatilayotgan (tanlangan) chatmi — maxfiy ma’lumotni faqat shularga beramiz. */
  isTrusted(bot, chatId) {
    const S = this.app.state;
    const key = `${bot.id}:${chatId}`;
    return S.settings.expenseChat === key || S.settings.dutyChat === key || S.tasks.some((t) => t.chat === key);
  }

  /* ───────────── Xodimni avtomatik bog‘lash ───────────── */
  linkUser(from) {
    if (!from || from.is_bot) return null;
    const S = this.app.state;
    const id = String(from.id);
    const uname = (from.username || '').toLowerCase();
    let e = S.employees.find((x) => x.telegramId === id);
    if (!e && uname) e = S.employees.find((x) => x.username && x.username.toLowerCase() === uname);
    if (!e) return null;
    let changed = false;
    if (e.telegramId !== id) { e.telegramId = id; changed = true; Core.log(S, this.ctx('Bot'), 'employee', `${e.name} Telegram orqali bog‘landi`); }
    if (from.username && e.username !== from.username) { e.username = from.username; changed = true; }
    if (changed) this.app.save();
    return e;
  }

  ctx(actor) { return { now: Core.nowIn(this.app.state.settings.timezone), actor }; }

  /* ───────────── Yuborish ───────────── */
  async send(chatKey, text, buttons) {
    const S = this.app.state;
    const c = this.findChat(chatKey);
    if (!c) throw new Error('Guruh topilmadi — Telegram sozlamalarini tekshiring');
    const bot = S.bots.find((b) => b.id === c.botId);
    if (!bot) throw new Error('Guruhga ulangan bot o‘chirilgan');
    const params = {
      chat_id: c.chatId, text, parse_mode: 'HTML', disable_web_page_preview: true,
      ...(buttons && buttons.length ? { reply_markup: { inline_keyboard: buttons } } : {}),
    };
    try {
      return await this.call(bot.token, 'sendMessage', params);
    } catch (e) {
      if (e.params && e.params.migrate_to_chat_id) {
        this.migrateChat(bot, c.chatId, e.params.migrate_to_chat_id);
        return this.call(bot.token, 'sendMessage', { ...params, chat_id: String(e.params.migrate_to_chat_id) });
      }
      throw e;
    }
  }

  /* ───────────── Kiruvchi yangilanishlar ───────────── */
  async handle(bot, u) {
    if (u.my_chat_member) {
      const m = u.my_chat_member;
      const st = m.new_chat_member && m.new_chat_member.status;
      if (m.chat.type === 'private') return;
      if (st === 'member' || st === 'administrator') this.upsertChat(bot, m.chat);
      else if (st === 'left' || st === 'kicked') this.removeChat(bot, m.chat.id);
      return;
    }
    if (u.message) return this.onMessage(bot, u.message);
    if (u.callback_query) return this.onCallback(bot, u.callback_query);
  }

  async onMessage(bot, m) {
    const chat = m.chat;
    const isGroup = chat.type === 'group' || chat.type === 'supergroup';
    if (m.migrate_to_chat_id) return this.migrateChat(bot, chat.id, m.migrate_to_chat_id);
    const e = this.linkUser(m.from);
    if (isGroup) this.upsertChat(bot, chat);
    const text = (m.text || '').trim();
    if (!text.startsWith('/')) return;
    const [raw] = text.split(/\s+/);
    const [cmd, target] = raw.slice(1).split('@');
    if (target && target.toLowerCase() !== String(bot.username).toLowerCase()) return;
    const reply = (t) => this.call(bot.token, 'sendMessage', { chat_id: chat.id, text: t, parse_mode: 'HTML', disable_web_page_preview: true, reply_to_message_id: m.message_id, allow_sending_without_reply: true }).catch((x) => console.error('[tg] reply', x.message));
    const S = this.app.state;
    const office = Core.esc(S.settings.officeName);
    const trusted = isGroup ? this.isTrusted(bot, chat.id) : !!e;

    switch (cmd.toLowerCase()) {
      case 'start':
      case 'help': {
        if (isGroup) {
          return reply(`👋 Salom! Men <b>${office}</b> ofis yordamchisiman.\n\n` +
            (trusted ? 'Bu guruh platformaga ulangan. ' : 'Bu guruh aniqlandi — endi dashboard’ning <b>Telegram</b> bo‘limida uni tanlang. ') +
            '\n\n<b>Buyruqlar</b>\n/navbat — navbatchilik jadvali\n/tolovlar — yaqin to‘lovlar\n/id — chat ID');
        }
        if (e) return reply(`✅ Salom, <b>${Core.esc(e.name)}</b>! Hisobingiz platformaga bog‘landi — endi eslatmalarda to‘g‘ridan-to‘g‘ri belgilanasiz.\n\n/navbat — navbatchilik jadvali\n/tolovlar — yaqin to‘lovlar`);
        return reply(`👋 Salom! Sizning Telegram hisobingiz <b>${office}</b> jamoasi ro‘yxatida topilmadi.\n\nAdministratorga username’ingizni${m.from.username ? ` (<code>@${Core.esc(m.from.username)}</code>)` : ''} yoki ID’ingizni yuboring: <code>${m.from.id}</code>`);
      }
      case 'id':
        return reply(`Chat ID: <code>${chat.id}</code>\nSizning ID: <code>${m.from.id}</code>`);
      case 'navbat':
      case 'navbatchilik': {
        if (!trusted) return reply('Bu ma’lumot faqat platformaga ulangan guruhlarda ko‘rinadi.');
        return reply(this.dutySummary());
      }
      case 'tolovlar':
      case 'xarajatlar': {
        if (!trusted) return reply('Bu ma’lumot faqat platformaga ulangan guruhlarda ko‘rinadi.');
        return reply(this.expenseSummary());
      }
      default:
    }
  }

  dutySummary() {
    const S = this.app.state;
    const today = Core.nowIn(S.settings.timezone).date;
    const list = Core.upcoming(S, today, Core.addDays(today, 6), today);
    if (!list.length) return '🧹 Yaqin 7 kunda navbatchilik yo‘q.';
    const lines = ['🧹 <b>Navbatchilik — 7 kun</b>'];
    let last = null;
    for (const x of list) {
      const t = S.tasks.find((k) => k.id === x.taskId);
      if (!t) continue;
      if (x.date !== last) { lines.push('', `<b>${Core.fmtDateLong(x.date)}</b>${x.date === today ? ' · bugun' : ''}`); last = x.date; }
      const done = x.shift && x.shift.status === 'done' ? ' ✅' : '';
      lines.push(`${Core.esc(t.emoji)} ${Core.esc(t.title)} — ${x.ids.map((id) => Core.esc(Core.empName(S, id))).join(', ') || '—'}${done}`);
    }
    return lines.join('\n');
  }

  expenseSummary() {
    const S = this.app.state;
    const today = Core.nowIn(S.settings.timezone).date;
    const pend = S.expenses.filter((e) => e.status === 'pending' && Core.diffDays(e.dueDate, today) <= 14).sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
    if (!pend.length) return '💳 Yaqin 14 kunda to‘lovlar yo‘q.';
    const lines = ['💳 <b>Yaqin to‘lovlar</b>', ''];
    for (const e of pend) {
      const late = e.dueDate < today ? '⚠️ ' : '';
      lines.push(`${late}<b>${Core.esc(e.title)}</b> — ${Core.money(e.amount, S.settings.currency)}\n    ${Core.fmtDate(e.dueDate)} (${Core.relDay(e.dueDate, today)}) · ${Core.esc((Core.emp(S, e.assigneeId) || {}).name || '—')}`);
    }
    return lines.join('\n');
  }

  async onCallback(bot, q) {
    const S = this.app.state;
    const answer = (text, alert) => this.call(bot.token, 'answerCallbackQuery', { callback_query_id: q.id, text, show_alert: !!alert }).catch(() => {});
    const e = this.linkUser(q.from);
    const msg = q.message;
    const chatId = msg && msg.chat && msg.chat.id;
    if (!e && !(chatId && this.isTrusted(bot, chatId))) return answer('Ruxsat yo‘q', true);
    const actor = e ? e.name : [q.from.first_name, q.from.last_name].filter(Boolean).join(' ') || q.from.username || 'Telegram';
    const [kind, id] = String(q.data || '').split(':');
    const today = Core.nowIn(S.settings.timezone).date;

    try {
      if (kind === 'pay') {
        const exp = S.expenses.find((x) => x.id === id);
        if (!exp) return answer('Xarajat topilmadi', true);
        if (exp.status !== 'paid') this.app.act('expense.pay', { id }, actor);
        await answer('✅ To‘lov qayd etildi');
        if (msg) {
          const r = Core.msgExpense(S, exp, 'paid', today);
          await this.call(bot.token, 'editMessageText', { chat_id: chatId, message_id: msg.message_id, text: r.text, parse_mode: 'HTML', reply_markup: { inline_keyboard: [] } }).catch(() => {});
        }
        return;
      }
      if (kind === 'done') {
        const sh = S.shifts.find((x) => x.id === id);
        if (!sh) return answer('Navbat topilmadi', true);
        if (sh.status !== 'done') this.app.act('shift.done', { id }, actor);
        await answer('✅ Rahmat! Bajarildi deb belgilandi');
        const t = S.tasks.find((x) => x.id === sh.taskId);
        if (msg && t) {
          const r = Core.msgShift(S, t, sh.date, sh.ids, 'done', sh);
          await this.call(bot.token, 'editMessageText', { chat_id: chatId, message_id: msg.message_id, text: r.text, parse_mode: 'HTML', reply_markup: { inline_keyboard: [] } }).catch(() => {});
        }
        return;
      }
      return answer('Noma’lum amal');
    } catch (err) {
      return answer(err.message || 'Xatolik', true);
    }
  }
}

function translate(desc) {
  const d = String(desc);
  if (/Unauthorized/i.test(d)) return 'Token noto‘g‘ri';
  if (/chat not found/i.test(d)) return 'Guruh topilmadi — bot guruhga qo‘shilganini tekshiring';
  if (/bot was kicked/i.test(d)) return 'Bot guruhdan chiqarilgan';
  if (/not enough rights/i.test(d)) return 'Botda xabar yuborish huquqi yo‘q';
  if (/Conflict/i.test(d)) return 'Bot boshqa joyda ishlayapti (webhook yoki boshqa server)';
  if (/Too Many Requests/i.test(d)) return 'Telegram so‘rovlar chegarasi — biroz kuting';
  return d;
}

module.exports = TelegramHub;

/*
 * Office Manager — umumiy mantiq.
 * Bir xil kod serverda (Node.js) va brauzerda ishlaydi:
 * sanalar, takroriy xarajatlar, adolatli navbat, statistika, Telegram xabarlari.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Core = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ───────────────────────── Sanalar ───────────────────────── */
  const DAY = 86400000;
  const pad = (n) => String(n).padStart(2, '0');
  const parseD = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  const fmtD = (t) => { const d = new Date(t); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };
  const addDays = (s, n) => fmtD(parseD(s) + n * DAY);
  const diffDays = (a, b) => Math.round((parseD(a) - parseD(b)) / DAY); // a - b
  const weekday = (s) => { const w = new Date(parseD(s)).getUTCDay(); return w === 0 ? 7 : w; }; // 1=Du … 7=Ya
  const weekKey = (s) => addDays(s, 1 - weekday(s));
  const toMin = (t) => { const [h, m] = String(t || '00:00').split(':').map(Number); return (h || 0) * 60 + (m || 0); };

  function addMonths(s, n, anchorDay) {
    const [y, m, d] = s.split('-').map(Number);
    const day = anchorDay || d;
    const total = y * 12 + (m - 1) + n;
    const yy = Math.floor(total / 12), mm = total % 12;
    const last = new Date(Date.UTC(yy, mm + 1, 0)).getUTCDate();
    return fmtD(Date.UTC(yy, mm, Math.min(day, last)));
  }
  const monthShift = (key, n) => addMonths(key + '-01', n).slice(0, 7);

  /** Berilgan vaqt zonasida hozirgi sana/vaqt. */
  function nowIn(tz, at) {
    const d = at || new Date();
    let parts;
    try {
      parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz || 'Asia/Tashkent', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
      }).formatToParts(d);
    } catch (e) { return nowIn('UTC', d); }
    const g = (t) => parts.find((x) => x.type === t).value;
    const hh = g('hour') === '24' ? '00' : g('hour');
    const date = `${g('year')}-${g('month')}-${g('day')}`;
    const time = `${hh}:${g('minute')}`;
    return { date, time, minutes: toMin(time), ts: d.toISOString() };
  }

  /* ───────────────────────── Formatlash ───────────────────────── */
  const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  const MONTHS_SHORT = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  const WD = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
  const WD_SHORT = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function fmtDate(s, withYearIfOther) {
    if (!s) return '—';
    const [y, m, d] = s.split('-').map(Number);
    const base = `${d}-${MONTHS[m - 1]}`;
    return withYearIfOther && String(y) !== withYearIfOther.slice(0, 4) ? `${base}, ${y}` : base;
  }
  const fmtDateLong = (s) => `${WD[weekday(s) - 1]}, ${fmtDate(s)}`;
  const monthLabel = (key) => MONTHS[Number(key.slice(5, 7)) - 1];

  function relDay(s, today) {
    const n = diffDays(s, today);
    if (n === 0) return 'bugun';
    if (n === 1) return 'ertaga';
    if (n === -1) return 'kecha';
    return n > 0 ? `${n} kundan keyin` : `${-n} kun oldin`;
  }

  const groupDigits = (n) => String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  function money(n, cur) {
    const v = (n < 0 ? '−' : '') + groupDigits(n || 0);
    if (cur === 'USD') return '$' + v;
    if (cur === 'EUR') return '€' + v;
    return v + ' so‘m';
  }
  function moneyShort(n, cur) {
    const a = Math.abs(n || 0);
    const trim = (x) => x.toFixed(x >= 100 ? 0 : x >= 10 ? 1 : 2).replace(/\.?0+$/, '').replace('.', ',');
    let v;
    if (a >= 1e9) v = trim(a / 1e9) + ' mlrd';
    else if (a >= 1e6) v = trim(a / 1e6) + ' mln';
    else if (a >= 1e4) v = trim(a / 1e3) + ' ming';
    else v = groupDigits(a);
    if (cur === 'USD') return '$' + v;
    if (cur === 'EUR') return '€' + v;
    return v + ' so‘m';
  }

  function hue(id) { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 360; }
  const initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

  const uid = (p) => (p || '') + Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 8);

  /* ───────────────────────── Holat ───────────────────────── */
  const DEFAULT_CATEGORIES = ['Ijara', 'Kommunal', 'Internet va aloqa', 'Oziq-ovqat', 'Xo‘jalik', 'Jihozlar', 'Dasturlar', 'Boshqa'];

  function defaultState() {
    return {
      version: 1,
      settings: {
        officeName: 'Ofis',
        currency: 'UZS',
        timezone: 'Asia/Tashkent',
        workdays: [1, 2, 3, 4, 5],
        expenseTime: '10:00',
        eveningTime: '18:00',
        remindDays: [3, 1, 0],
        overdueDaily: true,
        categories: DEFAULT_CATEGORIES.slice(),
        expenseChat: null,
        dutyChat: null,
      },
      employees: [], expenses: [], tasks: [], shifts: [], overrides: {},
      bots: [], chats: [], activity: [], sent: {},
    };
  }

  function normalize(state) {
    const d = defaultState();
    const s = Object.assign(d, state || {});
    s.settings = Object.assign(defaultState().settings, (state && state.settings) || {});
    for (const k of ['employees', 'expenses', 'tasks', 'shifts', 'bots', 'chats', 'activity']) if (!Array.isArray(s[k])) s[k] = [];
    if (!s.overrides || typeof s.overrides !== 'object') s.overrides = {};
    if (!s.sent || typeof s.sent !== 'object') s.sent = {};
    return s;
  }

  const emp = (state, id) => state.employees.find((e) => e.id === id) || null;
  const empName = (state, id) => (emp(state, id) || {}).name || 'O‘chirilgan xodim';

  function isAvailable(state, id, date) {
    const e = emp(state, id);
    if (!e || e.active === false) return false;
    if (e.awayFrom || e.awayTo) {
      const from = e.awayFrom || '0000-00-00', to = e.awayTo || '9999-12-31';
      if (date >= from && date <= to) return false;
    }
    return true;
  }
  function awayNow(e, today) {
    if (!e.awayFrom && !e.awayTo) return false;
    return today >= (e.awayFrom || '0000-00-00') && today <= (e.awayTo || '9999-12-31');
  }

  /* ───────────────────────── Xarajatlar ───────────────────────── */
  const REC_LABEL = { none: 'Bir martalik', weekly: 'Har hafta', monthly: 'Har oy', quarterly: 'Har 3 oyda', yearly: 'Har yili' };
  function recLabel(r) {
    if (!r || !r.type || r.type === 'none') return REC_LABEL.none;
    if (r.type !== 'custom') return REC_LABEL[r.type] || '';
    const unit = { day: 'kunda', week: 'haftada', month: 'oyda' }[r.unit] || 'kunda';
    return `Har ${Math.max(1, r.interval || 1)} ${unit}`;
  }
  const isRecurring = (e) => !!(e.recurrence && e.recurrence.type && e.recurrence.type !== 'none');

  function nextDue(e) {
    const r = e.recurrence || {};
    const anchor = e.anchorDay || Number(e.dueDate.slice(8));
    switch (r.type) {
      case 'weekly': return addDays(e.dueDate, 7);
      case 'monthly': return addMonths(e.dueDate, 1, anchor);
      case 'quarterly': return addMonths(e.dueDate, 3, anchor);
      case 'yearly': return addMonths(e.dueDate, 12, anchor);
      case 'custom': {
        const n = Math.max(1, Number(r.interval) || 1);
        if (r.unit === 'month') return addMonths(e.dueDate, n, anchor);
        if (r.unit === 'week') return addDays(e.dueDate, 7 * n);
        return addDays(e.dueDate, n);
      }
      default: return null;
    }
  }

  /** 'paid' | 'cancelled' | 'overdue' | 'today' | 'soon' | 'upcoming' */
  function expStatus(e, today) {
    if (e.status === 'paid') return 'paid';
    if (e.status === 'cancelled') return 'cancelled';
    const n = diffDays(e.dueDate, today);
    if (n < 0) return 'overdue';
    if (n === 0) return 'today';
    if (n <= 7) return 'soon';
    return 'upcoming';
  }
  const expAmount = (e) => (e.status === 'paid' && e.paidAmount != null ? e.paidAmount : e.amount) || 0;

  /* ───────────────────────── Navbatchilik ───────────────────────── */
  function matches(task, date, settings) {
    const s = task.schedule || {};
    if (s.startDate && date < s.startDate) return false;
    const wd = weekday(date);
    const workdays = (settings && settings.workdays) || [1, 2, 3, 4, 5];
    if (s.type === 'weekly') return (s.weekdays || []).includes(wd);
    if (s.type === 'interval') {
      const n = diffDays(date, s.startDate || date);
      if (n % Math.max(1, Number(s.every) || 1) !== 0) return false;
      return !s.workdaysOnly || workdays.includes(wd);
    }
    return !s.workdaysOnly || workdays.includes(wd); // daily
  }

  function scheduleLabel(task) {
    const s = task.schedule || {};
    if (s.type === 'weekly') {
      const days = (s.weekdays || []).slice().sort((a, b) => a - b);
      if (days.length === 7) return 'Har kuni';
      if (days.length === 1) return `Har ${WD[days[0] - 1].toLowerCase()}`;
      return 'Har hafta: ' + days.map((d) => WD_SHORT[d - 1]).join(', ');
    }
    if (s.type === 'interval') return `Har ${Math.max(1, s.every || 1)} kunda${s.workdaysOnly ? ' (ish kunlari)' : ''}`;
    return s.workdaysOnly ? 'Har ish kuni' : 'Har kuni';
  }

  /**
   * Adolatli navbat: navbat (queue) boshidagi bo‘sh xodim tanlanadi va oxiriga o‘tkaziladi.
   * Ta’tildagi xodim o‘z o‘rnini saqlaydi — qaytgach birinchi bo‘lib navbatga chiqadi.
   */
  function pickFrom(state, queue, n, date, exclude) {
    const picks = [];
    for (const id of queue) {
      if (picks.length >= n) break;
      if (exclude && exclude.includes(id)) continue;
      if (isAvailable(state, id, date)) picks.push(id);
    }
    moveToEnd(queue, picks);
    return picks;
  }
  function moveToEnd(queue, ids) {
    for (const id of ids) { const i = queue.indexOf(id); if (i >= 0) { queue.splice(i, 1); queue.push(id); } }
  }
  function moveToFront(queue, ids) {
    for (const id of ids.slice().reverse()) { const i = queue.indexOf(id); if (i >= 0) { queue.splice(i, 1); queue.unshift(id); } }
  }

  function assigneesFor(state, task, date, sim) {
    const n = Math.max(1, Number(task.perShift) || 1);
    const ov = state.overrides[task.id + '|' + date];
    if (ov) {
      const ids = ov.filter((id) => emp(state, id));
      moveToEnd(sim.queue, ids);
      return { ids, override: true };
    }
    if (task.rotateBy === 'week' && sim.lastDate && weekKey(sim.lastDate) === weekKey(date) && sim.lastIds.length) {
      const keep = sim.lastIds.filter((id) => isAvailable(state, id, date));
      const extra = keep.length < n ? pickFrom(state, sim.queue, n - keep.length, date, keep) : [];
      return { ids: keep.concat(extra), override: false };
    }
    return { ids: pickFrom(state, sim.queue, n, date), override: false };
  }

  /** Vazifaning kelgusi (hali tasdiqlanmagan) navbatlari. */
  function projectTask(state, task, from, to, today) {
    const out = [];
    if (!task.active) return out;
    const sim = { queue: (task.queue || []).slice(), lastDate: task.lastDate || null, lastIds: (task.lastIds || []).slice() };
    let d = task.cursor || (task.schedule && task.schedule.startDate) || today || from;
    if (today && d < today) d = today;
    const limit = addDays(to, 1);
    let guard = 0;
    while (d < limit && guard++ < 800) {
      if (matches(task, d, state.settings)) {
        const r = assigneesFor(state, task, d, sim);
        sim.lastDate = d; sim.lastIds = r.ids;
        if (d >= from) out.push({ taskId: task.id, date: d, ids: r.ids, override: r.override, committed: false });
      }
      d = addDays(d, 1);
    }
    return out;
  }

  /** Tasdiqlangan + rejadagi navbatlar (sanalar bo‘yicha). */
  function upcoming(state, from, to, today) {
    const list = [];
    for (const t of state.tasks) {
      for (const sh of state.shifts) {
        if (sh.taskId === t.id && sh.date >= from && sh.date <= to) list.push({ taskId: t.id, date: sh.date, ids: sh.ids, committed: true, shift: sh });
      }
      for (const p of projectTask(state, t, from, to, today)) list.push(p);
    }
    return list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }

  function shiftState(sh, today) {
    if (sh.status === 'done') return 'done';
    if (sh.date < today) return 'missed';
    return 'pending';
  }

  /** Bugungi navbatlarni tasdiqlaydi. Server har daqiqada, brauzer yuklanganda chaqiradi. */
  function tick(state, now) {
    let changed = false;
    for (const t of state.tasks) {
      if (!t.active) continue;
      let c = t.cursor || (t.schedule && t.schedule.startDate) || now.date;
      if (c < now.date) c = now.date; // server o‘chiq bo‘lgan kunlar navbatni aylantirmaydi
      while (c <= now.date) {
        if (matches(t, c, state.settings) && !state.shifts.some((s) => s.taskId === t.id && s.date === c)) {
          const sim = { queue: t.queue || [], lastDate: t.lastDate || null, lastIds: t.lastIds || [] };
          const r = assigneesFor(state, t, c, sim);
          t.queue = sim.queue;
          state.shifts.push({ id: uid('sh'), taskId: t.id, date: c, ids: r.ids, status: 'pending' });
          t.lastDate = c; t.lastIds = r.ids;
          delete state.overrides[t.id + '|' + c];
        }
        c = addDays(c, 1);
      }
      if (c !== t.cursor) { t.cursor = c; changed = true; }
    }
    // eski yozuvlarni tozalash
    const cutoff = Date.now() - 120 * DAY;
    for (const [k, v] of Object.entries(state.sent)) if (typeof v === 'number' && v < cutoff) { delete state.sent[k]; changed = true; }
    for (const k of Object.keys(state.overrides)) if (k.split('|')[1] < now.date) { delete state.overrides[k]; changed = true; }
    if (state.shifts.length > 3000) { state.shifts = state.shifts.slice(-3000); changed = true; }
    return changed;
  }

  /* ───────────────────────── Statistika ───────────────────────── */
  function stats(state, today) {
    const month = today.slice(0, 7);
    const live = state.expenses.filter((e) => e.status !== 'cancelled');
    const inMonth = (k) => live.filter((e) => e.dueDate.slice(0, 7) === k);
    const sum = (arr) => arr.reduce((a, e) => a + expAmount(e), 0);

    const cur = inMonth(month);
    const monthTotal = sum(cur);
    const monthPaid = sum(cur.filter((e) => e.status === 'paid'));
    const prevTotal = sum(inMonth(monthShift(month, -1)));

    const pending = live.filter((e) => e.status === 'pending');
    const overdue = pending.filter((e) => e.dueDate < today).sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
    const week = pending.filter((e) => e.dueDate >= today && diffDays(e.dueDate, today) <= 7);

    const months = [];
    for (let i = 5; i >= 0; i--) {
      const k = monthShift(month, -i);
      const items = inMonth(k);
      months.push({ key: k, label: MONTHS_SHORT[Number(k.slice(5)) - 1], paid: sum(items.filter((e) => e.status === 'paid')), pending: sum(items.filter((e) => e.status !== 'paid')) });
    }

    const byCat = {};
    for (const e of cur) byCat[e.category || 'Boshqa'] = (byCat[e.category || 'Boshqa'] || 0) + expAmount(e);
    const categories = Object.entries(byCat).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);

    const from = addDays(today, -30);
    const recent = state.shifts.filter((s) => s.date >= from && s.date <= today && state.tasks.some((t) => t.id === s.taskId));
    const done = recent.filter((s) => s.status === 'done').length;
    const closed = recent.filter((s) => s.status === 'done' || s.date < today).length;

    return {
      monthTotal, monthPaid, monthLeft: monthTotal - monthPaid, prevTotal,
      delta: prevTotal ? (monthTotal - prevTotal) / prevTotal : null,
      overdue, overdueSum: sum(overdue), week, weekSum: sum(week),
      months, categories,
      dutyRate: closed ? done / closed : null, dutyDone: done, dutyClosed: closed,
    };
  }

  /* ───────────────────────── Telegram xabarlari ───────────────────────── */
  function mention(state, id) {
    const e = emp(state, id);
    if (!e) return '<i>belgilanmagan</i>';
    if (e.username) return '@' + esc(e.username);
    if (e.telegramId) return `<a href="tg://user?id=${esc(e.telegramId)}">${esc(e.name)}</a>`;
    return `<b>${esc(e.name)}</b>`;
  }
  const mentions = (state, ids) => (ids && ids.length ? ids.map((id) => mention(state, id)).join(', ') : '<i>belgilanmagan</i>');

  /** kind: 'remind' | 'overdue' | 'paid' | 'manual' */
  function msgExpense(state, e, kind, today) {
    const cur = state.settings.currency;
    const n = diffDays(e.dueDate, today);
    let head;
    if (kind === 'paid') head = '✅ <b>To‘lov amalga oshirildi</b>';
    else if (n < 0) head = `⚠️ <b>To‘lov ${-n} kunga kechikmoqda</b>`;
    else if (n === 0) head = '🔔 <b>Bugun to‘lov kuni</b>';
    else head = `🔔 <b>To‘lovga ${n} kun qoldi</b>`;
    const lines = [head, '', `<b>${esc(e.title)}</b> — ${money(kind === 'paid' ? expAmount(e) : e.amount, cur)}`,
      `📅 ${fmtDateLong(e.dueDate)}`, `🏷 ${esc(e.category || 'Boshqa')}${isRecurring(e) ? ' · 🔁 ' + recLabel(e.recurrence).toLowerCase() : ''}`,
      `👤 Mas’ul: ${mention(state, e.assigneeId)}`];
    if (e.note) lines.push(`💬 ${esc(e.note)}`);
    if (kind === 'paid') lines.push('', `✔️ ${esc(e.paidBy || '')}${e.paidDate ? ', ' + fmtDate(e.paidDate) : ''}`);
    const buttons = kind === 'paid' ? [] : [[{ text: '✅ To‘landi', callback_data: 'pay:' + e.id }]];
    return { text: lines.join('\n'), buttons };
  }

  /** kind: 'today' | 'tomorrow' | 'done' */
  function msgShift(state, task, date, ids, kind, shift) {
    const who = mentions(state, ids);
    const lines = [];
    if (kind === 'tomorrow') {
      lines.push('🗓 <b>Ertangi navbatchilik</b>', '', `${esc(task.emoji || '🧹')} <b>${esc(task.title)}</b>`, `👤 ${who}`, `📅 ${fmtDateLong(date)}`);
    } else {
      lines.push(kind === 'done' ? '✅ <b>Navbatchilik bajarildi</b>' : '🧹 <b>Bugungi navbatchilik</b>', '',
        `${esc(task.emoji || '🧹')} <b>${esc(task.title)}</b>`, `👤 ${who}`, `📅 ${fmtDateLong(date)}`);
    }
    if (task.description) lines.push(`📋 ${esc(task.description)}`);
    if (kind === 'done' && shift) lines.push('', `✔️ ${esc(shift.doneBy || '')}`);
    const buttons = kind === 'today' && shift ? [[{ text: '✅ Bajarildi', callback_data: 'done:' + shift.id }]] : [];
    return { text: lines.join('\n'), buttons };
  }

  /** Hozir yuborilishi kerak bo‘lgan (hali yuborilmagan) eslatmalar. */
  function dueNotifications(state, now) {
    const S = state.settings, out = [], sent = state.sent;
    if (S.expenseChat && now.minutes >= toMin(S.expenseTime)) {
      for (const e of state.expenses) {
        if (e.status !== 'pending') continue;
        const days = Array.isArray(e.remindDays) ? e.remindDays : S.remindDays;
        for (const d of days) {
          if (addDays(e.dueDate, -d) !== now.date) continue;
          const key = `e|${e.id}|${e.dueDate}|${d}`;
          if (!sent[key]) out.push({ key, chat: S.expenseChat, ...msgExpense(state, e, 'remind', now.date), label: `${e.title} — to‘lov eslatmasi` });
        }
        if (S.overdueDaily && now.date > e.dueDate) {
          const key = `e|${e.id}|${e.dueDate}|od|${now.date}`;
          if (!sent[key]) out.push({ key, chat: S.expenseChat, ...msgExpense(state, e, 'overdue', now.date), label: `${e.title} — kechikkan to‘lov` });
        }
      }
    }
    for (const t of state.tasks) {
      if (!t.active) continue;
      const chat = t.chat || S.dutyChat;
      if (!chat) continue;
      const sh = state.shifts.find((s) => s.taskId === t.id && s.date === now.date && s.status === 'pending');
      if (sh && sh.ids.length && now.minutes >= toMin(t.time || '09:00')) {
        const key = `s|${sh.id}|day`;
        if (!sent[key]) out.push({ key, chat, ...msgShift(state, t, sh.date, sh.ids, 'today', sh), label: `${t.title} — bugungi navbat` });
      }
      if (t.dayBefore && now.minutes >= toMin(S.eveningTime)) {
        const tm = addDays(now.date, 1);
        const p = projectTask(state, t, tm, tm, now.date)[0];
        const key = `t|${t.id}|${tm}|eve`;
        if (p && p.ids.length && !sent[key]) out.push({ key, chat, ...msgShift(state, t, tm, p.ids, 'tomorrow'), label: `${t.title} — ertangi navbat` });
      }
    }
    return out;
  }

  /* ───────────────────────── Amallar ───────────────────────── */
  function fail(msg) { const e = new Error(msg); e.userError = true; throw e; }
  const clean = (s, max) => String(s == null ? '' : s).trim().slice(0, max || 200);
  const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));
  const isTime = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(s || ''));

  function log(state, ctx, type, text) {
    state.activity.unshift({ id: uid('a'), at: ctx.now.ts, type, text, actor: ctx.actor || 'Admin' });
    if (state.activity.length > 400) state.activity.length = 400;
  }

  const actions = {
    /* Xodimlar */
    'employee.save'(s, p, ctx) {
      const name = clean(p.name, 80);
      if (!name) fail('Xodim ismini kiriting');
      const username = clean(p.username, 64).replace(/^@+/, '').replace(/^https?:\/\/t\.me\//, '');
      if (username && !/^[A-Za-z0-9_]{4,32}$/.test(username)) fail('Telegram username noto‘g‘ri (faqat lotin harflari, raqam va _)');
      const telegramId = clean(p.telegramId, 20);
      if (telegramId && !/^\d{4,20}$/.test(telegramId)) fail('Telegram ID faqat raqamlardan iborat bo‘lishi kerak');
      if (username && s.employees.some((e) => e.id !== p.id && e.username && e.username.toLowerCase() === username.toLowerCase())) fail('Bu username boshqa xodimga biriktirilgan');
      const data = {
        name, username, position: clean(p.position, 80),
        telegramId: telegramId || null,
        awayFrom: isDate(p.awayFrom) ? p.awayFrom : null,
        awayTo: isDate(p.awayTo) ? p.awayTo : null,
        active: p.active !== false,
      };
      if (p.id) {
        const e = emp(s, p.id);
        if (!e) fail('Xodim topilmadi');
        if (!telegramId && e.username && username.toLowerCase() === e.username.toLowerCase()) data.telegramId = e.telegramId || null;
        Object.assign(e, data);
        log(s, ctx, 'employee', `${name} ma’lumotlari yangilandi`);
        return { id: e.id };
      }
      const e = Object.assign({ id: uid('u'), createdAt: ctx.now.ts }, data);
      s.employees.push(e);
      log(s, ctx, 'employee', `${name} jamoaga qo‘shildi`);
      return { id: e.id };
    },
    'employee.delete'(s, p, ctx) {
      const e = emp(s, p.id);
      if (!e) fail('Xodim topilmadi');
      s.employees = s.employees.filter((x) => x.id !== e.id);
      for (const t of s.tasks) t.queue = (t.queue || []).filter((id) => id !== e.id);
      for (const [k, ids] of Object.entries(s.overrides)) { s.overrides[k] = ids.filter((id) => id !== e.id); if (!s.overrides[k].length) delete s.overrides[k]; }
      for (const x of s.expenses) if (x.assigneeId === e.id) x.assigneeId = null;
      log(s, ctx, 'employee', `${e.name} jamoadan o‘chirildi`);
      return {};
    },

    /* Xarajatlar */
    'expense.save'(s, p, ctx) {
      const title = clean(p.title, 120);
      if (!title) fail('Xarajat nomini kiriting');
      const amount = Math.round(Number(String(p.amount).replace(/[^\d.]/g, '')));
      if (!(amount > 0)) fail('Summani to‘g‘ri kiriting');
      if (!isDate(p.dueDate)) fail('To‘lov sanasini tanlang');
      const r = p.recurrence || {};
      const recurrence = ['weekly', 'monthly', 'quarterly', 'yearly', 'custom'].includes(r.type)
        ? { type: r.type, interval: Math.min(365, Math.max(1, Number(r.interval) || 1)), unit: ['day', 'week', 'month'].includes(r.unit) ? r.unit : 'month' }
        : { type: 'none' };
      const remindDays = Array.isArray(p.remindDays)
        ? [...new Set(p.remindDays.map(Number).filter((n) => n >= 0 && n <= 60))].sort((a, b) => b - a)
        : s.settings.remindDays.slice();
      const data = {
        title, amount, dueDate: p.dueDate, recurrence, remindDays,
        category: clean(p.category, 60) || 'Boshqa',
        assigneeId: p.assigneeId && emp(s, p.assigneeId) ? p.assigneeId : null,
        note: clean(p.note, 500),
      };
      if (p.id) {
        const e = s.expenses.find((x) => x.id === p.id);
        if (!e) fail('Xarajat topilmadi');
        if (e.dueDate !== data.dueDate) data.anchorDay = Number(data.dueDate.slice(8));
        Object.assign(e, data);
        log(s, ctx, 'expense', `«${title}» xarajati tahrirlandi`);
        return { id: e.id };
      }
      const e = Object.assign({ id: uid('e'), status: 'pending', anchorDay: Number(data.dueDate.slice(8)), createdAt: ctx.now.ts }, data);
      s.expenses.push(e);
      log(s, ctx, 'expense', `«${title}» xarajati qo‘shildi — ${money(amount, s.settings.currency)}`);
      return { id: e.id };
    },
    'expense.pay'(s, p, ctx) {
      const e = s.expenses.find((x) => x.id === p.id);
      if (!e) fail('Xarajat topilmadi');
      if (e.status === 'paid') fail('Bu xarajat allaqachon to‘langan');
      const paidAmount = p.amount != null && p.amount !== '' ? Math.round(Number(String(p.amount).replace(/[^\d.]/g, ''))) : e.amount;
      if (!(paidAmount > 0)) fail('To‘langan summani kiriting');
      e.status = 'paid';
      e.paidAmount = paidAmount;
      e.paidDate = isDate(p.date) ? p.date : ctx.now.date;
      e.paidAt = ctx.now.ts;
      e.paidBy = ctx.actor || 'Admin';
      let next = null;
      if (isRecurring(e)) {
        const due = nextDue(e);
        next = {
          id: uid('e'), status: 'pending', title: e.title, amount: e.amount, category: e.category, assigneeId: e.assigneeId,
          note: e.note, recurrence: e.recurrence, remindDays: e.remindDays, dueDate: due, anchorDay: e.anchorDay, createdAt: ctx.now.ts, prevId: e.id,
        };
        s.expenses.push(next);
        e.nextId = next.id;
      }
      log(s, ctx, 'paid', `«${e.title}» to‘landi — ${money(paidAmount, s.settings.currency)}${next ? ` · keyingisi ${fmtDate(next.dueDate)}` : ''}`);
      return { id: e.id, nextId: next && next.id };
    },
    'expense.unpay'(s, p, ctx) {
      const e = s.expenses.find((x) => x.id === p.id);
      if (!e || e.status !== 'paid') fail('Xarajat topilmadi');
      if (e.nextId) {
        const n = s.expenses.find((x) => x.id === e.nextId);
        if (n && n.status === 'pending') s.expenses = s.expenses.filter((x) => x.id !== n.id);
      }
      Object.assign(e, { status: 'pending', paidAmount: null, paidDate: null, paidAt: null, paidBy: null, nextId: null });
      log(s, ctx, 'expense', `«${e.title}» to‘lovi bekor qilindi`);
      return {};
    },
    'expense.delete'(s, p, ctx) {
      const e = s.expenses.find((x) => x.id === p.id);
      if (!e) fail('Xarajat topilmadi');
      s.expenses = s.expenses.filter((x) => x.id !== e.id);
      log(s, ctx, 'expense', `«${e.title}» xarajati o‘chirildi`);
      return {};
    },

    /* Navbatchilik vazifalari */
    'task.save'(s, p, ctx) {
      const title = clean(p.title, 80);
      if (!title) fail('Vazifa nomini kiriting');
      const sc = p.schedule || {};
      const type = ['daily', 'weekly', 'interval'].includes(sc.type) ? sc.type : 'daily';
      const weekdays = [...new Set((sc.weekdays || []).map(Number).filter((d) => d >= 1 && d <= 7))];
      if (type === 'weekly' && !weekdays.length) fail('Kamida bitta hafta kunini tanlang');
      const startDate = isDate(sc.startDate) ? sc.startDate : ctx.now.date;
      const queue = [...new Set((p.queue || []).filter((id) => emp(s, id)))];
      if (!queue.length) fail('Navbatga kamida bitta xodim qo‘shing');
      if (p.time && !isTime(p.time)) fail('Vaqtni SS:DD formatida kiriting');
      const data = {
        title, emoji: clean(p.emoji, 8) || '🧹', description: clean(p.description, 300),
        schedule: { type, weekdays, every: Math.min(60, Math.max(1, Number(sc.every) || 2)), workdaysOnly: !!sc.workdaysOnly, startDate },
        time: p.time || '09:00', dayBefore: !!p.dayBefore,
        perShift: Math.min(5, Math.max(1, Number(p.perShift) || 1)),
        rotateBy: p.rotateBy === 'week' ? 'week' : 'shift',
        chat: p.chat || null, queue,
      };
      if (p.id) {
        const t = s.tasks.find((x) => x.id === p.id);
        if (!t) fail('Vazifa topilmadi');
        if (!t.cursor || startDate > t.cursor) t.cursor = startDate < ctx.now.date ? ctx.now.date : startDate;
        Object.assign(t, data);
        log(s, ctx, 'task', `«${title}» navbatchiligi yangilandi`);
        return { id: t.id };
      }
      const t = Object.assign({ id: uid('t'), active: true, createdAt: ctx.now.ts, cursor: startDate < ctx.now.date ? ctx.now.date : startDate, lastDate: null, lastIds: [] }, data);
      s.tasks.push(t);
      log(s, ctx, 'task', `«${title}» navbatchiligi yaratildi`);
      return { id: t.id };
    },
    'task.toggle'(s, p, ctx) {
      const t = s.tasks.find((x) => x.id === p.id);
      if (!t) fail('Vazifa topilmadi');
      t.active = !!p.active;
      log(s, ctx, 'task', `«${t.title}» ${t.active ? 'faollashtirildi' : 'to‘xtatildi'}`);
      return {};
    },
    'task.delete'(s, p, ctx) {
      const t = s.tasks.find((x) => x.id === p.id);
      if (!t) fail('Vazifa topilmadi');
      s.tasks = s.tasks.filter((x) => x.id !== t.id);
      s.shifts = s.shifts.filter((x) => x.taskId !== t.id);
      for (const k of Object.keys(s.overrides)) if (k.startsWith(t.id + '|')) delete s.overrides[k];
      log(s, ctx, 'task', `«${t.title}» navbatchiligi o‘chirildi`);
      return {};
    },
    'task.queue'(s, p, ctx) {
      const t = s.tasks.find((x) => x.id === p.id);
      if (!t) fail('Vazifa topilmadi');
      const q = [...new Set((p.queue || []).filter((id) => emp(s, id)))];
      if (!q.length) fail('Navbat bo‘sh bo‘lishi mumkin emas');
      t.queue = q;
      return {};
    },

    /* Navbatlar */
    'shift.done'(s, p, ctx) {
      const sh = s.shifts.find((x) => x.id === p.id);
      if (!sh) fail('Navbat topilmadi');
      if (sh.status === 'done') fail('Bu navbat allaqachon bajarilgan');
      sh.status = 'done'; sh.doneAt = ctx.now.ts; sh.doneBy = ctx.actor || 'Admin';
      const t = s.tasks.find((x) => x.id === sh.taskId);
      log(s, ctx, 'done', `«${t ? t.title : 'Navbatchilik'}» bajarildi — ${sh.ids.map((id) => empName(s, id)).join(', ')}`);
      return {};
    },
    'shift.undo'(s, p) {
      const sh = s.shifts.find((x) => x.id === p.id);
      if (!sh) fail('Navbat topilmadi');
      sh.status = 'pending'; sh.doneAt = null; sh.doneBy = null;
      return {};
    },
    'shift.reassign'(s, p, ctx) {
      const sh = s.shifts.find((x) => x.id === p.id);
      if (!sh) fail('Navbat topilmadi');
      const t = s.tasks.find((x) => x.id === sh.taskId);
      const ids = [...new Set((p.ids || []).filter((id) => emp(s, id)))];
      if (!ids.length) fail('Kamida bitta xodimni tanlang');
      applyReassign(t, sh, ids);
      log(s, ctx, 'task', `«${t ? t.title : ''}» (${fmtDate(sh.date)}) — ${ids.map((id) => empName(s, id)).join(', ')} ga o‘tkazildi`);
      return {};
    },
    'shift.skip'(s, p, ctx) {
      const sh = s.shifts.find((x) => x.id === p.id);
      if (!sh) fail('Navbat topilmadi');
      const t = s.tasks.find((x) => x.id === sh.taskId);
      if (!t) fail('Vazifa topilmadi');
      const n = Math.max(1, sh.ids.length || 1);
      const q = (t.queue || []).slice();
      const ids = [];
      for (const id of q) { if (ids.length >= n) break; if (!sh.ids.includes(id) && isAvailable(s, id, sh.date)) ids.push(id); }
      if (!ids.length) fail('Navbatda bo‘sh xodim qolmadi');
      const before = sh.ids.map((id) => empName(s, id)).join(', ');
      applyReassign(t, sh, ids);
      log(s, ctx, 'task', `«${t.title}»: ${before} o‘rniga ${ids.map((id) => empName(s, id)).join(', ')} (navbat saqlanadi)`);
      return {};
    },
    'override.set'(s, p, ctx) {
      const t = s.tasks.find((x) => x.id === p.taskId);
      if (!t || !isDate(p.date)) fail('Noto‘g‘ri so‘rov');
      const ids = [...new Set((p.ids || []).filter((id) => emp(s, id)))];
      if (!ids.length) fail('Kamida bitta xodimni tanlang');
      s.overrides[t.id + '|' + p.date] = ids;
      log(s, ctx, 'task', `«${t.title}» (${fmtDate(p.date)}) — ${ids.map((id) => empName(s, id)).join(', ')} tayinlandi`);
      return {};
    },
    'override.clear'(s, p) {
      delete s.overrides[p.taskId + '|' + p.date];
      return {};
    },

    /* Sozlamalar */
    'settings.save'(s, p, ctx) {
      const S = s.settings;
      if (p.officeName != null) S.officeName = clean(p.officeName, 60) || 'Ofis';
      if (p.currency && ['UZS', 'USD', 'EUR'].includes(p.currency)) S.currency = p.currency;
      if (p.timezone) { try { new Intl.DateTimeFormat('en', { timeZone: p.timezone }); S.timezone = p.timezone; } catch (e) { fail('Vaqt zonasi noto‘g‘ri'); } }
      if (Array.isArray(p.workdays)) { const w = [...new Set(p.workdays.map(Number).filter((d) => d >= 1 && d <= 7))].sort(); if (!w.length) fail('Ish kunlarini tanlang'); S.workdays = w; }
      if (p.expenseTime != null) { if (!isTime(p.expenseTime)) fail('Vaqt noto‘g‘ri'); S.expenseTime = p.expenseTime; }
      if (p.eveningTime != null) { if (!isTime(p.eveningTime)) fail('Vaqt noto‘g‘ri'); S.eveningTime = p.eveningTime; }
      if (Array.isArray(p.remindDays)) S.remindDays = [...new Set(p.remindDays.map(Number).filter((n) => n >= 0 && n <= 60))].sort((a, b) => b - a);
      if (p.overdueDaily != null) S.overdueDaily = !!p.overdueDaily;
      if (Array.isArray(p.categories)) { const c = [...new Set(p.categories.map((x) => clean(x, 40)).filter(Boolean))]; if (!c.length) fail('Kamida bitta kategoriya bo‘lsin'); S.categories = c; }
      if ('expenseChat' in p) S.expenseChat = p.expenseChat || null;
      if ('dutyChat' in p) S.dutyChat = p.dutyChat || null;
      log(s, ctx, 'settings', 'Sozlamalar yangilandi');
      return {};
    },
  };

  function applyReassign(t, sh, ids) {
    const removed = sh.ids.filter((id) => !ids.includes(id));
    const added = ids.filter((id) => !sh.ids.includes(id));
    if (t) {
      t.queue = t.queue || [];
      moveToFront(t.queue, removed); // o‘tkazib yuborgan xodim navbatini yo‘qotmaydi
      moveToEnd(t.queue, added);
      if (t.lastDate === sh.date) t.lastIds = ids.slice();
    }
    sh.ids = ids;
  }

  function apply(state, type, payload, ctx) {
    const fn = actions[type];
    if (!fn) fail('Noma’lum amal: ' + type);
    return fn(state, payload || {}, ctx) || {};
  }

  return {
    // sanalar
    addDays, addMonths, diffDays, weekday, weekKey, toMin, nowIn, monthShift,
    // format
    MONTHS, MONTHS_SHORT, WD, WD_SHORT, esc, fmtDate, fmtDateLong, monthLabel, relDay, money, moneyShort, hue, initials, uid,
    // holat
    defaultState, normalize, emp, empName, isAvailable, awayNow, DEFAULT_CATEGORIES,
    // xarajatlar
    recLabel, isRecurring, nextDue, expStatus, expAmount,
    // navbatchilik
    matches, scheduleLabel, projectTask, upcoming, shiftState, tick,
    // statistika va xabarlar
    stats, mention, msgExpense, msgShift, dueNotifications,
    // amallar
    apply, actions, log,
  };
});

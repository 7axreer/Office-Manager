/* Demo rejimi: server o‘rniga brauzer ichida ishlaydigan API (namunaviy ma’lumotlar bilan). */
(function () {
  'use strict';
  const C = window.Core;
  const TZ = 'Asia/Tashkent';
  let state;

  function seed() {
    const s = C.defaultState();
    s.settings.officeName = 'Nurli Studio';
    s.settings.timezone = TZ;
    s.settings.workdays = [1, 2, 3, 4, 5];
    const now = C.nowIn(TZ);
    const T = now.date;
    const ctx = (date) => ({ now: { date, time: '10:00', minutes: 600, ts: new Date(Date.parse(date + 'T05:00:00Z')).toISOString() }, actor: 'Admin' });

    const people = [
      ['Aziz Karimov', 'Ofis menejeri', 'aziz_karimov', '5120034411'],
      ['Dilnoza Rahimova', 'UI/UX dizayner', 'dilnoza_design', '6034417720'],
      ['Jasur Tursunov', 'Backend dasturchi', 'jasur_dev', ''],
      ['Malika Yusupova', 'HR menejer', 'malika_hr', '5577120034'],
      ['Sardor Aliyev', 'Frontend dasturchi', 'sardor_fe', '6120087733'],
      ['Nodira Qodirova', 'Buxgalter', 'nodira_q', '5901234477'],
    ];
    const ids = people.map(([name, position, username, telegramId]) => C.apply(s, 'employee.save', { name, position, username, telegramId }, ctx(C.addDays(T, -60))).id);
    const [aziz, dilnoza, jasur, malika, sardor, nodira] = ids;
    // Sardor ta’tilda: 2 kundan keyin 5 kun
    const sa = s.employees.find((e) => e.id === sardor);
    sa.awayFrom = C.addDays(T, 2); sa.awayTo = C.addDays(T, 6);

    /* Xarajatlar: oxirgi 5 oy tarixi + joriy/keyingi to‘lovlar */
    const series = [
      { title: 'Ofis ijarasi', amount: 14500000, category: 'Ijara', day: 1, who: nodira, note: 'Shartnoma №17/2025, bank o‘tkazmasi', remind: [7, 3, 1, 0] },
      { title: 'Internet (200 Mbit/s)', amount: 890000, category: 'Internet va aloqa', day: 5, who: aziz },
      { title: 'Elektr energiya', amount: 1250000, category: 'Kommunal', day: 10, who: aziz, vary: 0.22 },
      { title: 'Dizayn dasturlari obunasi', amount: 2100000, category: 'Dasturlar', day: 12, who: dilnoza },
      { title: 'Suv va kanalizatsiya', amount: 185000, category: 'Kommunal', day: 15, who: aziz, vary: 0.15 },
      { title: 'Tozalash vositalari', amount: 420000, category: 'Xo‘jalik', day: 20, who: malika, vary: 0.2 },
      { title: 'Kofe va choy', amount: 650000, category: 'Oziq-ovqat', lateBy: 3, who: malika, vary: 0.12 },
      { title: 'Ichimlik suvi (19 l)', amount: 240000, category: 'Oziq-ovqat', lateBy: 1, who: jasur },
    ];
    let k = 0;
    const jitter = (amt, v, i) => (v ? Math.round((amt * (1 + v * Math.sin(i * 2.3 + amt % 7))) / 1000) * 1000 : amt);
    for (const sr of series) {
      const dates = [];
      if (sr.lateBy) {
        const last = C.addDays(T, -sr.lateBy);
        for (let i = -5; i <= 0; i++) dates.push(C.addMonths(last, i, Number(last.slice(8))));
      } else {
        const m0 = T.slice(0, 7);
        for (let i = -5; i <= 2; i++) {
          const d = C.monthShift(m0, i) + '-' + String(sr.day).padStart(2, '0');
          dates.push(d);
          if (d >= T) break;
        }
      }
      dates.forEach((d, i) => {
        const amt = jitter(sr.amount, sr.vary, i + k);
        const id = C.apply(s, 'expense.save', { title: sr.title, amount: amt, dueDate: d, category: sr.category, assigneeId: sr.who, note: sr.note || '', recurrence: { type: 'monthly' }, remindDays: sr.remind || [3, 1, 0] }, ctx(C.addDays(d, -20))).id;
        const isLast = i === dates.length - 1;
        if (!isLast) {
          const e = s.expenses.find((x) => x.id === id);
          Object.assign(e, { status: 'paid', paidAmount: amt, paidDate: C.addDays(d, -(i % 2)), paidAt: new Date(Date.parse(d + 'T06:30:00Z')).toISOString(), paidBy: (C.emp(s, sr.who) || {}).name || 'Admin', nextId: null });
        }
      });
      k += 3;
    }
    C.apply(s, 'expense.save', { title: 'Konditsioner servisi', amount: 900000, dueDate: C.addDays(T, 4), category: 'Jihozlar', assigneeId: aziz, note: '3 ta blok, filtr almashtirish', recurrence: { type: 'none' } }, ctx(C.addDays(T, -6)));
    C.apply(s, 'expense.save', { title: 'Yong‘in xavfsizligi tekshiruvi', amount: 1800000, dueDate: C.addDays(T, 23), category: 'Boshqa', assigneeId: nodira, recurrence: { type: 'yearly' } }, ctx(C.addDays(T, -10)));

    /* Navbatchilik */
    const start = C.addDays(T, -35);
    const mk = (p) => { p.schedule.startDate = start; return C.apply(s, 'task.save', p, ctx(start)).id; };
    mk({ title: 'Oshxonani tozalash', emoji: '🍽️', description: 'Idishlarni yuvish, stol va rakovinani artish', schedule: { type: 'daily', workdaysOnly: true }, time: '17:00', dayBefore: true, perShift: 1, queue: [malika, jasur, dilnoza, aziz, sardor, nodira] });
    mk({ title: 'Axlatni chiqarish', emoji: '🗑️', schedule: { type: 'weekly', weekdays: [1, 3, 5] }, time: '18:00', dayBefore: false, perShift: 1, queue: [jasur, sardor, aziz, dilnoza] });
    mk({ title: 'Ofisni umumiy tozalash', emoji: '🧹', description: 'Changni artish, stollarni tartibga keltirish', schedule: { type: 'weekly', weekdays: [5] }, time: '15:30', dayBefore: true, perShift: 2, queue: [nodira, dilnoza, jasur, malika, aziz, sardor] });
    mk({ title: 'Gullarni sug‘orish', emoji: '🪴', schedule: { type: 'interval', every: 3, workdaysOnly: false }, time: '10:00', dayBefore: false, perShift: 1, rotateBy: 'week', queue: [dilnoza, malika, nodira] });
    for (const t of s.tasks) t.cursor = start;

    // O‘tgan kunlarni simulyatsiya qilish
    for (let d = start; d < T; d = C.addDays(d, 1)) C.tick(s, { date: d, time: '00:01', minutes: 1, ts: d + 'T00:01:00Z' });
    let n = 0;
    for (const sh of s.shifts) {
      n++;
      if (n % 11 === 4) continue; // bir nechtasi bajarilmagan
      sh.status = 'done';
      sh.doneAt = new Date(Date.parse(sh.date + 'T12:40:00Z')).toISOString();
      sh.doneBy = (C.emp(s, sh.ids[0]) || {}).name || 'Admin';
    }
    C.tick(s, now);

    /* Telegram */
    s.bots = [{ id: 'b_demo', username: 'nurli_ofis_bot', name: 'Nurli ofis yordamchisi', active: true, token: 'demo' }];
    s.chats = [
      { key: 'b_demo:-1002041187733', botId: 'b_demo', chatId: '-1002041187733', title: 'Nurli Studio · Umumiy', type: 'supergroup' },
      { key: 'b_demo:-1002041190012', botId: 'b_demo', chatId: '-1002041190012', title: 'Nurli · Moliya', type: 'supergroup' },
    ];
    s.settings.dutyChat = s.chats[0].key;
    s.settings.expenseChat = s.chats[1].key;

    /* Faoliyat tarixi — oxirgi hodisalardan */
    s.activity = [];
    const acts = [];
    for (const e of s.expenses) if (e.status === 'paid' && C.diffDays(T, e.paidDate) <= 14) acts.push({ at: e.paidAt, type: 'paid', text: `«${e.title}» to‘landi — ${C.money(e.paidAmount, 'UZS')}`, actor: e.paidBy });
    for (const sh of s.shifts) {
      if (sh.status !== 'done' || C.diffDays(T, sh.date) > 4) continue;
      const t = s.tasks.find((x) => x.id === sh.taskId);
      acts.push({ at: sh.doneAt, type: 'done', text: `«${t.title}» bajarildi — ${sh.ids.map((id) => C.empName(s, id)).join(', ')}`, actor: sh.doneBy });
    }
    const at = (daysAgo, h, m) => new Date(Date.parse(C.addDays(T, -daysAgo) + `T${String(h - 5).padStart(2, '0')}:${String(m).padStart(2, '0')}:00Z`)).toISOString();
    acts.push({ at: at(0, 10, 0), type: 'telegram', text: 'Telegramga yuborildi: Ofis ijarasi — to‘lov eslatmasi', actor: 'Bot' });
    acts.push({ at: at(0, 10, 0), type: 'telegram', text: 'Telegramga yuborildi: Kofe va choy — kechikkan to‘lov', actor: 'Bot' });
    acts.push({ at: at(1, 18, 0), type: 'telegram', text: 'Telegramga yuborildi: Oshxonani tozalash — ertangi navbat', actor: 'Bot' });
    acts.push({ at: at(2, 11, 24), type: 'employee', text: 'Sardor Aliyev Telegram orqali bog‘landi', actor: 'Bot' });
    acts.push({ at: at(6, 9, 12), type: 'expense', text: '«Konditsioner servisi» xarajati qo‘shildi — 900 000 so‘m', actor: 'Admin' });
    const nowMs = Date.now();
    s.activity = acts.filter((a) => a.at && Date.parse(a.at) <= nowMs).sort((a, b) => (a.at < b.at ? 1 : -1)).map((a, i) => Object.assign({ id: 'a' + i }, a));
    return s;
  }

  const clone = (x) => JSON.parse(JSON.stringify(x));
  const ctx = () => ({ now: C.nowIn(state.settings.timezone), actor: 'Admin' });
  function view() {
    const out = clone(state);
    delete out.sent;
    out.bots = state.bots.map((b) => ({ id: b.id, username: b.username, name: b.name, active: true, tokenHint: '••••' + (b.token === 'demo' ? 'd3mo' : String(b.token).slice(-4)), status: 'ok' }));
    out.serverNow = C.nowIn(state.settings.timezone);
    return out;
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const fail = (m) => { throw new Error(m); };

  state = seed();

  window.API = {
    demo: true,
    onUnauthorized: null,
    async session() { return { authed: true, officeName: state.settings.officeName }; },
    async state() { C.tick(state, ctx().now); return view(); },
    async action(type, payload) {
      const result = C.apply(state, type, payload, ctx());
      C.tick(state, ctx().now);
      return { result, state: view() };
    },
    async reset() { state = seed(); },
    async botAdd(token) {
      await wait(500);
      if (!/^\d{5,}:[A-Za-z0-9_-]{30,}$/.test(token)) fail('Token formati noto‘g‘ri. BotFather bergan tokenni to‘liq nusxalang');
      const b = { id: C.uid('b'), username: 'yangi_ofis_bot', name: 'Yangi bot', token };
      state.bots.push(b);
      C.log(state, ctx(), 'telegram', `@${b.username} boti ulandi`);
      return { state: view(), bot: b };
    },
    async botRemove(id) {
      const keys = state.chats.filter((c) => c.botId === id).map((c) => c.key);
      state.bots = state.bots.filter((b) => b.id !== id);
      state.chats = state.chats.filter((c) => c.botId !== id);
      if (keys.includes(state.settings.expenseChat)) state.settings.expenseChat = null;
      if (keys.includes(state.settings.dutyChat)) state.settings.dutyChat = null;
      return { state: view() };
    },
    async botRestart() { return { state: view() }; },
    async chatAdd(botId, chatId) {
      await wait(300);
      if (!/^-?\d{5,}$/.test(String(chatId).trim())) fail('Chat ID noto‘g‘ri (masalan: -1001234567890)');
      const key = `${botId}:${chatId}`;
      if (!state.chats.some((c) => c.key === key)) state.chats.push({ key, botId, chatId: String(chatId), title: 'Yangi guruh', type: 'supergroup' });
      return { state: view(), key };
    },
    async chatRemove(key) {
      state.chats = state.chats.filter((c) => c.key !== key);
      if (state.settings.expenseChat === key) state.settings.expenseChat = null;
      if (state.settings.dutyChat === key) state.settings.dutyChat = null;
      return { state: view() };
    },
    async test() {
      return { ok: true, preview: { text: `✅ <b>Ulanish muvaffaqiyatli</b>\n\n<b>${C.esc(state.settings.officeName)}</b> Office Manager bu guruhga xabar yubora oladi.\nXarajat va navbatchilik eslatmalari shu yerda paydo bo‘ladi.`, buttons: [] } };
    },
    async notify(kind, id) {
      const t = ctx().now.date;
      let msg;
      if (kind === 'expense') {
        const e = state.expenses.find((x) => x.id === id);
        if (!e) fail('Xarajat topilmadi');
        if (!state.settings.expenseChat) fail('Telegram guruhi tanlanmagan — Telegram bo‘limida guruhni tanlang');
        msg = C.msgExpense(state, e, e.status === 'paid' ? 'paid' : 'remind', t);
        C.log(state, ctx(), 'telegram', `Telegramga yuborildi: ${e.title}`);
      } else {
        const sh = state.shifts.find((x) => x.id === id);
        const tk = sh && state.tasks.find((x) => x.id === sh.taskId);
        if (!tk) fail('Navbat topilmadi');
        msg = C.msgShift(state, tk, sh.date, sh.ids, 'today', sh);
        C.log(state, ctx(), 'telegram', `Telegramga yuborildi: ${tk.title}`);
      }
      return { state: view(), preview: msg };
    },
    async password() { fail('Demo rejimida mavjud emas'); },
    exportData() {},
    async importData() { fail('Demo rejimida mavjud emas'); },
  };
})();

/* Office Manager — interfeys (vanilla JS, build talab qilmaydi). */
(function () {
  'use strict';
  const C = window.Core;
  const API = window.API;
  const esc = C.esc;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ───────────────────────── Ikonlar ───────────────────────── */
  const ICONS = {
    home: '<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9v11.5h13V9"/><path d="M10 20.5v-6h4v6"/>',
    wallet: '<rect x="3" y="5.5" width="18" height="14" rx="2.5"/><path d="M3 10h18"/><path d="M16 15h2"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m9.2 15 1.9 1.9 3.8-3.8"/>',
    users: '<circle cx="9" cy="8" r="3.4"/><path d="M2.8 19.5c.8-3.3 3.3-5.2 6.2-5.2s5.4 1.9 6.2 5.2"/><path d="M15.5 4.8a3.4 3.4 0 0 1 0 6.5"/><path d="M17.6 14.6c1.8.7 3 2.3 3.5 4.9"/>',
    send: '<path d="M21 3.5 10.5 14"/><path d="M21 3.5 14.6 20.5l-4.1-6.5L4 9.9z"/>',
    sliders: '<path d="M4 6.5h9M17 6.5h3M4 12h3M11 12h9M4 17.5h11M19 17.5h1"/><circle cx="15" cy="6.5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17.5" r="2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    dots: '<circle cx="6" cy="12" r="1.1" fill="currentColor"/><circle cx="12" cy="12" r="1.1" fill="currentColor"/><circle cx="18" cy="12" r="1.1" fill="currentColor"/>',
    sun: '<circle cx="12" cy="12" r="3.8"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
    moon: '<path d="M20 14.2A8 8 0 1 1 9.8 4a6.4 6.4 0 0 0 10.2 10.2z"/>',
    bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    repeat: '<path d="m17 3 3 3-3 3"/><path d="M4 11.5V10a4 4 0 0 1 4-4h12"/><path d="m7 21-3-3 3-3"/><path d="M20 12.5V14a4 4 0 0 1-4 4H4"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    trash: '<path d="M4.5 7h15M10 11v6M14 11v6M6.5 7l.9 13h9.2l.9-13M9.5 7V4.5h5V7"/>',
    edit: '<path d="M4 20h4.2L19.5 8.7l-4.2-4.2L4 15.8z"/><path d="m13.5 6.5 4 4"/>',
    logout: '<path d="M14.5 4h4.5v16h-4.5"/><path d="m9.5 16.5-4.5-4.5 4.5-4.5M5 12h10.5"/>',
    alert: '<path d="M12 3.8 2.8 19.5h18.4z"/><path d="M12 10v4.2M12 17.2h.01"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    swap: '<path d="m7 4-3.5 3.5L7 11M3.5 7.5h14M17 13l3.5 3.5L17 20M20.5 16.5h-14"/>',
    skip: '<path d="m5 5.5 6.5 6.5L5 18.5M12.5 5.5 19 12l-6.5 6.5"/>',
    up: '<path d="m6 14.5 6-6 6 6"/>',
    down: '<path d="m6 9.5 6 6 6-6"/>',
    undo: '<path d="M9 14.5 4 9.5l5-5"/><path d="M4 9.5h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v4.5h-4.5"/>',
    download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15"/>',
    upload: '<path d="M12 15.5v-11M7.5 9 12 4.5 16.5 9M4.5 19.5h15"/>',
    link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
    tag: '<path d="M3.5 12.5V4.5h8l9 9-8 8z"/><circle cx="8" cy="9" r="1.3"/>',
    user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1-3.8 3.9-6 7.5-6s6.5 2.2 7.5 6"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    database: '<ellipse cx="12" cy="6" rx="7.5" ry="2.8"/><path d="M4.5 6v12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V6"/><path d="M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    palm: '<path d="M12 21v-9"/><path d="M12 12c-1-4-4.5-6-8-5 2 .5 3.5 2 4 4"/><path d="M12 12c1-4 4.5-6 8-5-2 .5-3.5 2-4 4"/><path d="M12 12c0-4 2-6.5 5-7.5"/>',
  };
  const icon = (n, cls) => `<svg class="i${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  /* ───────────────────────── Holat ───────────────────────── */
  const App = {
    state: null,
    route: 'dashboard',
    ui: { exp: 'active', q: '', cat: '' },
    menu: null,
  };
  const ROUTES = [
    { id: 'dashboard', label: 'Bosh sahifa', short: 'Bosh', icon: 'home' },
    { id: 'expenses', label: 'Xarajatlar', short: 'Xarajat', icon: 'wallet' },
    { id: 'duties', label: 'Navbatchilik', short: 'Navbat', icon: 'calendar' },
    { id: 'team', label: 'Jamoa', short: 'Jamoa', icon: 'users' },
    { id: 'telegram', label: 'Telegram', short: 'Telegram', icon: 'send' },
    { id: 'settings', label: 'Sozlamalar', short: 'Sozlama', icon: 'sliders' },
  ];
  const EMOJIS = ['🍽️', '🗑️', '🧹', '🧽', '🪴', '☕', '🧺', '💧', '🚪', '🧴'];

  const S = () => App.state;
  const now = () => C.nowIn(S().settings.timezone);
  const today = () => now().date;
  const cur = () => S().settings.currency;
  const money = (n) => C.money(n, cur());
  const moneyShort = (n) => C.moneyShort(n, cur());
  const emp = (id) => C.emp(S(), id);
  const task = (id) => S().tasks.find((t) => t.id === id);
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const plural = (n, w) => `${n} ta ${w}`;
  const shortName = (e) => { if (!e) return '—'; const p = e.name.split(/\s+/); return p.length > 1 ? `${p[0]} ${p[1][0]}.` : p[0]; };
  const bare = (m) => m.replace(/\u00a0so‘m$/, '');
  const curUnit = () => ({ USD: '$', EUR: '€' }[cur()] || 'so‘m');

  function avatar(id, size) {
    const e = emp(id);
    const s = size ? `;--s:${size}px` : '';
    if (!e) return `<span class="av av-empty" style="${s.slice(1)}">?</span>`;
    return `<span class="av" style="--h:${C.hue(e.id)}${s}" title="${esc(e.name)}">${esc(C.initials(e.name))}</span>`;
  }
  const avatars = (ids, size) => `<span class="av-stack">${(ids || []).map((id) => avatar(id, size)).join('')}</span>`;
  const namesOf = (ids, short) => (ids && ids.length ? ids.map((id) => esc(short ? shortName(emp(id)) : (emp(id) || {}).name || 'O‘chirilgan')).join(', ') : '<span class="muted">belgilanmagan</span>');

  function ago(iso) {
    const d = (Date.now() - Date.parse(iso)) / 1000;
    if (d < 60) return 'hozirgina';
    if (d < 3600) return `${Math.floor(d / 60)} daqiqa oldin`;
    if (d < 86400) return `${Math.floor(d / 3600)} soat oldin`;
    const n = Math.floor(d / 86400);
    if (n === 1) return 'kecha';
    if (n < 7) return `${n} kun oldin`;
    return C.fmtDate(C.nowIn(S().settings.timezone, new Date(iso)).date, today());
  }

  /* ───────────────────────── Tema ───────────────────────── */
  function getTheme() {
    const t = document.documentElement.dataset.theme;
    if (t) return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function toggleTheme() {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('om-theme', next); } catch (e) { /* e’tiborsiz */ }
    renderChrome();
  }

  /* ───────────────────────── Toast / modal / menyu ───────────────────────── */
  function toast(msg, action, kind) {
    const root = $('#toast-root');
    const el = document.createElement('div');
    el.className = 'toast' + (kind ? ' ' + kind : '');
    el.setAttribute('role', 'status');
    el.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${esc(action.label)}</button>` : ''}`;
    if (action) el.querySelector('button').onclick = () => { el.remove(); action.run(); };
    root.appendChild(el);
    setTimeout(() => el.classList.add('out'), action ? 5500 : 3200);
    setTimeout(() => el.remove(), action ? 5900 : 3600);
  }

  function modal(opts) {
    closeMenu();
    const root = $('#modal-root');
    const foot = opts.foot || `<button type="button" class="btn" data-act="modal-close">Bekor qilish</button><button class="btn primary" type="submit">${esc(opts.submit || 'Saqlash')}</button>`;
    root.innerHTML = `<div class="backdrop" data-backdrop>
      <form class="modal${opts.wide ? ' wide' : ''}" novalidate role="dialog" aria-modal="true" aria-label="${esc(opts.title)}">
        <header class="m-head"><h2>${esc(opts.title)}</h2><button type="button" class="icon-btn" data-act="modal-close" aria-label="Yopish">${icon('x')}</button></header>
        <div class="m-body">${opts.body}<p class="form-error" hidden></p></div>
        <footer class="m-foot">${foot}</footer>
      </form></div>`;
    document.body.classList.add('modal-open');
    const form = root.querySelector('form');
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (!opts.onSubmit) return closeModal();
      const btn = form.querySelector('[type=submit]');
      const errEl = form.querySelector('.form-error');
      errEl.hidden = true;
      if (btn) btn.disabled = true;
      try {
        const keep = await opts.onSubmit(form, ev.submitter);
        if (keep !== false) closeModal();
      } catch (e) {
        errEl.textContent = e.message; errEl.hidden = false;
      } finally { if (btn) btn.disabled = false; }
    });
    if (opts.onOpen) opts.onOpen(form);
    setTimeout(() => { const a = form.querySelector('[autofocus]') || form.querySelector('input:not([type=hidden]):not([type=checkbox]):not([type=radio]), select, textarea'); if (a) a.focus(); }, 40);
    return form;
  }
  function closeModal() { $('#modal-root').innerHTML = ''; document.body.classList.remove('modal-open'); }

  function confirmBox(title, text, okLabel, danger) {
    return new Promise((resolve) => {
      let answered = false;
      modal({
        title, body: `<p class="lead">${text}</p>`,
        foot: `<button type="button" class="btn" data-act="modal-close">Bekor qilish</button><button class="btn ${danger ? 'danger' : 'primary'}" type="submit">${esc(okLabel || 'Tasdiqlash')}</button>`,
        onSubmit: () => { answered = true; resolve(true); },
      });
      const obs = new MutationObserver(() => { if (!$('#modal-root').children.length) { obs.disconnect(); if (!answered) resolve(false); } });
      obs.observe($('#modal-root'), { childList: true });
    });
  }

  function openMenu(anchor, items) {
    closeMenu();
    const list = items.filter(Boolean);
    const m = document.createElement('div');
    m.className = 'menu';
    m.setAttribute('role', 'menu');
    m.innerHTML = list.map((it, i) => (it === '-' ? '<hr>' : `<button type="button" role="menuitem" class="${it.danger ? 'danger' : ''}" data-mi="${i}">${icon(it.icon)}<span>${esc(it.label)}</span></button>`)).join('');
    document.body.appendChild(m);
    const r = anchor.getBoundingClientRect();
    let top = r.bottom + window.scrollY + 4;
    let left = r.right + window.scrollX - m.offsetWidth;
    if (left < 8) left = 8;
    if (r.bottom + m.offsetHeight + 12 > window.innerHeight) top = r.top + window.scrollY - m.offsetHeight - 4;
    m.style.top = top + 'px'; m.style.left = left + 'px';
    m.addEventListener('click', (e) => {
      const b = e.target.closest('[data-mi]');
      if (!b) return;
      const it = list[b.dataset.mi];
      closeMenu();
      it.run();
    });
    App.menu = { el: m, anchor };
    const first = m.querySelector('button'); if (first) first.focus();
  }
  function closeMenu() { if (App.menu) { App.menu.el.remove(); App.menu = null; } }

  /* ───────────────────────── Ma’lumot amallari ───────────────────────── */
  async function call(type, payload) {
    const r = await API.action(type, payload);
    App.state = r.state;
    render();
    return r.result;
  }
  async function act(type, payload, okMsg, undo) {
    try {
      const res = await call(type, payload);
      if (okMsg) toast(okMsg, undo);
      return res;
    } catch (e) { toast(e.message, null, 'error'); return null; }
  }
  async function useState(promise, okMsg) {
    try {
      const r = await promise;
      if (r && r.state) { App.state = r.state; render(); }
      if (okMsg) toast(okMsg);
      return r;
    } catch (e) { toast(e.message, null, 'error'); return null; }
  }

  /* ───────────────────────── Render ───────────────────────── */
  function shell() {
    return `<div class="app">
      <aside class="side" aria-label="Asosiy menyu">
        <div class="brand" id="brand"></div>
        <nav class="nav" id="nav"></nav>
        <div class="side-foot" id="side-foot"></div>
      </aside>
      <main class="main">
        ${API.demo ? `<div class="demo-bar">Demo rejimi: namunaviy ma’lumotlar bilan. Telegram xabarlari yuborilmaydi — ularning ko‘rinishi ko‘rsatiladi. <button type="button" data-act="demo-reset">Boshlang‘ich holatga qaytarish</button></div>` : ''}
        <div class="page" id="view"></div>
      </main>
      <nav class="tabbar" id="tabbar" aria-label="Asosiy menyu"></nav>
    </div>`;
  }

  function renderChrome() {
    const st = S();
    const overdue = st.expenses.filter((e) => e.status === 'pending' && e.dueDate < today()).length;
    const badge = (id) => (id === 'expenses' && overdue ? `<span class="badge" title="Kechikkan to‘lovlar">${overdue}</span>` : '');
    $('#brand').innerHTML = `<span class="logo">${esc(C.initials(st.settings.officeName).slice(0, 1) || 'O')}</span><div><b>${esc(st.settings.officeName)}</b><small>Office Manager</small></div>`;
    $('#nav').innerHTML = ROUTES.map((r) => `<a href="#${r.id}" class="${App.route === r.id ? 'active' : ''}" ${App.route === r.id ? 'aria-current="page"' : ''}>${icon(r.icon)}<span>${r.label}</span>${badge(r.id)}</a>`).join('');
    $('#tabbar').innerHTML = ROUTES.map((r) => `<a href="#${r.id}" class="${App.route === r.id ? 'active' : ''}">${icon(r.icon)}<span>${r.short}</span>${badge(r.id)}</a>`).join('');
    const dark = getTheme() === 'dark';
    $('#side-foot').innerHTML = `<button type="button" data-act="theme">${icon(dark ? 'sun' : 'moon')}<span>${dark ? 'Yorug‘ rejim' : 'Qorong‘i rejim'}</span></button>` +
      (API.demo ? '' : `<button type="button" data-act="logout">${icon('logout')}<span>Chiqish</span></button>`);
  }

  function mobileTop() {
    const dark = getTheme() === 'dark';
    return `<div class="mobile-top"><div class="brand"><span class="logo">${esc(C.initials(S().settings.officeName).slice(0, 1) || 'O')}</span><div><b>${esc(S().settings.officeName)}</b></div></div>
      <button type="button" class="icon-btn" data-act="theme" aria-label="Tema">${icon(dark ? 'sun' : 'moon')}</button></div>`;
  }

  function render() {
    if (!App.state) return;
    const root = $('#root');
    if (!root.querySelector('.app')) root.innerHTML = shell();
    renderChrome();
    const active = document.activeElement;
    const focusId = active && active.id && root.contains(active) ? active.id : null;
    const sel = focusId && typeof active.selectionStart === 'number' ? [active.selectionStart, active.selectionEnd] : null;
    const view = VIEWS[App.route] || VIEWS.dashboard;
    $('#view').innerHTML = mobileTop() + view();
    if (focusId) {
      const el = document.getElementById(focusId);
      if (el) { el.focus(); if (sel && el.setSelectionRange) try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* */ } }
    }
  }

  /* ───────────────────────── Umumiy bo‘laklar ───────────────────────── */
  function expPill(e) {
    const t = today();
    const s = C.expStatus(e, t);
    const n = C.diffDays(e.dueDate, t);
    if (s === 'paid') return `<span class="pill ok">To‘landi</span>`;
    if (s === 'overdue') return `<span class="pill bad">${-n} kun kechikdi</span>`;
    if (s === 'today') return `<span class="pill warn">Bugun</span>`;
    if (n === 1) return `<span class="pill warn">Ertaga</span>`;
    if (n <= 3) return `<span class="pill warn">${n} kun qoldi</span>`;
    return `<span class="pill">${n} kun qoldi</span>`;
  }

  function expRow(e) {
    const t = today();
    const s = C.expStatus(e, t);
    const [, m, d] = e.dueDate.split('-');
    const a = emp(e.assigneeId);
    const rec = C.isRecurring(e) ? `<span title="${esc(C.recLabel(e.recurrence))}" aria-label="${esc(C.recLabel(e.recurrence))}">${icon('repeat')}</span>` : '';
    const meta = [`<span>${esc(e.category || 'Boshqa')}</span>`];
    if (a) meta.push(`<span class="dot-sep"></span><span class="person">${avatar(a.id, 16)}<span>${esc(shortName(a))}</span></span>`);
    if (s === 'paid' && e.paidDate) meta.push(`<span class="dot-sep"></span><span>${C.fmtDate(e.paidDate, t)} to‘landi</span>`);
    const payBtn = e.status === 'pending' ? `<button type="button" class="btn sm" data-act="pay" data-id="${e.id}" title="To‘landi deb belgilash">${icon('check', 'sm')}<span class="lbl">To‘landi</span></button>` : '';
    return `<div class="xrow ${s}">
      <div class="dchip ${s}" title="${esc(C.fmtDateLong(e.dueDate))}"><b>${Number(d)}</b><span>${C.MONTHS_SHORT[Number(m) - 1]}</span></div>
      <div class="xmain"><div class="xtitle"><span>${esc(e.title)}</span>${rec}</div><div class="xmeta">${meta.join('')}</div></div>
      <div class="xamt">${money(C.expAmount(e))}</div>
      <div class="pillcell">${expPill(e)}</div>
      <div class="xact">${payBtn}<button type="button" class="icon-btn" data-act="exp-menu" data-id="${e.id}" aria-label="Amallar">${icon('dots')}</button></div>
    </div>`;
  }

  function emptyState(ic, title, text, btn) {
    return `<div class="empty">${icon(ic)}<b>${title}</b><span>${text}</span>${btn || ''}</div>`;
  }

  function niceMax(v) {
    if (v <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const f = v / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  }

  function barChart(months) {
    const max = Math.max(0, ...months.map((m) => m.paid + m.pending));
    const top = niceMax(max);
    const ticks = [0, top / 2, top];
    const lbl = (v) => (v === 0 ? '0' : C.moneyShort(v, cur()).replace(/ so‘m$/, ''));
    const curKey = today().slice(0, 7);
    const cols = months.map((m) => {
      const total = m.paid + m.pending;
      const name = cap(C.monthLabel(m.key));
      const tip = `${name}: ${money(total)}\nTo‘langan: ${money(m.paid)}${m.pending ? `\nRejada: ${money(m.pending)}` : ''}`;
      const h = (total / top) * 100;
      return `<div class="bar-col" tabindex="0" data-tip="${esc(tip)}" aria-label="${esc(tip.replace(/\n/g, ', '))}">
        ${total ? `<div class="bar" style="height:${h}%">${m.pending ? `<i class="pending" style="flex:${m.pending}"></i>` : ''}${m.paid ? `<i class="paid" style="flex:${m.paid}"></i>` : ''}</div>` : ''}
      </div>`;
    }).join('');
    return `<div class="chart" role="img" aria-label="Oxirgi 6 oy xarajatlari">
      <div class="chart-plot">
        ${ticks.map((v, i) => `<div class="gl${i === 0 ? ' base' : ''}" style="bottom:${(v / top) * 100}%"><span>${lbl(v)}</span></div>`).join('')}
        <div class="bars">${cols}</div>
      </div>
      <div class="bar-labels">${months.map((m) => `<span class="${m.key === curKey ? 'cur' : ''}">${m.label}</span>`).join('')}</div>
    </div>`;
  }

  function catList(cats) {
    if (!cats.length) return `<p class="muted" style="font-size:13px">Bu oy hali xarajat yo‘q.</p>`;
    let list = cats.slice(0, 5);
    if (cats.length > 5) list.push({ name: 'Boshqalar', total: cats.slice(5).reduce((a, c) => a + c.total, 0) });
    const max = Math.max(...list.map((c) => c.total));
    const sum = cats.reduce((a, c) => a + c.total, 0);
    return `<div class="cats">${list.map((c) => `<div class="cat-row"><span class="n">${esc(c.name)}</span><span class="v">${moneyShort(c.total)} · ${Math.round((c.total / sum) * 100)}%</span><div class="cat-bar"><span style="width:${(c.total / max) * 100}%"></span></div></div>`).join('')}</div>`;
  }

  /* ───────────────────────── Sahifalar ───────────────────────── */
  const VIEWS = {};

  VIEWS.dashboard = function () {
    const st = S(), t = today(), n = now();
    const s = C.stats(st, t);
    const hour = Number(n.time.slice(0, 2));
    const greet = hour < 5 ? 'Xayrli tun' : hour < 12 ? 'Xayrli tong' : hour < 18 ? 'Xayrli kun' : 'Xayrli kech';
    const monthName = cap(C.monthLabel(t.slice(0, 7)));
    const prevName = C.monthLabel(C.monthShift(t.slice(0, 7), -1));
    const paidPct = s.monthTotal ? Math.round((s.monthPaid / s.monthTotal) * 100) : 0;
    const delta = s.delta == null ? '' : `<span title="${esc(prevName)}: ${esc(money(s.prevTotal))}">${s.delta >= 0 ? '↑' : '↓'} ${Math.abs(Math.round(s.delta * 100))}% ${prevName}ga nisbatan</span>`;

    const kpis = `<section class="kpis" aria-label="Asosiy ko‘rsatkichlar">
      <div class="card kpi">
        <div class="kpi-label">${monthName} xarajatlari</div>
        <div class="kpi-value" title="${esc(money(s.monthTotal))}">${esc(moneyShort(s.monthTotal))}</div>
        <div class="meter" title="${paidPct}% to‘langan"><span style="width:${paidPct}%"></span></div>
        <div class="kpi-foot"><span>${esc(bare(moneyShort(s.monthPaid)))} to‘landi</span><span>${esc(bare(moneyShort(s.monthLeft)))} qoldi</span></div>${delta ? `<div class="kpi-foot" style="margin-top:0">${delta}</div>` : ''}
      </div>
      <div class="card kpi${s.overdue.length ? ' is-bad' : ''}">
        <div class="kpi-label">${icon('alert', 'sm')} Kechikkan to‘lovlar</div>
        <div class="kpi-value">${s.overdue.length}<small>ta</small></div>
        <div class="kpi-foot">${s.overdue.length ? `<span>${esc(money(s.overdueSum))}</span>` : '<span class="ok-text">Hammasi o‘z vaqtida</span>'}</div>
      </div>
      <div class="card kpi">
        <div class="kpi-label">${icon('clock', 'sm')} Yaqin 7 kunda</div>
        <div class="kpi-value">${s.week.length}<small>ta to‘lov</small></div>
        <div class="kpi-foot"><span>${s.week.length ? esc(money(s.weekSum)) : 'Yaqin kunlarda to‘lov yo‘q'}</span></div>
      </div>
      <div class="card kpi">
        <div class="kpi-label">${icon('check', 'sm')} Navbatchilik intizomi</div>
        <div class="kpi-value">${s.dutyRate == null ? '—' : Math.round(s.dutyRate * 100) + '<small>%</small>'}</div>
        <div class="kpi-foot"><span>${s.dutyClosed ? `30 kunda ${s.dutyDone} / ${s.dutyClosed} bajarildi` : 'Hali ma’lumot yo‘q'}</span></div>
      </div>
    </section>`;

    // To‘lovlar
    const pend = st.expenses.filter((e) => e.status === 'pending' && C.diffDays(e.dueDate, t) <= 14).sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
    const payments = `<section class="card">
      <div class="card-head"><div><h2>To‘lovlar</h2><div class="card-sub">Kechikkan va yaqin 14 kundagi</div></div><a class="link" href="#expenses">Barchasi ${icon('arrow', 'sm')}</a></div>
      ${pend.length ? `<div class="xlist">${pend.slice(0, 7).map((e) => expRow(e)).join('')}</div>${pend.length > 7 ? `<div class="card-body"><a class="link" href="#expenses" style="font-size:13px;color:var(--fg-3)">Yana ${pend.length - 7} ta to‘lov</a></div>` : ''}`
        : emptyState('wallet', 'Yaqin 14 kunda to‘lov yo‘q', 'Yangi xarajat qo‘shsangiz, u shu yerda ko‘rinadi.', `<button type="button" class="btn sm" data-act="add-expense">${icon('plus', 'sm')} Xarajat qo‘shish</button>`)}
    </section>`;

    const chart = `<section class="card">
      <div class="card-head"><div><h2>Xarajatlar dinamikasi</h2><div class="card-sub">Oxirgi 6 oy, to‘lov muddati bo‘yicha</div></div>
        <div class="legend"><span><i class="sw-paid"></i>To‘langan</span><span><i class="sw-pending"></i>Rejada</span></div></div>
      <div class="chart-wrap">
        ${barChart(s.months)}
        <div><div class="subhead" style="margin-top:0">${monthName} · kategoriyalar</div>${catList(s.categories)}</div>
      </div>
    </section>`;

    // Bugun mas’ul
    const todays = st.shifts.filter((x) => x.date === t && task(x.taskId) && task(x.taskId).active);
    const dueToday = st.expenses.filter((e) => e.status === 'pending' && e.dueDate === t);
    const nextUp = C.upcoming(st, C.addDays(t, 1), C.addDays(t, 7), t);
    let hero = '';
    const mainIds = todays.length ? todays[0].ids : [];
    if (mainIds.length) {
      const e1 = emp(mainIds[0]);
      hero = `<div class="today-hero">${avatar(mainIds[0], 44)}<div><b>${esc(e1 ? e1.name : '—')}${mainIds.length > 1 ? ` <span class="muted" style="font-weight:500">+${mainIds.length - 1}</span>` : ''}</b><span class="muted">${esc(e1 && e1.position ? e1.position : 'Bugungi navbatchi')}</span></div></div>`;
    }
    const todayCard = `<section class="card today-card">
      <div class="card-head"><div><h2>Bugun mas’ul</h2><div class="card-sub">${esc(C.fmtDateLong(t))}</div></div><a class="link" href="#duties">Jadval ${icon('arrow', 'sm')}</a></div>
      <div class="card-body">
        ${hero}
        ${todays.length ? todays.map(dutyRow).join('') : `<div class="muted" style="font-size:13px;padding:4px 0 2px">Bugun navbatchilik yo‘q.${nextUp[0] ? ` Keyingisi: ${esc(C.relDay(nextUp[0].date, t))}, ${namesOf(nextUp[0].ids, true)}.` : ''}</div>`}
        ${dueToday.length ? `<div class="subhead">Bugungi to‘lovlar</div>${dueToday.map((e) => `<div class="duty"><span class="emoji">${icon('wallet')}</span><div class="dmain"><div class="dtitle">${esc(e.title)} · ${esc(moneyShort(e.amount))}</div><div class="dwho">${e.assigneeId ? avatar(e.assigneeId, 18) + `<span>${esc((emp(e.assigneeId) || {}).name || '')}</span>` : '<span class="muted">mas’ul belgilanmagan</span>'}</div></div><button type="button" class="done-btn" data-act="pay" data-id="${e.id}" title="To‘landi deb belgilash" aria-label="To‘landi deb belgilash">${icon('check', 'sm')}</button></div>`).join('')}` : ''}
      </div>
    </section>`;

    // Yaqin navbatchiliklar
    const byDay = {};
    for (const x of nextUp) (byDay[x.date] = byDay[x.date] || []).push(x);
    const days = Object.keys(byDay).sort().slice(0, 4);
    const upcomingCard = `<section class="card">
      <div class="card-head"><h2>Yaqin navbatchiliklar</h2></div>
      <div class="card-body">${days.length ? days.map((d) => `<div class="up-day"><div class="up-day-h"><b>${cap(C.relDay(d, t))}</b><span>${esc(C.WD[C.weekday(d) - 1])}, ${esc(C.fmtDate(d))}</span></div>
        ${byDay[d].map((x) => { const tk = task(x.taskId); return `<div class="up-item"><span>${esc(tk.emoji)}</span><span class="t">${esc(tk.title)}</span><span class="who">${avatars(x.ids, 20)}<span>${namesOf(x.ids, true)}</span></span></div>`; }).join('')}</div>`).join('')
        : `<p class="muted" style="font-size:13px">Navbatchilik vazifalari hali yaratilmagan. <a href="#duties">Vazifa qo‘shish</a></p>`}</div>
    </section>`;

    const feed = `<section class="card">
      <div class="card-head"><h2>Oxirgi faoliyat</h2></div>
      <div class="card-body">${st.activity.length ? `<div class="feed">${st.activity.slice(0, 7).map(feedItem).join('')}</div>` : '<p class="muted" style="font-size:13px">Hali faoliyat yo‘q.</p>'}</div>
    </section>`;

    return `<header class="page-head">
        <div><p class="eyebrow">${esc(C.fmtDateLong(t))}</p><h1>${greet}</h1></div>
        <div class="actions"><button type="button" class="btn" data-act="add-task">${icon('calendar')} Navbatchilik</button><button type="button" class="btn primary" data-act="add-expense">${icon('plus')} Xarajat</button></div>
      </header>
      ${kpis}
      <div class="dash">
        <div class="col">${payments}${chart}</div>
        <div class="col">${todayCard}${upcomingCard}${feed}</div>
      </div>`;
  };

  const FEED_ICON = { expense: 'wallet', paid: 'check', done: 'check', task: 'calendar', employee: 'user', telegram: 'send', settings: 'sliders' };
  function feedItem(a) {
    return `<div class="feed-item"><span class="feed-ico ${esc(a.type)}">${icon(FEED_ICON[a.type] || 'bell')}</span>
      <div><div class="feed-text">${esc(a.text)}</div><div class="feed-time">${esc(ago(a.at))}${a.actor && a.actor !== 'Admin' ? ' · ' + esc(a.actor) : ''}</div></div></div>`;
  }

  function dutyRow(sh) {
    const tk = task(sh.taskId);
    const done = sh.status === 'done';
    return `<div class="duty${done ? ' done' : ''}">
      <span class="emoji">${esc(tk.emoji)}</span>
      <div class="dmain"><div class="dtitle">${esc(tk.title)}</div><div class="dwho">${avatars(sh.ids, 18)}<span>${namesOf(sh.ids)}</span></div></div>
      ${done ? `<span class="done-btn is-done" title="Bajarildi">${icon('check', 'sm')}</span>` : `<button type="button" class="done-btn" data-act="shift-done" data-id="${sh.id}" title="Bajarildi deb belgilash" aria-label="Bajarildi deb belgilash">${icon('check', 'sm')}</button>`}
      <button type="button" class="icon-btn sm" data-act="shift-menu" data-id="${sh.id}" aria-label="Amallar">${icon('dots')}</button>
    </div>`;
  }

  /* Xarajatlar */
  VIEWS.expenses = function () {
    const st = S(), t = today();
    const s = C.stats(st, t);
    const all = st.expenses.filter((e) => e.status !== 'cancelled');
    const q = App.ui.q.trim().toLowerCase();
    const cat = App.ui.cat;
    const counts = {
      active: all.filter((e) => e.status === 'pending').length,
      overdue: all.filter((e) => e.status === 'pending' && e.dueDate < t).length,
      paid: all.filter((e) => e.status === 'paid').length,
      all: all.length,
    };
    let list = all.filter((e) => {
      if (App.ui.exp === 'active' && e.status !== 'pending') return false;
      if (App.ui.exp === 'overdue' && !(e.status === 'pending' && e.dueDate < t)) return false;
      if (App.ui.exp === 'paid' && e.status !== 'paid') return false;
      if (cat && e.category !== cat) return false;
      if (q && !`${e.title} ${e.note || ''} ${e.category} ${(emp(e.assigneeId) || {}).name || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });

    let groups = [];
    if (App.ui.exp === 'active' || App.ui.exp === 'overdue') {
      list.sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
      const g = { late: [], week: [], later: [] };
      for (const e of list) { const n = C.diffDays(e.dueDate, t); (n < 0 ? g.late : n <= 7 ? g.week : g.later).push(e); }
      groups = [['Kechikkan', g.late], ['7 kun ichida', g.week], ['Keyinroq', g.later]].filter((x) => x[1].length);
    } else {
      const key = (e) => (App.ui.exp === 'paid' ? e.paidDate || e.dueDate : e.dueDate).slice(0, 7);
      list.sort((a, b) => (key(a) === key(b) ? (a.dueDate < b.dueDate ? 1 : -1) : key(a) < key(b) ? 1 : -1));
      const map = new Map();
      for (const e of list) { const k = key(e); if (!map.has(k)) map.set(k, []); map.get(k).push(e); }
      groups = [...map.entries()].map(([k, arr]) => [`${cap(C.monthLabel(k))} ${k.slice(0, 4)}`, arr]);
    }
    const sumOf = (arr) => arr.reduce((a, e) => a + C.expAmount(e), 0);
    const segs = [['active', 'Faol'], ['overdue', 'Kechikkan'], ['paid', 'To‘langan'], ['all', 'Barchasi']];
    const cats = [...new Set([...st.settings.categories, ...all.map((e) => e.category)])];
    const monthName = cap(C.monthLabel(t.slice(0, 7)));

    return `<header class="page-head">
        <div><h1>Xarajatlar</h1><p class="sub">To‘lov muddatlari, takroriy to‘lovlar va mas’ul xodimlar</p></div>
        <div class="actions"><button type="button" class="btn primary" data-act="add-expense">${icon('plus')} Xarajat</button></div>
      </header>
      <section class="card summary" aria-label="Oylik xulosa">
        <div><div class="l">${monthName}: jami</div><div class="v" title="${esc(money(s.monthTotal))}">${esc(money(s.monthTotal))}</div></div>
        <div><div class="l">To‘langan</div><div class="v">${esc(money(s.monthPaid))}</div></div>
        <div><div class="l">To‘lanishi kerak</div><div class="v">${esc(money(s.monthLeft))}</div></div>
        <div><div class="l">Kechikkan</div><div class="v${s.overdue.length ? ' bad' : ''}">${esc(money(s.overdueSum))}</div></div>
      </section>
      <div class="toolbar">
        <div class="seg" role="tablist">${segs.map(([k, l]) => `<button type="button" role="tab" aria-selected="${App.ui.exp === k}" class="${App.ui.exp === k ? 'on' : ''}" data-act="exp-filter" data-v="${k}">${l} <span class="count">${counts[k]}</span></button>`).join('')}</div>
        <div class="search">${icon('search')}<input class="input" id="exp-q" type="search" placeholder="Qidirish…" value="${esc(App.ui.q)}" data-input="q" aria-label="Qidirish"></div>
        <select class="input" id="exp-cat" data-change="cat" aria-label="Kategoriya"><option value="">Barcha kategoriyalar</option>${cats.map((c) => `<option ${c === cat ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
      </div>
      <section class="card">
        ${groups.length ? groups.map(([title, arr]) => `<div class="group-h"><span>${esc(title)} · ${arr.length}</span><span class="num">${esc(money(sumOf(arr)))}</span></div>${arr.map((e) => expRow(e)).join('')}`).join('')
          : (all.length ? emptyState('search', 'Hech narsa topilmadi', 'Filtr yoki qidiruvni o‘zgartirib ko‘ring.')
            : emptyState('wallet', 'Hali xarajat yo‘q', 'Ijara, kommunal, internet kabi doimiy to‘lovlarni qo‘shing — muddati yaqinlashganda Telegram’da eslatamiz.', `<button type="button" class="btn primary sm" data-act="add-expense">${icon('plus', 'sm')} Birinchi xarajat</button>`))}
      </section>`;
  };

  /* Navbatchilik */
  VIEWS.duties = function () {
    const st = S(), t = today();
    const tasks = st.tasks.slice().sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1));
    const todays = st.shifts.filter((x) => x.date === t && task(x.taskId) && task(x.taskId).active);
    const days = Array.from({ length: 14 }, (_, i) => C.addDays(t, i));
    const up = C.upcoming(st, t, days[13], t);
    const map = new Map(up.map((x) => [x.taskId + '|' + x.date, x]));
    const work = st.settings.workdays;

    if (!st.employees.length || !tasks.length) {
      return `<header class="page-head"><div><h1>Navbatchilik</h1><p class="sub">Tozalik va navbatchilik vazifalari adolatli navbat bilan taqsimlanadi</p></div>
        <div class="actions"><button type="button" class="btn primary" data-act="add-task">${icon('plus')} Vazifa</button></div></header>
        <section class="card">${!st.employees.length
          ? emptyState('users', 'Avval jamoani qo‘shing', 'Navbatchilik xodimlar orasida taqsimlanadi.', `<a class="btn primary sm" href="#team">${icon('plus', 'sm')} Xodim qo‘shish</a>`)
          : emptyState('calendar', 'Hali vazifa yo‘q', 'Masalan: oshxonani tozalash, axlatni chiqarish, gullarni sug‘orish.', `<button type="button" class="btn primary sm" data-act="add-task">${icon('plus', 'sm')} Vazifa yaratish</button>`)}</section>`;
    }

    const todayTiles = todays.length ? `<div class="today-grid">${todays.map((sh) => {
      const tk = task(sh.taskId); const done = sh.status === 'done';
      return `<div class="card today-tile${done ? ' done' : ''}">
        <div class="top"><span class="emoji">${esc(tk.emoji)}</span><div><h3>${esc(tk.title)}</h3><div class="muted" style="font-size:12.5px">${esc(tk.time)} da eslatiladi</div></div>
          <button type="button" class="icon-btn" data-act="shift-menu" data-id="${sh.id}" aria-label="Amallar">${icon('dots')}</button></div>
        <div class="foot"><span class="person">${avatars(sh.ids, 28)}<span>${namesOf(sh.ids)}</span></span>
          ${done ? `<span class="pill ok">Bajarildi</span>` : `<button type="button" class="btn sm" data-act="shift-done" data-id="${sh.id}">${icon('check', 'sm')} Bajarildi</button>`}</div>
      </div>`;
    }).join('')}</div>` : `<div class="card"><div class="card-body" style="padding-top:14px" ><span class="muted">Bugun rejalashtirilgan navbatchilik yo‘q.</span></div></div>`;

    const grid = `<section class="card">
      <div class="card-head"><div><h2>Jadval · 14 kun</h2><div class="card-sub">Katakchani bosib, shu kunga boshqa xodimni tayinlang</div></div></div>
      <div class="sched-wrap"><table class="sched">
        <thead><tr><th scope="col"><span class="muted" style="font-size:12px;font-weight:500">Vazifa</span></th>${days.map((d) => `<th scope="col" class="${d === t ? 'is-today' : ''}${work.includes(C.weekday(d)) ? '' : ' off'}"><span class="wd">${C.WD_SHORT[C.weekday(d) - 1]}</span><span class="dn">${Number(d.slice(8))}</span></th>`).join('')}</tr></thead>
        <tbody>${tasks.map((tk) => `<tr><td><div class="task-name${tk.active ? '' : ' off-task'}"><span>${esc(tk.emoji)}</span><span>${esc(tk.title)}</span></div></td>${days.map((d) => {
          const x = map.get(tk.id + '|' + d);
          const off = work.includes(C.weekday(d)) ? '' : ' off';
          if (!x) return `<td class="cell${off}"></td>`;
          const stt = x.committed ? C.shiftState(x.shift, t) : 'plan';
          const tip = `${tk.title} — ${C.fmtDateLong(d)}\n${x.ids.map((id) => (emp(id) || {}).name || '—').join(', ') || 'belgilanmagan'}${stt === 'done' ? '\nBajarildi' : ''}${x.override ? '\nQo‘lda tayinlangan' : ''}`;
          return `<td class="cell${off}"><button type="button" class="slot ${stt}${x.override ? ' ov' : ''}" data-act="cell" data-task="${tk.id}" data-date="${d}" data-tip="${esc(tip)}" aria-label="${esc(tip.replace(/\n/g, ', '))}">${avatars(x.ids, 26)}</button></td>`;
        }).join('')}</tr>`).join('')}</tbody>
      </table></div>
    </section>`;

    const cards = `<div class="tasks">${tasks.map(taskCard).join('')}</div>`;

    return `<header class="page-head"><div><h1>Navbatchilik</h1><p class="sub">Tozalik va navbatchilik vazifalari adolatli navbat bilan taqsimlanadi</p></div>
        <div class="actions"><button type="button" class="btn primary" data-act="add-task">${icon('plus')} Vazifa</button></div></header>
      <div class="section-title"><h2>Bugun · ${esc(C.fmtDateLong(t))}</h2></div>
      ${todayTiles}
      ${grid}
      <div class="section-title"><h2>Vazifalar</h2><span class="muted" style="font-size:13px">Ta’tildagi xodim navbatini yo‘qotmaydi — qaytgach birinchi bo‘ladi</span></div>
      ${cards}`;
  };

  function taskCard(tk) {
    const st = S(), t = today();
    const next = C.upcoming(st, C.addDays(t, 1), C.addDays(t, 60), t).find((x) => x.taskId === tk.id);
    const chat = tk.chat ? st.chats.find((c) => c.key === tk.chat) : null;
    const meta = [C.scheduleLabel(tk), tk.time, `${tk.perShift} kishi`, tk.rotateBy === 'week' ? 'haftalik almashadi' : null].filter(Boolean).join(' · ');
    return `<article class="card task${tk.active ? '' : ' inactive'}">
      <div class="task-head">
        <span class="emoji">${esc(tk.emoji)}</span>
        <div><h3>${esc(tk.title)}</h3><p>${esc(meta)}</p></div>
        <label class="switch" title="${tk.active ? 'Faol' : 'To‘xtatilgan'}"><input type="checkbox" data-change="task-active" data-id="${tk.id}" ${tk.active ? 'checked' : ''} aria-label="Faol"><span></span></label>
        <button type="button" class="icon-btn" data-act="task-menu" data-id="${tk.id}" aria-label="Amallar">${icon('dots')}</button>
      </div>
      <div class="task-body">
        ${tk.description ? `<p class="soft" style="font-size:13px">${esc(tk.description)}</p>` : ''}
        <div class="kv"><span>Keyingi navbat</span>${next ? `<span class="person">${avatars(next.ids, 20)}<span>${namesOf(next.ids, true)} · ${esc(C.relDay(next.date, t))}</span></span>` : '<span class="muted">—</span>'}</div>
        ${chat ? `<div class="kv"><span>Telegram</span><span>${esc(chat.title)}</span></div>` : ''}
        <div>
          <div class="kv" style="margin-bottom:8px"><span>Navbat tartibi</span><button type="button" class="btn ghost sm" data-act="queue-edit" data-id="${tk.id}">${icon('swap', 'sm')} O‘zgartirish</button></div>
          <ol class="queue">${(tk.queue || []).map((id, i) => { const e = emp(id); const away = e && !C.isAvailable(st, id, t); return `<li class="${i === 0 ? 'first' : ''}${away ? ' away' : ''}" title="${away ? 'Hozir mavjud emas' : ''}"><span class="n">${i + 1}</span>${avatar(id, 22)}<span>${esc(shortName(e))}</span>${away ? icon('palm', 'sm') : ''}</li>`; }).join('')}</ol>
        </div>
      </div>
    </article>`;
  }

  /* Jamoa */
  VIEWS.team = function () {
    const st = S(), t = today();
    const up = C.upcoming(st, t, C.addDays(t, 45), t);
    const from = C.addDays(t, -30);
    const counts = {};
    for (const sh of st.shifts) if (sh.date >= from && sh.date <= t && sh.status === 'done') for (const id of sh.ids) counts[id] = (counts[id] || 0) + 1;
    const maxCount = Math.max(1, ...Object.values(counts));
    const linked = st.employees.filter((e) => e.telegramId).length;

    const rows = st.employees.map((e) => {
      const away = C.awayNow(e, t);
      const nextDuty = up.find((x) => x.ids.includes(e.id) && !(x.shift && x.shift.status === 'done'));
      const nextTask = nextDuty && task(nextDuty.taskId);
      const exps = st.expenses.filter((x) => x.status === 'pending' && x.assigneeId === e.id).length;
      const tasksIn = st.tasks.filter((tk) => (tk.queue || []).includes(e.id)).length;
      const tg = e.username ? `<span class="u">@${esc(e.username)}</span>` : e.telegramId ? `<span class="u mono">ID ${esc(e.telegramId)}</span>` : '<span class="muted">Telegram kiritilmagan</span>';
      const tgState = e.telegramId ? '<span class="pill ok" style="align-self:flex-start">Bog‘langan</span>' : e.username ? '<span class="pill plain" style="align-self:flex-start" title="Xodim botga /start yozsa yoki guruhda xabar yozsa, avtomatik bog‘lanadi">Kutilmoqda</span>' : '';
      return `<div class="prow">
        <div class="person who">${avatar(e.id, 34)}<div style="min-width:0"><b>${esc(e.name)}</b><small>${esc(e.position || '—')}</small></div></div>
        <div class="tg-handle tg-col">${tg}${tgState}</div>
        <div class="load load-col"><span>${nextDuty ? `${esc(nextTask.emoji)} ${esc(C.relDay(nextDuty.date, t))}` : '<span class="muted">Navbat yo‘q</span>'}</span><span class="muted">${plural(tasksIn, 'vazifa')} · ${plural(exps, 'to‘lov')}</span></div>
        <div class="load">${away ? `<span class="pill warn plain">${icon('palm', 'sm')} ${e.awayTo ? esc(C.fmtDate(e.awayTo)) + ' gacha' : 'Ta’tilda'}</span>` : `<span>${counts[e.id] || 0} navbat · 30 kun</span><div class="mini"><span style="width:${((counts[e.id] || 0) / maxCount) * 100}%"></span></div>`}</div>
        <button type="button" class="icon-btn" data-act="emp-menu" data-id="${e.id}" aria-label="Amallar">${icon('dots')}</button>
      </div>`;
    }).join('');

    return `<header class="page-head"><div><h1>Jamoa</h1><p class="sub">${st.employees.length} xodim · ${linked} tasi Telegram’ga bog‘langan</p></div>
        <div class="actions"><button type="button" class="btn primary" data-act="add-emp">${icon('plus')} Xodim</button></div></header>
      <section class="card">${st.employees.length ? `<div class="people">
        <div class="prow head"><span>Xodim</span><span class="tg-col">Telegram</span><span class="load-col">Keyingi navbat</span><span>Yuklama</span><span></span></div>${rows}</div>`
        : emptyState('users', 'Jamoa hali bo‘sh', 'Xodimlarni Telegram username’i bilan qo‘shing — eslatmalarda ular haqiqiy mention bilan belgilanadi.', `<button type="button" class="btn primary sm" data-act="add-emp">${icon('plus', 'sm')} Xodim qo‘shish</button>`)}</section>
      ${st.employees.length && linked < st.employees.length ? `<div class="note">${icon('link')}<span>Username kiritilgan xodim guruhda biror xabar yozsa yoki botga <span class="code">/start</span> yuborsa, tizim uning Telegram ID’sini avtomatik saqlaydi. Username bo‘lmasa ham ID orqali mention ishlaydi.</span></div>` : ''}`;
  };

  /* Telegram */
  function tgPreview(text, buttons) {
    let html = text
      .replace(/<a href="tg:\/\/user\?id=\d+">(.*?)<\/a>/g, '<span class="tg-mention">$1</span>')
      .replace(/(^|[\s(])@([A-Za-z0-9_]{4,32})/g, '$1<span class="tg-mention">@$2</span>')
      .replace(/\n/g, '<br>');
    const time = now().time;
    return `<div class="tg-msg"><div class="tg-bubble"><div class="from">${esc(botLabel())}</div>${html}<span class="time">${time}</span></div>
      ${(buttons || []).flat().map((b) => `<div class="tg-btn">${esc(b.text)}</div>`).join('')}</div>`;
  }
  function botLabel() { const b = S().bots[0]; return b ? b.name || '@' + b.username : 'Office Manager'; }

  function chatOptions(selected, emptyLabel) {
    const st = S();
    const opts = st.chats.map((c) => { const b = st.bots.find((x) => x.id === c.botId); return `<option value="${esc(c.key)}" ${c.key === selected ? 'selected' : ''}>${esc(c.title)}${st.bots.length > 1 && b ? ' · @' + esc(b.username) : ''}</option>`; }).join('');
    return `<option value="">${esc(emptyLabel)}</option>${opts}`;
  }

  VIEWS.telegram = function () {
    const st = S(), t = today();
    const bots = st.bots, chats = st.chats;
    const onboarding = `<section class="card set-sec" style="grid-template-columns:1fr">
      <header><h2>Ulash — 3 qadam</h2><p>Bir martalik sozlash, taxminan 2 daqiqa.</p></header>
      <ol class="steps">
        <li><b>Bot yarating</b>Telegram’da <span class="code">@BotFather</span> ga <span class="code">/newbot</span> yozing va berilgan tokenni nusxalang.</li>
        <li><b>Tokenni ulang</b>Pastdagi «Botlar» bo‘limiga tokenni qo‘ying va «Ulash» tugmasini bosing.</li>
        <li><b>Guruhga qo‘shing</b>Botni ofis guruhiga qo‘shing va guruhda <span class="code">/start</span> yozing. Guruh shu yerda avtomatik paydo bo‘ladi.</li>
      </ol>
    </section>`;

    const statusText = (b) => b.status === 'ok' ? '<span class="status-dot ok"></span>Ishlayapti' : b.status === 'error' ? `<span class="status-dot error"></span>${esc(b.error || 'Xatolik')}` : b.status === 'starting' ? '<span class="status-dot starting"></span>Ulanmoqda…' : '<span class="status-dot"></span>To‘xtatilgan';
    const botsSec = `<section class="card set-sec">
      <header><h2>Botlar</h2><p>Bir nechta bot ulash mumkin — masalan, moliya va umumiy guruh uchun alohida.</p></header>
      <div class="set-body">
        ${bots.length ? `<div class="list">${bots.map((b) => `<div class="list-row"><span class="bot-ico">${icon('send')}</span>
          <div class="grow"><b>@${esc(b.username)}</b><small>${statusText(b)} · <span class="mono">${esc(b.tokenHint || '')}</span></small></div>
          <button type="button" class="icon-btn" data-act="bot-menu" data-id="${b.id}" aria-label="Amallar">${icon('dots')}</button></div>`).join('')}</div>` : ''}
        <form class="row-inline" data-form="bot-add" style="flex-wrap:nowrap">
          <input class="input mono" id="bot-token" name="token" placeholder="123456789:AAH…  (BotFather tokeni)" autocomplete="off" spellcheck="false" style="flex:1">
          <button class="btn primary" type="submit">Ulash</button>
        </form>
      </div>
    </section>`;

    const chatUse = (c) => [st.settings.expenseChat === c.key ? '<span class="pill accent plain">Xarajatlar</span>' : '', st.settings.dutyChat === c.key ? '<span class="pill accent plain">Navbatchilik</span>' : ''].join(' ');
    const chatsSec = `<section class="card set-sec">
      <header><h2>Guruhlar</h2><p>Bot qo‘shilgan guruhlar shu yerda avtomatik chiqadi.</p></header>
      <div class="set-body">
        ${chats.length ? `<div class="list">${chats.map((c) => { const b = bots.find((x) => x.id === c.botId); return `<div class="list-row">
            <div class="grow"><b>${esc(c.title)}</b><small><span class="mono">${esc(c.chatId)}</span>${b ? ' · @' + esc(b.username) : ''}</small></div>
            <span class="row-inline">${chatUse(c)}</span>
            <button type="button" class="btn sm" data-act="chat-test" data-key="${esc(c.key)}">Test xabar</button>
            <button type="button" class="icon-btn" data-act="chat-remove" data-key="${esc(c.key)}" aria-label="Ro‘yxatdan olib tashlash">${icon('x')}</button>
          </div>`; }).join('')}</div>`
          : `<div class="note">${icon('bell')}<span>${bots.length ? 'Botni Telegram guruhingizga qo‘shing va guruhda <span class="code">/start</span> yozing — guruh bir necha soniyada shu yerda paydo bo‘ladi.' : 'Avval botni ulang.'}</span></div>`}
        ${bots.length ? `<button type="button" class="btn ghost sm" style="align-self:flex-start" data-act="chat-add">${icon('plus', 'sm')} Chat ID orqali qo‘shish</button>` : ''}
      </div>
    </section>`;

    const routeSec = `<section class="card set-sec">
      <header><h2>Xabarlar qayerga boradi</h2><p>Har bir navbatchilik vazifasi uchun alohida guruh ham tanlash mumkin.</p></header>
      <div class="set-body">
        <div class="grid2">
          <div class="field"><label for="r-exp">Xarajat eslatmalari</label><select id="r-exp" data-setting="expenseChat" ${chats.length ? '' : 'disabled'}>${chatOptions(st.settings.expenseChat, 'Yuborilmasin')}</select></div>
          <div class="field"><label for="r-duty">Navbatchilik xabarlari</label><select id="r-duty" data-setting="dutyChat" ${chats.length ? '' : 'disabled'}>${chatOptions(st.settings.dutyChat, 'Yuborilmasin')}</select></div>
        </div>
        <p class="hint">To‘lov eslatmalari ${esc(st.settings.expenseTime)} da, ertangi navbat haqida ogohlantirish ${esc(st.settings.eveningTime)} da yuboriladi. Vaqtlarni «Sozlamalar»da o‘zgartiring.</p>
      </div>
    </section>`;

    // Namuna xabarlar
    const sampleExp = st.expenses.filter((e) => e.status === 'pending').sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1)).find((e) => e.dueDate >= t) ||
      { id: 'x', title: 'Ofis ijarasi', amount: 12000000, dueDate: C.addDays(t, 3), category: 'Ijara', recurrence: { type: 'monthly' }, assigneeId: st.employees[0] && st.employees[0].id };
    const m1 = C.msgExpense(st, sampleExp, 'remind', t);
    const shiftT = st.shifts.find((x) => x.date === t && task(x.taskId));
    const m2 = shiftT ? C.msgShift(st, task(shiftT.taskId), shiftT.date, shiftT.ids, 'today', shiftT)
      : C.msgShift(st, { title: 'Oshxonani tozalash', emoji: '🍽️' }, t, st.employees.slice(0, 1).map((e) => e.id), 'today', { id: 'x' });
    const preview = `<section class="card set-sec">
      <header><h2>Xabar ko‘rinishi</h2><p>Guruhda xabarlar shunday ko‘rinadi. Tugmani bosish holatni dashboard’da ham yangilaydi.</p></header>
      <div class="set-body"><div class="tg-screen">${tgPreview(m1.text, m1.buttons)}${tgPreview(m2.text, m2.buttons)}</div></div>
    </section>`;

    return `<header class="page-head"><div><h1>Telegram</h1><p class="sub">Bot, guruhlar va avtomatik xabarlar</p></div></header>
      <div class="settings">${bots.length && chats.length ? '' : onboarding}${botsSec}${chatsSec}${routeSec}${preview}</div>`;
  };

  /* Sozlamalar */
  VIEWS.settings = function () {
    const st = S(), set = st.settings;
    const tzs = ['Asia/Tashkent', 'Asia/Samarkand', 'Asia/Almaty', 'Asia/Bishkek', 'Asia/Dushanbe', 'Europe/Moscow', 'Europe/Istanbul', 'Asia/Dubai', 'Europe/London', 'UTC'];
    if (!tzs.includes(set.timezone)) tzs.unshift(set.timezone);
    const remindOpts = [7, 3, 1, 0];
    return `<header class="page-head"><div><h1>Sozlamalar</h1><p class="sub">O‘zgarishlar avtomatik saqlanadi</p></div></header>
      <div class="settings">
        <section class="card set-sec"><header><h2>Umumiy</h2><p>Ofis nomi, valyuta va ish kunlari.</p></header>
          <div class="set-body">
            <div class="grid2">
              <div class="field"><label for="s-name">Ofis nomi</label><input id="s-name" data-setting="officeName" value="${esc(set.officeName)}" maxlength="60"></div>
              <div class="field"><label for="s-cur">Valyuta</label><select id="s-cur" data-setting="currency">${[['UZS', 'So‘m (UZS)'], ['USD', 'Dollar (USD)'], ['EUR', 'Yevro (EUR)']].map(([v, l]) => `<option value="${v}" ${set.currency === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
            </div>
            <div class="field"><label for="s-tz">Vaqt zonasi</label><select id="s-tz" data-setting="timezone">${tzs.map((z) => `<option ${z === set.timezone ? 'selected' : ''}>${z}</option>`).join('')}</select></div>
            <div class="field"><span class="label">Ish kunlari</span><div class="chips">${C.WD_SHORT.map((d, i) => `<label class="chip day" title="${C.WD[i]}"><input type="checkbox" data-setting-arr="workdays" value="${i + 1}" ${set.workdays.includes(i + 1) ? 'checked' : ''}>${d}</label>`).join('')}</div><span class="hint">«Faqat ish kunlari» navbatchiliklari shu kunlarda bo‘ladi.</span></div>
          </div></section>

        <section class="card set-sec"><header><h2>Eslatmalar</h2><p>Telegram’ga qachon xabar yuborilishi.</p></header>
          <div class="set-body">
            <div class="grid2">
              <div class="field"><label for="s-et">To‘lov eslatmalari vaqti</label><input id="s-et" type="time" data-setting="expenseTime" value="${esc(set.expenseTime)}"></div>
              <div class="field"><label for="s-ev">Ertangi navbat haqida</label><input id="s-ev" type="time" data-setting="eveningTime" value="${esc(set.eveningTime)}"></div>
            </div>
            <div class="field"><span class="label">Yangi xarajatlar uchun standart eslatma</span><div class="chips">${remindOpts.map((d) => `<label class="chip"><input type="checkbox" data-setting-arr="remindDays" value="${d}" ${set.remindDays.includes(d) ? 'checked' : ''}>${d ? d + ' kun oldin' : 'To‘lov kuni'}</label>`).join('')}</div></div>
            <label class="check"><input type="checkbox" data-setting="overdueDaily" ${set.overdueDaily ? 'checked' : ''}><span>Kechikkan to‘lovlarni har kuni eslatish<small>To‘lanmaguncha mas’ul xodim har kuni belgilanadi.</small></span></label>
          </div></section>

        <section class="card set-sec"><header><h2>Kategoriyalar</h2><p>Xarajatlarni guruhlash uchun.</p></header>
          <div class="set-body">
            <div class="chips">${set.categories.map((c, i) => `<span class="chip">${esc(c)}<button type="button" class="x" data-act="cat-remove" data-i="${i}" aria-label="O‘chirish">${icon('x', 'sm')}</button></span>`).join('')}</div>
            <form class="cat-edit" data-form="cat-add"><input class="input" id="cat-new" name="name" placeholder="Yangi kategoriya" maxlength="40"><button class="btn" type="submit">Qo‘shish</button></form>
          </div></section>

        <section class="card set-sec"><header><h2>Xavfsizlik</h2><p>Dashboard’ga kirish paroli.</p></header>
          <div class="set-body">${API.demo ? '<p class="hint">Demo rejimida parol yo‘q. O‘z serveringizda ishga tushirilganda birinchi kirishda parol o‘rnatiladi.</p>' : `
            <form class="grid3" data-form="password" style="align-items:end">
              <div class="field"><label for="p-cur">Joriy parol</label><input id="p-cur" name="current" type="password" autocomplete="current-password"></div>
              <div class="field"><label for="p-new">Yangi parol</label><input id="p-new" name="next" type="password" autocomplete="new-password" minlength="6"></div>
              <button class="btn" type="submit">Parolni yangilash</button>
            </form>`}
          </div></section>

        <section class="card set-sec"><header><h2>Ma’lumotlar</h2><p>Zaxira nusxa: barcha xodimlar, xarajatlar va navbatlar.</p></header>
          <div class="set-body">${API.demo ? '<p class="hint">Eksport va import o‘z serveringizdagi versiyada ishlaydi.</p>' : `
            <div class="row-inline">
              <button type="button" class="btn" data-act="export">${icon('download')} JSON yuklab olish</button>
              <label class="btn">${icon('upload')} Zaxiradan tiklash<input type="file" accept="application/json,.json" data-change="import" hidden></label>
            </div>
            <p class="hint">Faylda bot tokenlari ham bor — uni xavfsiz joyda saqlang.</p>`}
          </div></section>
      </div>`;
  };

  /* ───────────────────────── Formalar ───────────────────────── */
  const digits = (v) => String(v || '').replace(/\D/g, '');
  const groupNum = (v) => { const d = digits(v); return d ? d.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''; };

  function expenseForm(e) {
    const st = S();
    const isNew = !e;
    const x = e || { title: '', amount: '', category: st.settings.categories[0], dueDate: C.addDays(today(), 7), assigneeId: '', note: '', recurrence: { type: 'monthly' }, remindDays: st.settings.remindDays };
    const rec = x.recurrence || { type: 'none' };
    const cats = [...new Set([...st.settings.categories, x.category].filter(Boolean))];
    const recOpts = [['none', 'Bir martalik'], ['weekly', 'Har hafta'], ['monthly', 'Har oy'], ['quarterly', 'Har 3 oyda'], ['yearly', 'Har yili'], ['custom', 'Boshqa davr…']];
    const rd = Array.isArray(x.remindDays) ? x.remindDays : st.settings.remindDays;
    modal({
      title: isNew ? 'Yangi xarajat' : 'Xarajatni tahrirlash',
      submit: isNew ? 'Qo‘shish' : 'Saqlash',
      body: `
        <div class="field"><label for="f-title">Nomi</label><input id="f-title" name="title" value="${esc(x.title)}" placeholder="Masalan: Ofis ijarasi" maxlength="120" autofocus></div>
        <div class="grid2">
          <div class="field"><label for="f-amount">Summa</label><div class="affix"><input id="f-amount" name="amount" inputmode="numeric" data-money value="${esc(groupNum(x.amount))}" placeholder="0" autocomplete="off"><span>${esc(curUnit())}</span></div></div>
          <div class="field"><label for="f-due">${isNew ? 'Birinchi to‘lov sanasi' : 'To‘lov sanasi'}</label><input id="f-due" name="dueDate" type="date" value="${esc(x.dueDate)}"></div>
        </div>
        <div class="grid2">
          <div class="field"><label for="f-cat">Kategoriya</label><select id="f-cat" name="category">${cats.map((c) => `<option ${c === x.category ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
          <div class="field"><label for="f-emp">Mas’ul xodim</label><select id="f-emp" name="assigneeId"><option value="">Tanlanmagan</option>${st.employees.map((m) => `<option value="${m.id}" ${m.id === x.assigneeId ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></div>
        </div>
        <div class="field"><label for="f-rec">Takrorlanish</label>
          <select id="f-rec" name="recType" data-rec>${recOpts.map(([v, l]) => `<option value="${v}" ${rec.type === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
          <div class="row-inline" data-custom-rec ${rec.type === 'custom' ? '' : 'hidden'}><span class="soft">Har</span><input class="input" name="recInterval" type="number" min="1" max="365" value="${esc(rec.interval || 2)}" style="width:80px" aria-label="Oraliq"><select class="input" name="recUnit" aria-label="Birlik">${[['day', 'kunda'], ['week', 'haftada'], ['month', 'oyda']].map(([v, l]) => `<option value="${v}" ${rec.unit === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <span class="hint" data-rec-hint>${rec.type && rec.type !== 'none' ? 'To‘landi deb belgilanganda keyingi to‘lov avtomatik yaratiladi.' : ''}</span>
        </div>
        <div class="field"><span class="label">Telegram eslatmasi</span><div class="chips">${[7, 3, 1, 0].map((d) => `<label class="chip"><input type="checkbox" name="remind" value="${d}" ${rd.includes(d) ? 'checked' : ''}>${d ? d + ' kun oldin' : 'To‘lov kuni'}</label>`).join('')}</div></div>
        <div class="field"><label for="f-note">Izoh</label><textarea id="f-note" name="note" rows="2" maxlength="500" placeholder="Shartnoma raqami, rekvizitlar, kontakt…">${esc(x.note || '')}</textarea></div>`,
      onSubmit: async (f) => {
        const fd = new FormData(f);
        await call('expense.save', {
          id: e && e.id, title: fd.get('title'), amount: digits(fd.get('amount')), dueDate: fd.get('dueDate'),
          category: fd.get('category'), assigneeId: fd.get('assigneeId'), note: fd.get('note'),
          recurrence: { type: fd.get('recType'), interval: fd.get('recInterval'), unit: fd.get('recUnit') },
          remindDays: fd.getAll('remind').map(Number),
        });
        toast(isNew ? 'Xarajat qo‘shildi' : 'O‘zgarishlar saqlandi');
      },
    });
  }

  function payForm(e) {
    const next = C.isRecurring(e) ? C.nextDue(e) : null;
    modal({
      title: 'To‘lovni qayd etish',
      submit: 'To‘landi',
      body: `<p class="lead">«${esc(e.title)}» · muddati ${esc(C.fmtDate(e.dueDate, today()))}</p>
        <div class="grid2">
          <div class="field"><label for="pay-amt">To‘langan summa</label><div class="affix"><input id="pay-amt" name="amount" inputmode="numeric" data-money value="${esc(groupNum(e.amount))}" autofocus><span>${esc(curUnit())}</span></div></div>
          <div class="field"><label for="pay-date">To‘lov sanasi</label><input id="pay-date" name="date" type="date" value="${today()}"></div>
        </div>
        ${next ? `<div class="note">${icon('repeat')}<span>Keyingi to‘lov avtomatik yaratiladi: <b>${esc(C.fmtDateLong(next))}</b></span></div>` : ''}`,
      onSubmit: async (f) => {
        const fd = new FormData(f);
        await call('expense.pay', { id: e.id, amount: digits(fd.get('amount')), date: fd.get('date') });
        toast(`«${e.title}» to‘landi`, { label: 'Bekor qilish', run: () => act('expense.unpay', { id: e.id }, 'To‘lov bekor qilindi') });
      },
    });
  }

  function employeeForm(e) {
    const isNew = !e;
    const x = e || { name: '', position: '', username: '', telegramId: '', awayFrom: '', awayTo: '' };
    modal({
      title: isNew ? 'Yangi xodim' : 'Xodimni tahrirlash',
      submit: isNew ? 'Qo‘shish' : 'Saqlash',
      body: `
        <div class="grid2">
          <div class="field"><label for="e-name">Ism familiya</label><input id="e-name" name="name" value="${esc(x.name)}" placeholder="Aziz Karimov" maxlength="80" autofocus></div>
          <div class="field"><label for="e-pos">Lavozim</label><input id="e-pos" name="position" value="${esc(x.position || '')}" placeholder="Ofis menejeri" maxlength="80"></div>
        </div>
        <div class="grid2">
          <div class="field"><label for="e-user">Telegram username</label><div class="prefix"><span>@</span><input id="e-user" name="username" value="${esc(x.username || '')}" placeholder="username" autocomplete="off" spellcheck="false"></div></div>
          <div class="field"><label for="e-tid">Telegram ID <span class="muted">(ixtiyoriy)</span></label><input id="e-tid" name="telegramId" class="mono" value="${esc(x.telegramId || '')}" inputmode="numeric" placeholder="Avtomatik aniqlanadi"></div>
        </div>
        <p class="hint">Mention uchun username yetarli. ID xodim botga <span class="code">/start</span> yozganda yoki guruhda xabar qoldirganda avtomatik saqlanadi.</p>
        <div class="field"><span class="label">Ta’til yoki yo‘qlik <span class="muted">(ixtiyoriy)</span></span>
          <div class="grid2"><input class="input" type="date" name="awayFrom" value="${esc(x.awayFrom || '')}" aria-label="Boshlanishi"><input class="input" type="date" name="awayTo" value="${esc(x.awayTo || '')}" aria-label="Tugashi"></div>
          <span class="hint">Bu kunlarda xodim navbatchilikka tayinlanmaydi va navbatini yo‘qotmaydi.</span></div>`,
      onSubmit: async (f) => {
        const fd = new FormData(f);
        await call('employee.save', { id: e && e.id, name: fd.get('name'), position: fd.get('position'), username: fd.get('username'), telegramId: fd.get('telegramId'), awayFrom: fd.get('awayFrom'), awayTo: fd.get('awayTo') });
        toast(isNew ? 'Xodim qo‘shildi' : 'O‘zgarishlar saqlandi');
      },
    });
  }

  function queueEditor(container, queue) {
    const st = S();
    const draw = () => {
      const rest = st.employees.filter((e) => !queue.includes(e.id));
      container.innerHTML = `<div class="qedit">${queue.length ? queue.map((id, i) => { const e = emp(id); return `<div class="qedit-row"><span class="n">${i + 1}</span>${avatar(id, 24)}<span class="nm">${esc(e ? e.name : '—')}${i === 0 ? ' <span class="pill accent plain" style="margin-left:4px">keyingi</span>' : ''}</span>
          <button type="button" class="icon-btn sm" data-q="up" data-i="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Yuqoriga">${icon('up')}</button>
          <button type="button" class="icon-btn sm" data-q="down" data-i="${i}" ${i === queue.length - 1 ? 'disabled' : ''} aria-label="Pastga">${icon('down')}</button>
          <button type="button" class="icon-btn sm" data-q="rm" data-i="${i}" aria-label="Olib tashlash">${icon('x')}</button></div>`; }).join('') : '<div class="qedit-empty">Navbatga xodim qo‘shing</div>'}</div>
        ${rest.length ? `<div class="chips" style="margin-top:8px">${rest.map((e) => `<button type="button" class="chip" data-q="add" data-id="${e.id}">${icon('plus', 'sm')} ${esc(shortName(e))}</button>`).join('')}${rest.length > 1 ? `<button type="button" class="chip" data-q="all">Hammasini qo‘shish</button>` : ''}</div>` : ''}`;
    };
    container.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-q]');
      if (!b) return;
      const i = Number(b.dataset.i);
      if (b.dataset.q === 'up' && i > 0) [queue[i - 1], queue[i]] = [queue[i], queue[i - 1]];
      if (b.dataset.q === 'down' && i < queue.length - 1) [queue[i + 1], queue[i]] = [queue[i], queue[i + 1]];
      if (b.dataset.q === 'rm') queue.splice(i, 1);
      if (b.dataset.q === 'add') queue.push(b.dataset.id);
      if (b.dataset.q === 'all') st.employees.forEach((e) => { if (!queue.includes(e.id)) queue.push(e.id); });
      draw();
    });
    draw();
  }

  function taskForm(tk) {
    const st = S();
    if (!st.employees.length) { toast('Avval jamoaga xodim qo‘shing', { label: 'Jamoa', run: () => { location.hash = 'team'; } }); return; }
    const isNew = !tk;
    const x = tk || { title: '', emoji: '🍽️', description: '', schedule: { type: 'daily', workdaysOnly: true, weekdays: [1, 3, 5], every: 2, startDate: today() }, time: '09:00', dayBefore: true, perShift: 1, rotateBy: 'shift', queue: st.employees.filter((e) => e.active !== false).map((e) => e.id), chat: null };
    const sc = x.schedule;
    const queue = (x.queue || []).slice();
    modal({
      title: isNew ? 'Yangi navbatchilik' : 'Navbatchilikni tahrirlash',
      submit: isNew ? 'Yaratish' : 'Saqlash',
      wide: true,
      body: `
        <div class="field"><span class="label">Belgi</span><div class="emoji-pick">${EMOJIS.map((em) => `<label><input type="radio" name="emoji" value="${em}" ${em === x.emoji ? 'checked' : ''}>${em}</label>`).join('')}</div></div>
        <div class="field"><label for="t-title">Vazifa nomi</label><input id="t-title" name="title" value="${esc(x.title)}" placeholder="Masalan: Oshxonani tozalash" maxlength="80" autofocus></div>
        <div class="field"><label for="t-desc">Nima qilish kerak <span class="muted">(ixtiyoriy)</span></label><input id="t-desc" name="description" value="${esc(x.description || '')}" placeholder="Idishlarni yuvish, stol va rakovinani artish" maxlength="300"></div>
        <div class="field"><span class="label">Jadval</span>
          <div class="seg">${[['daily', 'Har kuni'], ['weekly', 'Hafta kunlari'], ['interval', 'Har N kunda']].map(([v, l]) => `<label><input type="radio" name="stype" value="${v}" ${sc.type === v ? 'checked' : ''} data-stype>${l}</label>`).join('')}</div>
          <div data-s="weekly" ${sc.type === 'weekly' ? '' : 'hidden'}><div class="chips">${C.WD_SHORT.map((d, i) => `<label class="chip day" title="${C.WD[i]}"><input type="checkbox" name="weekdays" value="${i + 1}" ${(sc.weekdays || []).includes(i + 1) ? 'checked' : ''}>${d}</label>`).join('')}</div></div>
          <div data-s="interval" class="row-inline" ${sc.type === 'interval' ? '' : 'hidden'}><span class="soft">Har</span><input class="input" type="number" name="every" min="1" max="60" value="${esc(sc.every || 2)}" style="width:80px" aria-label="Kun"><span class="soft">kunda</span></div>
          <label class="check" data-s="daily interval" ${sc.type === 'weekly' ? 'hidden' : ''}><input type="checkbox" name="workdaysOnly" ${sc.workdaysOnly ? 'checked' : ''}><span>Faqat ish kunlari <small>${esc(st.settings.workdays.map((d) => C.WD_SHORT[d - 1]).join(', '))}</small></span></label>
        </div>
        <div class="grid3">
          <div class="field"><label for="t-start">Boshlanish</label><input id="t-start" name="startDate" type="date" value="${esc(sc.startDate || today())}"></div>
          <div class="field"><label for="t-time">Eslatma vaqti</label><input id="t-time" name="time" type="time" value="${esc(x.time)}"></div>
          <div class="field"><label for="t-per">Bir navbatda</label><select id="t-per" name="perShift">${[1, 2, 3].map((n) => `<option value="${n}" ${Number(x.perShift) === n ? 'selected' : ''}>${n} kishi</option>`).join('')}</select></div>
        </div>
        <div class="field"><span class="label">Navbatchi qachon almashadi</span>
          <div class="seg">${[['shift', 'Har safar'], ['week', 'Har hafta']].map(([v, l]) => `<label><input type="radio" name="rotateBy" value="${v}" ${x.rotateBy === v ? 'checked' : ''}>${l}</label>`).join('')}</div>
          <span class="hint">«Har hafta» — bir xodim butun hafta davomida mas’ul bo‘ladi.</span></div>
        <label class="check"><input type="checkbox" name="dayBefore" ${x.dayBefore ? 'checked' : ''}><span>Bir kun oldin ogohlantirish<small>Soat ${esc(st.settings.eveningTime)} da guruhda ertangi navbatchi belgilanadi.</small></span></label>
        <div class="field"><span class="label">Navbat tartibi</span><div data-queue></div><span class="hint">Ro‘yxat boshidagi xodim — keyingi navbatchi. Bajargach oxiriga o‘tadi.</span></div>
        ${st.chats.length ? `<div class="field"><label for="t-chat">Telegram guruhi</label><select id="t-chat" name="chat">${chatOptions(x.chat, 'Standart (navbatchilik guruhi)')}</select></div>` : ''}`,
      onOpen: (f) => {
        queueEditor($('[data-queue]', f), queue);
        f.addEventListener('change', (ev) => {
          if (ev.target.matches('[data-stype]')) {
            const v = ev.target.value;
            $$('[data-s]', f).forEach((el) => { el.hidden = !el.dataset.s.split(' ').includes(v); });
          }
        });
      },
      onSubmit: async (f) => {
        const fd = new FormData(f);
        await call('task.save', {
          id: tk && tk.id, title: fd.get('title'), emoji: fd.get('emoji'), description: fd.get('description'),
          schedule: { type: fd.get('stype'), weekdays: fd.getAll('weekdays').map(Number), every: fd.get('every'), workdaysOnly: fd.get('workdaysOnly') === 'on', startDate: fd.get('startDate') },
          time: fd.get('time'), perShift: fd.get('perShift'), rotateBy: fd.get('rotateBy'), dayBefore: fd.get('dayBefore') === 'on',
          queue, chat: fd.get('chat') || null,
        });
        toast(isNew ? 'Navbatchilik yaratildi' : 'O‘zgarishlar saqlandi');
      },
    });
  }

  function queueForm(tk) {
    const queue = (tk.queue || []).slice();
    modal({
      title: `${tk.emoji} ${tk.title} · navbat tartibi`,
      body: `<p class="lead" style="font-size:13px">Ro‘yxat boshidagi xodim keyingi navbatchi bo‘ladi. Bugungi tayinlov o‘zgarmaydi.</p><div data-queue></div>`,
      onOpen: (f) => queueEditor($('[data-queue]', f), queue),
      onSubmit: async () => { await call('task.queue', { id: tk.id, queue }); toast('Navbat tartibi yangilandi'); },
    });
  }

  function assignForm(tk, date, item) {
    const st = S(), t = today();
    const committed = item && item.committed;
    const current = item ? item.ids : [];
    const multi = Number(tk.perShift) > 1;
    const hasOv = !!st.overrides[tk.id + '|' + date];
    modal({
      title: `${tk.emoji} ${tk.title}`,
      body: `<p class="lead">${esc(C.fmtDateLong(date))} · ${esc(C.relDay(date, t))}${multi ? ` · ${tk.perShift} kishi` : ''}</p>
        <div class="pick-list">${st.employees.map((e) => {
          const away = !C.isAvailable(st, e.id, date);
          return `<label><input type="${multi ? 'checkbox' : 'radio'}" name="ids" value="${e.id}" ${current.includes(e.id) ? 'checked' : ''}>${avatar(e.id, 28)}<span class="nm">${esc(e.name)}<small>${esc(e.position || '')}${away ? ' · shu kuni mavjud emas' : ''}</small></span></label>`;
        }).join('')}</div>
        <p class="hint">${committed ? 'Chiqarilgan xodim navbatini yo‘qotmaydi — keyingi safar birinchi bo‘ladi.' : 'Qo‘lda tayinlash faqat shu kunga ta’sir qiladi; navbat adolatli davom etadi.'}</p>`,
      foot: `${!committed && hasOv ? '<button type="button" class="btn ghost left" data-act="ov-clear">Avtomatik taqsimotga qaytarish</button>' : ''}<button type="button" class="btn" data-act="modal-close">Bekor qilish</button><button class="btn primary" type="submit">Tayinlash</button>`,
      onOpen: (f) => {
        const clr = $('[data-act="ov-clear"]', f);
        if (clr) clr.addEventListener('click', async (ev) => { ev.stopPropagation(); closeModal(); await act('override.clear', { taskId: tk.id, date }, 'Avtomatik taqsimot tiklandi'); });
      },
      onSubmit: async (f) => {
        const ids = new FormData(f).getAll('ids');
        if (committed) await call('shift.reassign', { id: item.shift.id, ids });
        else await call('override.set', { taskId: tk.id, date, ids });
        toast('Navbatchi tayinlandi');
      },
    });
  }

  function previewModal(title, text, buttons) {
    modal({ title, body: `<div class="tg-screen" style="grid-template-columns:1fr">${tgPreview(text, buttons)}</div><p class="hint">Demo rejimida xabar yuborilmaydi. O‘z serveringizda bu xabar tanlangan guruhga boradi.</p>`, foot: '<button class="btn primary" type="submit">Yopish</button>' });
  }

  async function notify(kind, id) {
    const r = await useState(API.notify(kind, id));
    if (!r) return;
    if (r.preview) previewModal('Telegram xabari', r.preview.text, r.preview.buttons);
    else toast('Telegramga yuborildi');
  }

  /* ───────────────────────── Hodisalar ───────────────────────── */
  const handlers = {
    'modal-close': () => closeModal(),
    theme: () => toggleTheme(),
    logout: async () => { try { await API.logout(); } catch (e) { /* */ } location.reload(); },
    'demo-reset': async () => { await API.reset(); App.state = await API.state(); render(); toast('Demo ma’lumotlar tiklandi'); },

    'add-expense': () => expenseForm(),
    pay: (el) => { const e = S().expenses.find((x) => x.id === el.dataset.id); if (e) payForm(e); },
    'exp-filter': (el) => { App.ui.exp = el.dataset.v; render(); },
    'exp-menu': (el) => {
      const e = S().expenses.find((x) => x.id === el.dataset.id);
      if (!e) return;
      openMenu(el, [
        e.status === 'pending' && { label: 'To‘landi deb belgilash', icon: 'check', run: () => payForm(e) },
        { label: 'Tahrirlash', icon: 'edit', run: () => expenseForm(e) },
        e.status === 'pending' && { label: 'Telegramda eslatish', icon: 'send', run: () => notify('expense', e.id) },
        e.status === 'paid' && { label: 'To‘lovni bekor qilish', icon: 'undo', run: () => act('expense.unpay', { id: e.id }, 'To‘lov bekor qilindi') },
        '-',
        { label: 'O‘chirish', icon: 'trash', danger: true, run: async () => {
          const ok = await confirmBox('Xarajatni o‘chirish', `«${esc(e.title)}» o‘chiriladi.${C.isRecurring(e) && e.status === 'pending' ? ' Bu takroriy xarajat — keyingi to‘lovlar ham yaratilmaydi.' : ''}`, 'O‘chirish', true);
          if (ok) act('expense.delete', { id: e.id }, 'Xarajat o‘chirildi');
        } },
      ]);
    },

    'add-task': () => taskForm(),
    'task-menu': (el) => {
      const tk = task(el.dataset.id);
      if (!tk) return;
      openMenu(el, [
        { label: 'Tahrirlash', icon: 'edit', run: () => taskForm(tk) },
        { label: 'Navbat tartibi', icon: 'swap', run: () => queueForm(tk) },
        { label: tk.active ? 'To‘xtatish' : 'Faollashtirish', icon: 'clock', run: () => act('task.toggle', { id: tk.id, active: !tk.active }, tk.active ? 'Vazifa to‘xtatildi' : 'Vazifa faollashtirildi') },
        '-',
        { label: 'O‘chirish', icon: 'trash', danger: true, run: async () => {
          if (await confirmBox('Vazifani o‘chirish', `«${esc(tk.title)}» va uning navbat tarixi o‘chiriladi.`, 'O‘chirish', true)) act('task.delete', { id: tk.id }, 'Vazifa o‘chirildi');
        } },
      ]);
    },
    'queue-edit': (el) => { const tk = task(el.dataset.id); if (tk) queueForm(tk); },
    'shift-done': (el) => act('shift.done', { id: el.dataset.id }, 'Bajarildi deb belgilandi', { label: 'Bekor qilish', run: () => act('shift.undo', { id: el.dataset.id }) }),
    'shift-menu': (el) => {
      const sh = S().shifts.find((x) => x.id === el.dataset.id);
      const tk = sh && task(sh.taskId);
      if (!tk) return;
      const done = sh.status === 'done';
      openMenu(el, [
        !done && { label: 'Bajarildi', icon: 'check', run: () => act('shift.done', { id: sh.id }, 'Bajarildi deb belgilandi') },
        done && { label: 'Bajarilmagan deb belgilash', icon: 'undo', run: () => act('shift.undo', { id: sh.id }, 'Holat qaytarildi') },
        !done && { label: 'Keyingi xodimga o‘tkazish', icon: 'skip', run: () => act('shift.skip', { id: sh.id }, 'Navbat keyingi xodimga o‘tkazildi') },
        !done && { label: 'Boshqa xodimni tanlash', icon: 'swap', run: () => assignForm(tk, sh.date, { committed: true, ids: sh.ids, shift: sh }) },
        !done && { label: 'Telegramda eslatish', icon: 'send', run: () => notify('shift', sh.id) },
      ]);
    },
    cell: (el) => {
      const tk = task(el.dataset.task);
      const d = el.dataset.date;
      const item = C.upcoming(S(), d, d, today()).find((x) => x.taskId === tk.id);
      if (tk && item) assignForm(tk, d, item);
    },

    'add-emp': () => employeeForm(),
    'emp-menu': (el) => {
      const e = emp(el.dataset.id);
      if (!e) return;
      openMenu(el, [
        { label: 'Tahrirlash', icon: 'edit', run: () => employeeForm(e) },
        '-',
        { label: 'O‘chirish', icon: 'trash', danger: true, run: async () => {
          const st = S();
          const nt = st.tasks.filter((tk) => (tk.queue || []).includes(e.id)).length;
          const ne = st.expenses.filter((x) => x.status === 'pending' && x.assigneeId === e.id).length;
          const impact = [nt ? `${nt} ta navbatchilik navbatidan chiqariladi` : '', ne ? `${ne} ta to‘lovning mas’uli bo‘shaydi` : ''].filter(Boolean).join(', ');
          if (await confirmBox('Xodimni o‘chirish', `<b>${esc(e.name)}</b> jamoadan o‘chiriladi.${impact ? ' ' + cap(impact) + '.' : ''}`, 'O‘chirish', true)) act('employee.delete', { id: e.id }, 'Xodim o‘chirildi');
        } },
      ]);
    },

    'bot-menu': (el) => {
      const b = S().bots.find((x) => x.id === el.dataset.id);
      if (!b) return;
      openMenu(el, [
        { label: 'Qayta ulash', icon: 'refresh', run: () => useState(API.botRestart(b.id), 'Bot qayta ulanmoqda') },
        '-',
        { label: 'Botni uzish', icon: 'trash', danger: true, run: async () => {
          if (await confirmBox('Botni uzish', `@${esc(b.username)} platformadan uziladi. Uning guruhlari ro‘yxatdan olib tashlanadi.`, 'Uzish', true)) useState(API.botRemove(b.id), 'Bot uzildi');
        } },
      ]);
    },
    'chat-test': async (el) => {
      const r = await useState(API.test(el.dataset.key));
      if (!r) return;
      if (r.preview) previewModal('Test xabar', r.preview.text);
      else toast('Test xabar yuborildi — guruhni tekshiring');
    },
    'chat-remove': async (el) => {
      if (await confirmBox('Guruhni olib tashlash', 'Guruh ro‘yxatdan olib tashlanadi. Bot guruhda yana xabar olsa, qayta paydo bo‘ladi.', 'Olib tashlash', true)) useState(API.chatRemove(el.dataset.key), 'Guruh olib tashlandi');
    },
    'chat-add': () => {
      const st = S();
      modal({
        title: 'Chat ID orqali qo‘shish',
        submit: 'Qo‘shish',
        body: `${st.bots.length > 1 ? `<div class="field"><label for="ca-bot">Bot</label><select id="ca-bot" name="bot">${st.bots.map((b) => `<option value="${b.id}">@${esc(b.username)}</option>`).join('')}</select></div>` : `<input type="hidden" name="bot" value="${st.bots[0].id}">`}
          <div class="field"><label for="ca-id">Chat ID</label><input id="ca-id" name="chatId" class="mono" placeholder="-1001234567890" autofocus></div>
          <p class="hint">Guruh ID’sini bilish uchun guruhda <span class="code">/id</span> yozing. Bot guruh a’zosi bo‘lishi shart.</p>`,
        onSubmit: async (f) => {
          const fd = new FormData(f);
          const r = await API.chatAdd(fd.get('bot'), fd.get('chatId'));
          App.state = r.state; render(); toast('Guruh qo‘shildi');
        },
      });
    },
    'cat-remove': (el) => {
      const cats = S().settings.categories.slice();
      cats.splice(Number(el.dataset.i), 1);
      act('settings.save', { categories: cats }, 'Kategoriya olib tashlandi');
    },
    export: () => API.exportData(),
  };

  document.addEventListener('click', (ev) => {
    if (App.menu && !App.menu.el.contains(ev.target) && !App.menu.anchor.contains(ev.target)) closeMenu();
    const bd = ev.target.closest('[data-backdrop]');
    if (bd && ev.target === bd) { closeModal(); return; }
    const el = ev.target.closest('[data-act]');
    if (!el) return;
    const h = handlers[el.dataset.act];
    if (!h) return;
    if (App.menu && App.menu.anchor === el) { closeMenu(); return; }
    ev.preventDefault();
    h(el, ev);
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') { if (App.menu) closeMenu(); else if ($('#modal-root').children.length) closeModal(); }
  });

  document.addEventListener('input', (ev) => {
    const el = ev.target;
    if (el.matches('[data-money]')) {
      const f = groupNum(el.value);
      if (f !== el.value) el.value = f;
    }
    if (el.dataset.input === 'q') { App.ui.q = el.value; render(); }
  });

  let saveTimer = null;
  document.addEventListener('change', async (ev) => {
    const el = ev.target;
    if (el.matches('[data-rec]')) {
      const f = el.form;
      $('[data-custom-rec]', f).hidden = el.value !== 'custom';
      $('[data-rec-hint]', f).textContent = el.value !== 'none' ? 'To‘landi deb belgilanganda keyingi to‘lov avtomatik yaratiladi.' : '';
      return;
    }
    const ch = el.dataset.change;
    if (ch === 'cat') { App.ui.cat = el.value; render(); return; }
    if (ch === 'task-active') { act('task.toggle', { id: el.dataset.id, active: el.checked }, el.checked ? 'Vazifa faollashtirildi' : 'Vazifa to‘xtatildi'); return; }
    if (ch === 'import') {
      const file = el.files && el.files[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (await confirmBox('Zaxiradan tiklash', 'Joriy ma’lumotlar fayldagi ma’lumotlar bilan almashtiriladi. Davom etasizmi?', 'Tiklash', true)) useState(API.importData(data), 'Ma’lumotlar tiklandi');
      } catch (e) { toast('Fayl o‘qilmadi: JSON formati noto‘g‘ri', null, 'error'); }
      el.value = '';
      return;
    }
    if (el.dataset.setting) {
      const key = el.dataset.setting;
      const val = el.type === 'checkbox' ? el.checked : el.value;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => act('settings.save', { [key]: val }, 'Saqlandi'), 50);
      return;
    }
    if (el.dataset.settingArr) {
      const key = el.dataset.settingArr;
      const vals = $$(`[data-setting-arr="${key}"]`).filter((x) => x.checked).map((x) => Number(x.value));
      act('settings.save', { [key]: vals }, 'Saqlandi');
    }
  });

  document.addEventListener('submit', async (ev) => {
    const f = ev.target;
    const kind = f.dataset && f.dataset.form;
    if (!kind) return;
    ev.preventDefault();
    const fd = new FormData(f);
    if (kind === 'bot-add') {
      const btn = f.querySelector('button'); btn.disabled = true; btn.textContent = 'Tekshirilmoqda…';
      const r = await useState(API.botAdd(String(fd.get('token') || '').trim()));
      btn.disabled = false; btn.textContent = 'Ulash';
      if (r && r.bot) toast(`@${r.bot.username} ulandi. Endi uni guruhga qo‘shing.`);
    }
    if (kind === 'cat-add') {
      const name = String(fd.get('name') || '').trim();
      if (name) act('settings.save', { categories: [...S().settings.categories, name] }, 'Kategoriya qo‘shildi');
    }
    if (kind === 'password') {
      try { await API.password(fd.get('current'), fd.get('next')); f.reset(); toast('Parol yangilandi'); } catch (e) { toast(e.message, null, 'error'); }
    }
  });

  // Grafik va jadval uchun tooltip
  const tip = () => $('#tip');
  function showTip(el, x, y) {
    const t = tip(); if (!t) return;
    t.textContent = el.dataset.tip; t.hidden = false;
    const w = t.offsetWidth, h = t.offsetHeight;
    let left = x + 14, top = y - h - 10;
    if (left + w > window.innerWidth - 8) left = x - w - 14;
    if (top < 8) top = y + 16;
    t.style.left = left + 'px'; t.style.top = top + 'px';
  }
  document.addEventListener('mousemove', (ev) => {
    const el = ev.target.closest && ev.target.closest('[data-tip]');
    if (el) showTip(el, ev.clientX, ev.clientY); else if (tip()) tip().hidden = true;
  });
  document.addEventListener('focusin', (ev) => {
    const el = ev.target.closest && ev.target.closest('[data-tip]');
    if (el) { const r = el.getBoundingClientRect(); showTip(el, r.left + r.width / 2, r.top); } else if (tip()) tip().hidden = true;
  });
  document.addEventListener('scroll', () => { if (tip()) tip().hidden = true; }, true);

  /* ───────────────────────── Kirish ekrani ───────────────────────── */
  function renderAuth(sess) {
    const setup = sess.needsSetup;
    $('#root').innerHTML = `<div class="auth"><div class="auth-card">
      <span class="logo">${esc((sess.officeName || 'O').slice(0, 1).toUpperCase())}</span>
      <div><h1>${setup ? 'Xush kelibsiz' : esc(sess.officeName || 'Office Manager')}</h1><p>${setup ? 'Dashboard uchun administrator parolini o‘rnating.' : 'Davom etish uchun parolni kiriting.'}</p></div>
      <form id="auth-form" novalidate>
        ${setup ? `<div class="field"><label for="a-office">Ofis nomi</label><input id="a-office" name="office" placeholder="Masalan: Nurli Studio" maxlength="60" autofocus></div>` : ''}
        <div class="field"><label for="a-pass">Parol</label><input id="a-pass" name="password" type="password" autocomplete="${setup ? 'new-password' : 'current-password'}" ${setup ? '' : 'autofocus'}></div>
        ${setup ? `<div class="field"><label for="a-pass2">Parolni takrorlang</label><input id="a-pass2" name="password2" type="password" autocomplete="new-password"></div>` : ''}
        <p class="form-error" hidden></p>
        <button class="btn primary" type="submit">${setup ? 'Boshlash' : 'Kirish'}</button>
      </form></div></div>`;
    const f = $('#auth-form');
    setTimeout(() => { const a = f.querySelector('[autofocus]'); if (a) a.focus(); }, 30);
    f.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const fd = new FormData(f);
      const err = $('.form-error', f);
      err.hidden = true;
      try {
        if (setup) {
          if (String(fd.get('password')).length < 6) throw new Error('Parol kamida 6 belgidan iborat bo‘lsin');
          if (fd.get('password') !== fd.get('password2')) throw new Error('Parollar mos kelmadi');
          await API.setup(fd.get('password'), fd.get('office'));
        } else {
          await API.login(fd.get('password'));
        }
        $('#root').innerHTML = '';
        await refresh();
      } catch (e) { err.textContent = e.message; err.hidden = false; }
    });
  }

  /* ───────────────────────── Ishga tushirish ───────────────────────── */
  function routeFromHash() {
    const h = (location.hash || '').replace('#', '');
    App.route = ROUTES.some((r) => r.id === h) ? h : 'dashboard';
  }
  window.addEventListener('hashchange', () => { routeFromHash(); closeMenu(); render(); window.scrollTo(0, 0); });

  async function refresh() {
    App.state = await API.state();
    render();
  }

  async function boot() {
    routeFromHash();
    $('#root').innerHTML = '<div class="loading">Yuklanmoqda…</div>';
    API.onUnauthorized = () => { App.state = null; API.session().then(renderAuth).catch(() => {}); };
    try {
      const sess = await API.session();
      if (!sess.authed) return renderAuth(sess);
      await refresh();
    } catch (e) {
      $('#root').innerHTML = `<div class="loading">Server bilan aloqa yo‘q. Sahifani yangilang.</div>`;
      return;
    }
    // Telegram tugmalari orqali o‘zgarishlarni ko‘rsatish uchun davriy yangilash
    setInterval(async () => {
      if (!App.state || document.hidden || $('#modal-root').children.length || App.menu) return;
      const a = document.activeElement;
      if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) return;
      try { App.state = await API.state(); render(); } catch (e) { /* keyingi safar */ }
    }, 30000);
  }

  boot();
})();

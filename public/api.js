/* Server bilan aloqa. Demo versiyada bu fayl demo-api.js bilan almashtiriladi. */
(function () {
  'use strict';
  async function req(method, url, body) {
    const res = await fetch(url, {
      method,
      headers: body ? { 'content-type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    });
    let data = {};
    try { data = await res.json(); } catch (e) { /* bo‘sh javob */ }
    if (res.status === 401 && url !== '/api/login') {
      if (window.API.onUnauthorized) window.API.onUnauthorized();
    }
    if (!res.ok) throw new Error(data.error || `Xatolik (${res.status})`);
    return data;
  }
  const post = (u, b) => req('POST', u, b || {});

  window.API = {
    demo: false,
    onUnauthorized: null,
    session: () => req('GET', '/api/session'),
    setup: (password, officeName) => post('/api/setup', { password, officeName }),
    login: (password) => post('/api/login', { password }),
    logout: () => post('/api/logout'),
    state: () => req('GET', '/api/state'),
    action: (type, payload) => post('/api/action', { type, payload }),
    botAdd: (token) => post('/api/bots/add', { token }),
    botRemove: (id) => post('/api/bots/remove', { id }),
    botRestart: (id) => post('/api/bots/restart', { id }),
    chatAdd: (botId, chatId) => post('/api/chats/add', { botId, chatId }),
    chatRemove: (key) => post('/api/chats/remove', { key }),
    test: (chat) => post('/api/telegram/test', { chat }),
    notify: (kind, id) => post('/api/notify', { kind, id }),
    password: (current, next) => post('/api/password', { current, next }),
    exportData: () => { window.location.href = '/api/export'; },
    importData: (data) => post('/api/import', { data }),
  };
})();

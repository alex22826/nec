/* =========================================================================
   NEC — каркас кабинета: меню, шапка, маршруты #/раздел?параметры,
   колокольчик, демо-сценарии входящих сообщений.
   ========================================================================= */
(function () {
  const N = window.N = window.N || {};
  N.pages = {};
  N.page = (id, def) => { N.pages[id] = def; };

  const NAV = [
    { group: 'Работа с клиентами', items: [
      { id: 'overview', title: 'Обзор', icon: 'grid' },
      { id: 'dialogs', title: 'Диалоги', icon: 'chat' },
      { id: 'leads', title: 'Заявки', icon: 'inbox' },
    ] },
    { group: 'Каталог', items: [
      { id: 'products', title: 'Продукция', icon: 'box' },
      { id: 'services', title: 'Услуги', icon: 'wrench' },
    ] },
    { group: 'Настройки', items: [
      { id: 'channels', title: 'Каналы', icon: 'plug' },
      { id: 'agent', title: 'ИИ-менеджер', icon: 'bot' },
    ] },
  ];
  const navItem = id => NAV.flatMap(g => g.items).find(i => i.id === id);

  /* ---------- маршрут ---------- */
  const parseHash = () => {
    const h = location.hash.replace(/^#\/?/, '');
    const [page, qs] = h.split('?');
    return { page: page || 'overview', q: Object.fromEntries(new URLSearchParams(qs || '')) };
  };
  N.go = (page, q) => {
    const qs = q ? '?' + new URLSearchParams(q).toString() : '';
    const h = '#/' + page + qs;
    if (location.hash === h) render(); else location.hash = h;
  };
  N.setQuery = q => { // поменять параметры без перерисовки страницы
    const { page } = parseHash();
    history.replaceState(null, '', '#/' + page + (q ? '?' + new URLSearchParams(q).toString() : ''));
  };
  let current = null;

  /* ---------- оболочка ---------- */
  const shell = () => {
    const me = N.me();
    const role = N.ROLES[me.role];
    document.body.innerHTML = `
    <div class="app">
      <aside class="side" id="side">
        <div class="brand">
          <span class="logo">${N.icon('zap', 20)}</span>
          <div class="brand-txt"><b>NEC</b><small>National Energy Company</small></div>
        </div>
        <nav class="nav">
          ${NAV.map(g => {
            const items = g.items.filter(i => role.pages.includes(i.id));
            return items.length ? `<div class="nav-group">${N.t(g.group)}</div>` + items.map(i => `<a href="#/${i.id}" class="nav-item" data-nav="${i.id}">${N.icon(i.icon)}<span>${N.t(i.title)}</span><b class="nav-badge" data-badge="${i.id}"></b></a>`).join('') : '';
          }).join('')}
        </nav>
        <div class="side-ai" id="sideAi"></div>
        <button class="side-user" id="userBtn">
          ${N.avatar(N.tx(me.name), 34, me.color)}
          <span><b>${N.esc(N.tx(me.name))}</b><small>${N.esc(N.tx(me.title))}</small></span>
          ${N.icon('chev-down', 16)}
        </button>
      </aside>
      <div class="side-veil" id="veil"></div>
      <div class="main">
        <header class="top">
          <button class="icon-btn only-m" id="menuBtn" aria-label="${N.t('Меню')}">${N.icon('menu')}</button>
          <div class="crumbs"><small id="crumb"></small><h1 id="title"></h1></div>
          <div class="top-actions">
            <button class="btn btn-light btn-demo" id="demoBtn" title="${N.t('Показать, как сообщение из мессенджера попадает в кабинет')}">${N.icon('play', 16)}<span>${N.t('Демо-сценарий')}</span></button>
            <div class="seg lang-seg" id="langSeg">${N.LANGS.map(l => `<button data-lang="${l.id}" class="${l.id === N.lang ? 'on' : ''}">${l.label}</button>`).join('')}</div>
            <button class="icon-btn bell" id="bellBtn" aria-label="${N.t('Уведомления')}">${N.icon('bell', 20)}<b class="bell-n" id="bellN"></b></button>
          </div>
        </header>
        <main class="page" id="page"></main>
      </div>
    </div>`;

    N.qs('#menuBtn').onclick = () => document.body.classList.add('nav-open');
    N.qs('#veil').onclick = () => document.body.classList.remove('nav-open');
    N.qs('#side').addEventListener('click', e => { if (e.target.closest('.nav-item')) document.body.classList.remove('nav-open'); });
    N.qs('#langSeg').onclick = e => {
      const b = e.target.closest('[data-lang]'); if (!b || b.dataset.lang === N.lang) return;
      N.setLang(b.dataset.lang); shell(); render();
    };
    N.qs('#bellBtn').onclick = e => openBell(e.currentTarget);
    N.qs('#demoBtn').onclick = e => openDemo(e.currentTarget);
    N.qs('#userBtn').onclick = e => openUser(e.currentTarget);
    refreshChrome();
  };

  /* ---------- бейджи меню, колокольчик, статус ИИ ---------- */
  const refreshChrome = () => {
    const db = N.db;
    const attention = db.chats.filter(c => c.status === 'wait' || c.unread > 0).length;
    const waiting = db.chats.filter(c => c.status === 'wait').length;
    const newLeads = db.leads.filter(l => l.stage === 'new' || l.stage === 'contract').length;
    const setB = (id, n, tone) => { const b = N.qs(`[data-badge="${id}"]`); if (b) { b.textContent = n || ''; b.className = 'nav-badge' + (n ? ' on' : '') + (tone ? ' ' + tone : ''); } };
    setB('dialogs', attention, waiting ? 'warn' : '');
    setB('leads', newLeads);
    const un = N.unreadNotes().length, bn = N.qs('#bellN');
    if (bn) { bn.textContent = un > 9 ? '9+' : (un || ''); bn.classList.toggle('on', un > 0); }
    const on = db.channels.filter(c => c.on).length, ai = N.qs('#sideAi');
    if (ai) ai.innerHTML = `<i class="pulse ${on ? '' : 'off'}"></i><div><b>${N.t('ИИ-менеджер онлайн')}</b><small>${N.t('Подключено каналов: {n} из {t}', { n: on, t: db.channels.length })}</small></div>`;
    N.qsa('[data-nav]').forEach(a => a.classList.toggle('active', current && a.dataset.nav === current.id));
  };

  /* ---------- отрисовка страницы ---------- */
  const render = () => {
    let { page, q } = parseHash();
    if (!N.pages[page] || !N.can(page)) page = 'overview';
    if (current && current.def.destroy) current.def.destroy();
    const def = N.pages[page], item = navItem(page);
    current = { id: page, def };
    document.title = N.t(item.title) + ' | NEC';
    N.qs('#crumb').textContent = 'NEC / ' + N.t(item.title);
    N.qs('#title').textContent = N.t(item.title);
    // новый узел страницы: обработчики прошлого раздела уходят вместе со старым
    const old = N.qs('#page'), el = old.cloneNode(false);
    old.replaceWith(el);
    el.className = 'page page-' + page;
    def.render(el, q);
    refreshChrome();
  };

  /* ---------- колокольчик ---------- */
  const noteRow = n => {
    const c = N.chat(n.chatId); if (!c) return '';
    const k = N.NOTE_KINDS[n.kind] || N.NOTE_KINDS.lead;
    return `<button class="note ${n.read ? '' : 'unread'}" data-note="${n.id}">
      <span class="note-ic tone-${k.tone}">${N.icon(k.icon, 16)}</span>
      <span class="note-txt"><b>${N.t(k.title)}</b><small>${N.chIcon(c.channel, 14)} ${N.esc(N.clientName(c))} · ${N.ago(n.at)}</small></span>
    </button>`;
  };
  const openBell = anchor => {
    const list = N.db.notes.slice(0, 15);
    N.pop(anchor, `<div class="pop-head"><b>${N.t('Уведомления')}</b><button class="link" data-all>${N.t('Прочитать все')}</button></div>
      <div class="pop-list">${list.length ? list.map(noteRow).join('') : `<p class="muted pad">${N.t('Пока пусто')}</p>`}</div>`, (el, close) => {
      el.onclick = e => {
        if (e.target.closest('[data-all]')) { N.db.notes.forEach(n => { n.read = true; }); N.changed('notes'); close(); return; }
        const b = e.target.closest('[data-note]'); if (!b) return;
        const n = N.db.notes.find(x => x.id === b.dataset.note); n.read = true; N.changed('notes');
        close(); N.go('dialogs', { id: n.chatId });
      };
    }, { cls: 'pop-bell' });
  };

  /* ---------- демо-сценарии: клиент пишет в мессенджер ---------- */
  N.DEMO = [
    { ch: 'tg', lang: 'ru', title: 'Микро-ГЭС для фермы, на русском', client: { name: 'Олим Хасанов', handle: '@olim_agro' },
      msgs: ['Добрый день! Нужна микро-ГЭС на арык, мощность около 15 кВт', 'Цена какая и есть ли в наличии?', 'Нужно 2 штуки, с монтажом. Мы в Андижане', 'Хорошо, готовы заключить договор. Мой номер +998 93 455 12 07, компания «Andijon Agro Klaster»'] },
    { ch: 'wa', lang: 'uz', title: 'КТП и камеры КСО, на узбекском', client: { name: 'Sherzod Qodirov', handle: '+998 97 701 33 44', phone: '+998 97 701 33 44' },
      msgs: ['Assalomu alaykum! KTP 630 kVA bormi?', 'Yana KSO kamerasi kerak, 4 dona. Narxi qancha?', 'KTP 1 dona. Montaj va ishga tushirish ham kerak, Chirchiq shahri', "Yaxshi, shartnoma tuzamiz. Rekvizitlarni yuboraman"] },
    { ch: 'ig', lang: 'en', title: 'Ветроустановки, на английском', client: { name: 'Anna Petrova', handle: '@anna.eco' },
      msgs: ['Hello! Do you have 20 kW wind turbines?', 'We need 3 units for a farm near Samarkand. What about delivery?', 'Great. Please send the invoice, we are ready to sign the contract. Phone +998 90 123 45 67'] },
  ];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const running = new Set();
  N.runDemo = async i => {
    const s = N.DEMO[i];
    const chat = N.newChat(s.ch, Object.assign({}, s.client), s.lang);
    running.add(chat.id);
    N.changed('new');
    N.beep();
    N.toast(N.t('Новое обращение') + ': ' + s.client.name, { title: N.chName(s.ch), icon: 'inbox', action: { label: N.t('Открыть'), fn: () => N.go('dialogs', { id: chat.id }) } });
    for (const text of s.msgs) {
      while (chat.typing) await sleep(200);
      await sleep(1400 + Math.random() * 900);
      if (!N.chat(chat.id) || chat.status === 'manager') break; // менеджер взял диалог: сценарий останавливаем
      chat.typing = 'client'; N.emit('change', 'typing');
      await sleep(900 + text.length * 18);
      chat.typing = null;
      if (!N.chat(chat.id)) break;
      N.clientSays(chat, text);
    }
    running.delete(chat.id);
  };
  const openDemo = anchor => {
    N.pop(anchor, `<div class="pop-head"><b>${N.t('Демо-сценарий')}</b></div>
      <p class="pop-note">${N.t('Клиент напишет в мессенджер, ИИ ответит по каталогу, а когда дело дойдет до договора, позовет менеджера.')}</p>
      <div class="pop-list">${N.DEMO.map((s, i) => `<button class="note" data-demo="${i}"><span class="note-ic">${N.chIcon(s.ch, 22)}</span><span class="note-txt"><b>${N.chName(s.ch)}: ${N.esc(N.t(s.title))}</b><small>${N.esc(s.client.name)} · ${N.t('{n} сообщ.', { n: s.msgs.length })}</small></span></button>`).join('')}</div>`, (el, close) => {
      el.onclick = e => {
        const b = e.target.closest('[data-demo]'); if (!b) return;
        close(); N.runDemo(+b.dataset.demo);
      };
    }, { cls: 'pop-demo' });
  };

  /* ---------- меню пользователя ---------- */
  const openUser = anchor => {
    const me = N.me();
    N.pop(anchor, `<div class="pop-head"><b>${N.esc(N.tx(me.name))}</b><small class="muted">${N.t(N.ROLES[me.role].name)}</small></div>
      <div class="pop-list">
        <button class="menu-row" data-a="sound">${N.icon('bell', 16)}<span>${N.t('Звук уведомлений')}</span><i class="switch ${N.db.settings.sound ? 'on' : ''}"></i></button>
        <button class="menu-row" data-a="reset">${N.icon('refresh', 16)}<span>${N.t('Сбросить демо-данные')}</span></button>
        <button class="menu-row" data-a="logout">${N.icon('logout', 16)}<span>${N.t('Выйти')}</span></button>
      </div>`, (el, close) => {
      el.onclick = async e => {
        const a = e.target.closest('[data-a]'); if (!a) return;
        if (a.dataset.a === 'sound') { N.db.settings.sound = !N.db.settings.sound; N.changed('settings'); a.querySelector('.switch').classList.toggle('on', N.db.settings.sound); return; }
        close();
        if (a.dataset.a === 'logout') N.logout();
        if (a.dataset.a === 'reset' && await N.confirm(N.t('Вернуть исходные демо-данные? Ваши изменения в этом браузере пропадут.'), N.t('Сбросить'))) { N.resetDB(); render(); N.toast(N.t('Демо-данные восстановлены'), { tone: 'green', icon: 'check' }); }
      };
    }, { alignLeft: true, cls: 'pop-user' });
  };

  /* ---------- запуск ---------- */
  N.boot = () => {
    N.initDB();
    if (!N.me()) { location.replace('index.html'); return; }
    shell();
    window.addEventListener('hashchange', render);
    N.on('change', what => {
      refreshChrome();
      if (current && current.def.update) current.def.update(what); else if (what !== 'typing' && what !== 'extract') render();
    });
    N.on('notify', n => {
      if (n.kind === 'lead') return;
      const c = N.chat(n.chatId), k = N.NOTE_KINDS[n.kind];
      N.beep();
      N.toast(N.clientName(c) + ' · ' + N.chName(c.channel), { title: N.t(k.title), icon: k.icon, tone: n.kind === 'contract' ? 'amber' : 'dark', timeout: 9000, action: { label: N.t('Открыть'), fn: () => { n.read = true; N.changed('notes'); N.go('dialogs', { id: c.id }); } } });
    });
    N.on('ai-error', msg => N.toast(msg, { title: N.t('Claude API не ответил, сработал демо-режим'), icon: 'alert', tone: 'red', timeout: 8000 }));
    // другая вкладка изменила данные: подтянуть
    window.addEventListener('storage', e => { if (e.key === 'nec.db.v1' && e.newValue) { N.db = JSON.parse(e.newValue); refreshChrome(); if (current && current.def.update) current.def.update('sync'); } });
    render();
    if (N.siteSync) N.siteSync();
  };
})();

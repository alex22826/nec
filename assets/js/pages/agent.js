/* ИИ-менеджер: настройки, база знаний и тестовый чат (только для администратора). */
(function () {
  const N = window.N;
  const st = { tab: 'test', showKey: false };
  let root = null;

  const newTest = () => ({ id: 'test', channel: 'test', test: true, lang: N.lang, status: 'ai', managerId: null, unread: 0, client: { name: N.t('Тестовый клиент'), handle: '', phone: '', company: '', inn: '', city: '' }, card: { items: [], services: [] }, ctx: {}, messages: [], createdAt: Date.now(), lastAt: Date.now() });
  N.testChat = N.testChat || null;

  const MODELS = [['claude-opus-5-5', 'Claude Opus 5.5'], ['claude-sonnet-5-5', 'Claude Sonnet 5.5'], ['claude-haiku-5-5', 'Claude Haiku 5.5']];

  const stats = () => {
    const chats = N.db.chats;
    const aiMsgs = chats.reduce((s, c) => s + c.messages.filter(m => m.from === 'ai').length, 0);
    const handed = chats.filter(c => c.messages.some(m => m.sys === 'escalated')).length;
    const noHuman = chats.filter(c => !c.messages.some(m => m.from === 'manager')).length;
    return `<div class="kpis three">
      <div class="kpi"><span>${N.t('Ответов ИИ')}</span><b>${aiMsgs}</b><small>${N.t('за все время демо')}</small></div>
      <div class="kpi"><span>${N.t('Передано менеджеру')}</span><b>${handed}</b><small>${N.t('из {n} диалогов', { n: chats.length })}</small></div>
      <div class="kpi"><span>${N.t('Без участия менеджера')}</span><b>${chats.length ? Math.round(noHuman / chats.length * 100) : 0}%</b><small>${N.t('диалогов ведет только ИИ')}</small></div>
    </div>`;
  };

  const settingsHtml = () => {
    const a = N.db.settings.ai;
    const claude = a.mode === 'claude';
    const tg = (key, title, sub) => `<label class="toggle-row"><span><b>${N.t(title)}</b><small>${N.t(sub)}</small></span><input type="checkbox" class="tgl" data-esc="${key}" ${a.escalate[key] ? 'checked' : ''}></label>`;
    return `${stats()}
    <div class="grid-2">
      <div class="panel">
        <div class="panel-h"><b>${N.t('Как ИИ отвечает')}</b></div>
        <div class="f-label">${N.t('Режим ответов')}</div>
        <div class="seg wide" data-mode>
          <button data-v="demo" class="${!claude ? 'on' : ''}">${N.icon('sparkles', 15)} ${N.t('Демо-ответы')}</button>
          <button data-v="claude" class="${claude ? 'on' : ''}">${N.icon('bot', 15)} Claude API</button>
        </div>
        <p class="hint">${claude ? N.t('ИИ отвечает через Claude: понимает свободный текст и сложные вопросы. Цены и остатки берет из каталога.') : N.t('Встроенные ответы без интернета: ИИ узнает товары, количество, телефон и город, отвечает по каталогу на трех языках.')}</p>
        ${claude ? `
          <label><span class="f-label">${N.t('Ключ Claude API')}</span>
            <span class="inp-wrap"><input class="inp" name="apiKey" type="${st.showKey ? 'text' : 'password'}" value="${N.esc(a.apiKey)}" placeholder="sk-ant-..." autocomplete="off"><button class="icon-btn sm" data-showkey type="button">${N.icon(st.showKey ? 'eye-off' : 'eye', 16)}</button></span></label>
          <label><span class="f-label">${N.t('Модель')}</span><select class="sel" name="model">${MODELS.map(([v, t]) => `<option value="${v}" ${a.model === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
          <p class="hint warn">${N.icon('lock', 15)} ${N.t('Ключ хранится только в этом браузере и уходит напрямую в Anthropic. В рабочей версии ключ лежит на сервере компании.')}</p>` : ''}
        <div class="grid2">
          <label><span class="f-label">${N.t('Имя ассистента')}</span><input class="inp" name="name" value="${N.esc(a.name)}"></label>
          <label><span class="f-label">${N.t('Тон общения')}</span><select class="sel" name="tone"><option value="business" ${a.tone === 'business' ? 'selected' : ''}>${N.t('Деловой')}</option><option value="friendly" ${a.tone === 'friendly' ? 'selected' : ''}>${N.t('Дружелюбный')}</option></select></label>
        </div>
        <label><span class="f-label">${N.t('Указания для ИИ')}</span><textarea class="inp" name="prompt" rows="4" placeholder="${N.t('Например: всегда предлагай монтаж и пусконаладку. Скидку не обещай.')}">${N.esc(a.prompt)}</textarea></label>
        <button class="btn btn-primary" data-save>${N.icon('check', 16)} ${N.t('Сохранить')}</button>
      </div>
      <div class="panel">
        <div class="panel-h"><b>${N.t('Когда звать менеджера')}</b></div>
        <div class="toggle-row locked"><span><b>${N.t('Клиент готов к договору')}</b><small>${N.t('Всегда. Правило в файле rules.js: что считать готовностью')}</small></span>${N.icon('lock', 16)}</div>
        ${tg('human', 'Клиент просит живого человека', 'ИИ сразу передает диалог')}
        ${tg('question', 'Нет ответа в каталоге и базе знаний', 'ИИ обещает уточнить и зовет менеджера')}
        ${tg('kp', 'Клиент просит коммерческое предложение', 'менеджер получит уведомление')}
        <div class="panel-h sub"><b>${N.t('Что ИИ знает')}</b></div>
        <ul class="know">
          <li>${N.icon('box', 15)} ${N.t('{n} товаров с ценами и остатками', { n: N.db.products.length })}</li>
          <li>${N.icon('wrench', 15)} ${N.t('{n} услуг', { n: N.db.services.length })}</li>
          <li>${N.icon('file', 15)} ${N.t('{n} материалов базы знаний', { n: N.db.kb.length })}</li>
          <li>${N.icon('globe', 15)} ${N.t('Русский, узбекский и английский')}</li>
        </ul>
      </div>
    </div>`;
  };

  const kbHtml = () => `
    <div class="toolbar"><p class="page-note">${N.t('На эти материалы ИИ опирается, когда вопрос не про конкретный товар: оплата, гарантия, документы, сроки.')}</p><span class="grow"></span><button class="btn btn-primary" data-kb-new>${N.icon('plus', 16)} ${N.t('Добавить материал')}</button></div>
    <div class="kb-grid">${N.db.kb.map(k => `<div class="panel kb">
      <b>${N.esc(N.tx(k.title))}</b><p>${N.esc(N.tx(k.text))}</p>
      ${k.kw && k.kw.length ? `<small class="muted">${N.t('Ключевые слова')}: ${N.esc(k.kw.slice(0, 6).join(', '))}${k.kw.length > 6 ? ', ...' : ''}</small>` : ''}
      <div class="kb-acts"><button class="btn btn-light btn-sm" data-kb-edit="${k.id}">${N.icon('edit', 14)} ${N.t('Изменить')}</button><button class="btn btn-ghost btn-sm danger" data-kb-del="${k.id}">${N.icon('trash', 14)}</button></div>
    </div>`).join('')}</div>`;

  const testHtml = () => {
    const c = N.testChat;
    return `<div class="test-wrap">
      <div class="panel test-chat">
        <div class="test-h"><div><b>${N.t('Тестовый чат')}</b><small>${N.t('Пишите как клиент на русском, узбекском или английском. Сообщения никуда не уходят.')}</small></div><button class="btn btn-light btn-sm" data-test-new>${N.icon('refresh', 15)} ${N.t('Новый диалог')}</button></div>
        <div class="msgs" id="tMsgs">${c.messages.length ? N.chatUI.messages(c) : `<div class="empty">${N.icon('bot', 32)}<p>${N.t('Напишите первое сообщение или выберите пример ниже')}</p></div>`}</div>
        <div class="quick">${(N.chatUI.QUICK[c.lang] || N.chatUI.QUICK.ru).concat(c.messages.length ? [] : [N.lang === 'uz' ? 'Salom, 100 kVt shamol qurilmasi bormi?' : N.lang === 'en' ? 'Hi, do you have a 100 kW mini hydro plant?' : 'Здравствуйте, нужна мини-ГЭС на 100 кВт']).map(q => `<button class="chip" data-quick="${N.esc(q)}">${N.esc(q)}</button>`).join('')}</div>
        <form class="comp" data-tform><textarea rows="1" data-tinput placeholder="${N.t('Сообщение клиента')}"></textarea><button class="btn btn-primary send">${N.icon('send', 18)}</button></form>
      </div>
      <div class="panel test-card">${N.chatUI.card(c, { test: true })}${c.status === 'wait' ? `<div class="banner tone-amber small">${N.icon('file-sign', 18)}<div><b>${N.t('Здесь ИИ позвал бы менеджера')}</b><small>${N.t('В рабочем диалоге менеджер получит уведомление со звуком')}</small></div></div>` : ''}</div>
    </div>`;
  };

  const paintTest = () => {
    const box = N.qs('#tMsgs', root); if (!box) return;
    box.innerHTML = N.testChat.messages.length || N.testChat.typing ? N.chatUI.messages(N.testChat) : box.innerHTML;
    box.scrollTop = box.scrollHeight;
    N.html(N.qs('.test-card', root), N.chatUI.card(N.testChat, { test: true }) + (N.testChat.status === 'wait' ? `<div class="banner tone-amber small">${N.icon('file-sign', 18)}<div><b>${N.t('Здесь ИИ позвал бы менеджера')}</b><small>${N.t('В рабочем диалоге менеджер получит уведомление со звуком')}</small></div></div>` : ''));
  };
  const paint = () => {
    N.qsa('[data-tab]', root).forEach(b => b.classList.toggle('on', b.dataset.tab === st.tab));
    const body = N.qs('#agBody', root);
    body.innerHTML = st.tab === 'settings' ? settingsHtml() : st.tab === 'kb' ? kbHtml() : testHtml();
    if (st.tab === 'test') { const b = N.qs('#tMsgs', root); b.scrollTop = b.scrollHeight; bindTest(); }
  };
  const sendTest = text => { if (!text.trim()) return; N.clientSays(N.testChat, text.trim()); };
  const bindTest = () => {
    const form = N.qs('[data-tform]', root), ta = N.qs('[data-tinput]', root);
    ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
    form.addEventListener('submit', e => { e.preventDefault(); const v = ta.value; ta.value = ''; sendTest(v); });
    if (window.innerWidth > 760) ta.focus();
  };

  const openKb = id => {
    const k = id ? N.db.kb.find(x => x.id === id) : null;
    N.modal({
      title: k ? N.t('Материал базы знаний') : N.t('Новый материал'),
      body: `<label><span class="f-label">${N.t('Заголовок')}</span><input class="inp" name="title" value="${N.esc(k ? N.tx(k.title) : '')}"></label>
        <label><span class="f-label">${N.t('Текст ответа')} (${N.lang.toUpperCase()})</span><textarea class="inp" name="text" rows="5">${N.esc(k ? N.tx(k.text) : '')}</textarea></label>
        <label><span class="f-label">${N.t('Ключевые слова')}</span><input class="inp" name="kw" value="${N.esc(k && k.kw ? k.kw.join(', ') : '')}" placeholder="${N.t('через запятую: гарантия, kafolat, warranty')}"></label>
        <p class="hint">${N.icon('info', 15)} ${N.t('Если клиент употребит одно из этих слов, ИИ ответит этим текстом. В режиме Claude API текст попадает в знания модели целиком.')}</p>`,
      foot: `<button class="btn btn-ghost" data-close>${N.t('Отмена')}</button><button class="btn btn-primary" data-save>${N.t('Сохранить')}</button>`,
      onMount: m => {
        m.el.querySelector('[data-save]').onclick = () => {
          const f = n => m.el.querySelector(`[name="${n}"]`).value.trim();
          if (!f('title') || !f('text')) { N.toast(N.t('Заполните заголовок и текст'), { tone: 'red', icon: 'alert' }); return; }
          const set = (obj, v) => { const o = typeof obj === 'object' && obj ? Object.assign({}, obj) : {}; o[N.lang] = v; N.LANGS.forEach(l => { if (!o[l.id]) o[l.id] = v; }); return o; };
          const kw = f('kw').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
          if (k) { k.title = set(k.title, f('title')); k.text = set(k.text, f('text')); k.kw = kw; }
          else N.db.kb.push({ id: N.uid('kb'), title: set(null, f('title')), text: set(null, f('text')), kw });
          N.changed('kb'); m.close();
        };
      },
    });
  };

  N.page('agent', {
    render(el) {
      root = el;
      if (!N.testChat) N.testChat = newTest();
      el.innerHTML = `
        <div class="tabs">
          <button data-tab="test">${N.icon('chat', 16)} ${N.t('Тест ИИ')}</button>
          <button data-tab="settings">${N.icon('cog', 16)} ${N.t('Настройки')}</button>
          <button data-tab="kb">${N.icon('file', 16)} ${N.t('База знаний')}</button>
        </div>
        <div id="agBody"></div>`;
      paint();
      el.addEventListener('click', async e => {
        const t = e.target;
        const tab = t.closest('[data-tab]'); if (tab) { st.tab = tab.dataset.tab; paint(); return; }
        const mode = t.closest('[data-mode] [data-v]');
        if (mode) { N.db.settings.ai.mode = mode.dataset.v; N.changed('settings'); paint(); return; }
        if (t.closest('[data-showkey]')) { const i = N.qs('[name="apiKey"]', root); N.db.settings.ai.apiKey = i.value.trim(); st.showKey = !st.showKey; paint(); return; }
        if (t.closest('[data-save]') && st.tab === 'settings') {
          const a = N.db.settings.ai, v = n => { const i = N.qs(`[name="${n}"]`, root); return i ? i.value.trim() : null; };
          if (v('apiKey') !== null) a.apiKey = v('apiKey');
          if (v('model')) a.model = v('model');
          a.name = v('name') || a.name; a.tone = v('tone'); a.prompt = v('prompt');
          N.changed('settings');
          N.toast(a.mode === 'claude' && !a.apiKey ? N.t('Сохранено. Без ключа ИИ продолжит отвечать в демо-режиме') : N.t('Настройки ИИ сохранены'), { tone: 'green', icon: 'check' });
          return;
        }
        if (t.closest('[data-test-new]')) { N.testChat = newTest(); paint(); return; }
        const q = t.closest('[data-quick]'); if (q) { sendTest(q.dataset.quick); return; }
        if (t.closest('[data-kb-new]')) { openKb(null); return; }
        const ke = t.closest('[data-kb-edit]'); if (ke) { openKb(ke.dataset.kbEdit); return; }
        const kd = t.closest('[data-kb-del]');
        if (kd && await N.confirm(N.t('Удалить материал из базы знаний?'), N.t('Удалить'))) { N.db.kb = N.db.kb.filter(x => x.id !== kd.dataset.kbDel); N.changed('kb'); }
      });
      el.addEventListener('change', e => {
        const k = e.target.dataset && e.target.dataset.esc;
        if (k) { N.db.settings.ai.escalate[k] = e.target.checked; N.changed('settings'); }
      });
    },
    update(what) {
      if (!root || !root.isConnected) return;
      if (st.tab === 'test') paintTest();
      else if (st.tab === 'kb' && (what === 'kb' || what === 'reset')) paint();
    },
    destroy() { root = null; },
  });
})();

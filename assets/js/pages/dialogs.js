/* Диалоги: все переписки из Telegram, WhatsApp и Instagram в одном окне.
   Список, переписка и карточка клиента, которую заполняет ИИ. */
(function () {
  const N = window.N;
  const UI = N.chatUI = {};

  /* ---------- общие куски переписки (нужны и в «Тесте ИИ») ---------- */
  const REASON = { contract: 'клиент готов к договору', human: 'клиент попросил менеджера', question: 'вопрос вне базы знаний', form: 'заявка с формы сайта' };
  const REASON_TITLE = { contract: 'Клиент готов к договору', human: 'Клиент просит менеджера', question: 'Нужен ответ специалиста', form: 'Заявка с формы сайта: перезвоните клиенту' };
  UI.sysText = m => {
    const v = m.vars || {}, u = v.uid && N.user(v.uid), name = u ? N.tx(u.name) : '';
    switch (m.sys) {
      case 'escalated': return N.t('ИИ передал диалог менеджеру {m}: {r}', { m: name, r: N.t(REASON[v.reason] || REASON.human) });
      case 'taken': return N.t('{m} ведет диалог', { m: name });
      case 'released': return N.t('Диалог возвращен ИИ-менеджеру');
      case 'closed': return N.t('Диалог закрыт');
      case 'won': return N.t('Сделка заключена');
      case 'reopened': return N.t('Клиент написал снова, диалог открыт');
      default: return '';
    }
  };
  const dayLabel = ts => N.isToday(ts) ? N.t('Сегодня') : (N.fmtShort(ts) === N.t('вчера') ? N.t('Вчера') : N.fmtDate(ts));
  UI.messages = chat => {
    let out = '', lastDay = '';
    chat.messages.forEach(m => {
      const d = dayLabel(m.at);
      if (d !== lastDay) { out += `<div class="day"><span>${d}</span></div>`; lastDay = d; }
      if (m.from === 'system') { out += `<div class="sys">${N.esc(UI.sysText(m))}<small>${N.hm(m.at)}</small></div>`; return; }
      const who = m.from === 'ai' ? `${N.icon('sparkles', 13)} ${N.t('ИИ-менеджер')}` : m.from === 'manager' ? `${N.icon('user', 13)} ${N.esc(N.tx((N.user(m.uid) || {}).name) || N.t('Менеджер'))}` : '';
      out += `<div class="msg from-${m.from}"><div class="bubble">${who ? `<span class="who">${who}</span>` : ''}<div class="txt">${N.esc(m.text)}</div><small class="time">${N.hm(m.at)}</small></div></div>`;
    });
    if (chat.typing) out += `<div class="msg from-${chat.typing === 'ai' ? 'ai' : 'client'} typing"><div class="bubble">${chat.typing === 'ai' ? `<span class="who">${N.icon('sparkles', 13)} ${N.t('ИИ-менеджер')}</span>` : ''}<span class="dots"><i></i><i></i><i></i></span></div></div>`;
    return out;
  };

  const LANG_NAME = { ru: 'Русский', uz: 'Узбекский', en: 'Английский' };
  const row = (icon, label, value, empty) => `<div class="kv">${N.icon(icon, 15)}<span class="k">${N.t(label)}</span><span class="v ${value ? '' : 'none'}">${value || N.t(empty || 'ожидается')}</span></div>`;
  UI.card = (chat, opt = {}) => {
    const c = chat.client, card = chat.card, lead = chat.leadId && N.lead(chat.leadId);
    const items = card.items.map(i => {
      const p = N.product(i.pid); if (!p) return '';
      return `<div class="ci"><div class="ci-main"><b>${N.esc(N.tx(p.name))}</b><small>${i.ok ? `${N.fmtNum(i.qty)} ${N.unit(p)} × ${N.money(p.price)}` : N.t('количество уточняется')}</small></div><div class="ci-side"><b>${N.money(i.qty * p.price)}</b>${N.stockBadge(p)}</div></div>`;
    }).join('');
    const svcs = card.services.map(sid => { const s = N.service(sid); return s ? `<div class="ci"><div class="ci-main"><b>${N.esc(N.tx(s.name))}</b><small>${N.t('услуга')}</small></div><div class="ci-side"><b>${s.price ? N.t('от') + ' ' + N.money(s.price) : N.t('по смете')}</b></div></div>` : ''; }).join('');
    const total = N.sum(card.items, i => i.qty * ((N.product(i.pid) || {}).price || 0)) + N.sum(card.services, sid => (N.service(sid) || {}).price || 0);
    const clientMsgs = chat.messages.filter(m => m.from === 'client').length;
    const checks = [
      ['Язык определен', clientMsgs > 0, N.t(LANG_NAME[chat.lang] || 'Русский')],
      ['Понятно, что нужно', card.items.length + card.services.length > 0],
      ['Названо количество', card.items.some(i => i.ok)],
      ['Есть контакт для связи', !!c.phone],
      ['Готов к договору', (!!lead && ['contract', 'won'].includes(lead.stage)) || (!!chat.test && chat.waitReason === 'contract')],
    ];
    const mgr = chat.managerId && N.user(chat.managerId);
    const canAssign = N.canEdit() && !opt.test;
    return `
      <div class="card-sec">
        <div class="sec-h">${N.t('Карточка клиента')}<span class="live">${N.icon('sparkles', 12)} ${N.t('заполняет ИИ')}</span></div>
        ${row('user', 'Имя', N.esc(c.name))}
        ${row('phone', 'Телефон', c.phone ? `<a href="tel:${c.phone.replace(/\s/g, '')}">${N.esc(c.phone)}</a>` : '')}
        ${row('building', 'Компания', N.esc(c.company))}
        ${c.inn ? row('tag', 'ИНН', N.esc(c.inn)) : ''}
        ${row('pin', 'Город', N.esc(c.city))}
        ${row('link', 'Источник', `<span>${N.chIcon(chat.channel, 14)} ${N.chName(chat.channel)}${c.handle && c.handle !== c.phone ? ' · ' + N.esc(c.handle) : ''}</span>`)}
      </div>
      <div class="card-sec">
        <div class="sec-h">${N.t('Что нужно клиенту')}</div>
        ${items + svcs || `<p class="muted small">${N.t('ИИ еще выясняет, что нужно клиенту')}</p>`}
        ${total ? `<div class="ci-total"><span>${N.t('Сумма заявки')}</span><b>${N.money(total)}</b></div>` : ''}
      </div>
      <div class="card-sec">
        <div class="sec-h">${N.t('Что выяснил ИИ')}</div>
        <ul class="checks">${checks.map(([t, ok, extra]) => `<li class="${ok ? 'ok' : ''}">${N.icon(ok ? 'check' : 'clock', 14)}<span>${N.t(t)}${ok && extra ? ': ' + N.esc(extra) : ''}</span></li>`).join('')}</ul>
      </div>
      ${lead && !opt.test ? `<div class="card-sec">
        <div class="sec-h">${N.t('Заявка')} №${lead.num}</div>
        <div class="kv">${N.icon('kanban', 15)}<span class="k">${N.t('Этап')}</span><span class="v">${N.stageBadge(lead.stage)}</span></div>
        <div class="kv">${N.icon('user', 15)}<span class="k">${N.t('Менеджер')}</span><span class="v">${canAssign ? `<select class="sel sm" data-assign>${['<option value="">' + N.t('не назначен') + '</option>'].concat(N.managers().map(u => `<option value="${u.id}" ${u.id === chat.managerId ? 'selected' : ''}>${N.esc(N.tx(u.name))}</option>`)).join('')}</select>` : (mgr ? N.esc(N.tx(mgr.name)) : N.t('не назначен'))}</span></div>
        <div class="card-btns">
          ${c.phone ? `<a class="btn btn-light btn-sm" href="tel:${c.phone.replace(/\s/g, '')}">${N.icon('phone', 15)} ${N.t('Позвонить')}</a>` : ''}
          <button class="btn btn-light btn-sm" data-open-lead="${lead.id}">${N.icon('inbox', 15)} ${N.t('Открыть заявку')}</button>
        </div>
      </div>` : ''}`;
  };

  UI.QUICK = {
    ru: ['Сколько стоит?', 'Есть в наличии?', 'Нужно 5 штук', 'Доставка в Самарканд есть?', 'Какая гарантия?', 'Готовы заключить договор'],
    uz: ['Narxi qancha?', 'Omborda bormi?', '5 dona kerak', 'Samarqandga yetkazib berasizmi?', 'Kafolat qancha?', 'Shartnoma tuzamiz'],
    en: ['How much is it?', 'Is it in stock?', 'We need 5 units', 'Do you deliver to Samarkand?', 'What is the warranty?', 'We are ready to sign the contract'],
  };

  /* ---------- состояние раздела ---------- */
  const st = { ch: 'all', status: 'all', q: '', id: null, mode: 'manager', showCard: false };
  let root = null;

  const preview = c => {
    const m = [...c.messages].reverse().find(x => x.from !== 'system');
    if (c.typing === 'ai') return `<i class="typing-txt">${N.t('ИИ печатает')}</i>`;
    if (c.typing === 'client') return `<i class="typing-txt">${N.t('клиент печатает')}</i>`;
    if (!m) return '';
    const pre = m.from === 'ai' ? N.t('ИИ') + ': ' : m.from === 'manager' ? N.t('Менеджер') + ': ' : '';
    return N.esc(pre + m.text);
  };
  const filtered = () => {
    const q = st.q.trim().toLowerCase(), me = N.me();
    return N.db.chats.filter(c => c.channel !== 'test')
      .filter(c => st.ch === 'all' || c.channel === st.ch)
      .filter(c => st.status === 'all' || (st.status === 'mine' ? c.managerId === me.id : c.status === st.status))
      .filter(c => !q || [c.client.name, c.client.handle, c.client.phone, c.client.company, ...c.messages.map(m => m.text)].join(' ').toLowerCase().includes(q))
      .sort((a, b) => (b.status === 'wait') - (a.status === 'wait') || b.lastAt - a.lastAt);
  };
  const listHtml = () => {
    const list = filtered();
    if (!list.length) return `<div class="empty">${N.icon('chat', 28)}<p>${N.t('Диалогов не найдено')}</p></div>`;
    return list.map(c => `
      <button class="dli ${c.id === st.id ? 'on' : ''} ${c.status === 'wait' ? 'is-wait' : ''}" data-id="${c.id}">
        <span class="dli-ava">${N.avatar(N.clientName(c), 40)}<span class="dli-ch">${N.chIcon(c.channel, 16)}</span></span>
        <span class="dli-main">
          <span class="dli-top"><b>${N.esc(N.clientName(c))}</b><small>${N.fmtShort(c.lastAt)}</small></span>
          <span class="dli-prev">${preview(c)}</span>
          <span class="dli-bot">${N.statusBadge(c.status)}${c.unread ? `<b class="unread">${c.unread}</b>` : ''}</span>
        </span>
      </button>`).join('');
  };

  const headHtml = c => {
    const me = N.me();
    const btns = [];
    if (c.status === 'ai' || c.status === 'wait' || (c.status === 'manager' && c.managerId !== me.id)) btns.push(`<button class="btn btn-primary btn-sm" data-act="take">${N.icon('hand', 15)}<span>${N.t('Взять диалог')}</span></button>`);
    if (c.status === 'manager' || c.status === 'wait') btns.push(`<button class="btn btn-light btn-sm" data-act="release">${N.icon('bot', 15)}<span>${N.t('Вернуть ИИ')}</span></button>`);
    if (c.status !== 'closed') btns.push(`<button class="icon-btn" data-act="close" title="${N.t('Закрыть диалог')}">${N.icon('check', 18)}</button>`);
    return `
      <button class="icon-btn only-m" data-act="back" aria-label="${N.t('Назад')}">${N.icon('chev-left')}</button>
      <span class="dli-ava">${N.avatar(N.clientName(c), 38)}<span class="dli-ch">${N.chIcon(c.channel, 15)}</span></span>
      <div class="ch-who"><b>${N.esc(N.clientName(c))}</b><small>${N.statusBadge(c.status)} ${N.chName(c.channel)}${c.client.handle ? ' · ' + N.esc(c.client.handle) : ''}</small></div>
      <div class="ch-acts">${btns.join('')}<button class="icon-btn card-toggle" data-act="card" title="${N.t('Карточка клиента')}">${N.icon('card', 18)}</button></div>`;
  };
  const bannerHtml = c => {
    if (c.status !== 'wait') return '';
    const mgr = c.managerId && N.user(c.managerId);
    return `<div class="banner tone-amber">${N.icon(c.waitReason === 'contract' ? 'file-sign' : 'alert', 20)}
      <div><b>${N.t(REASON_TITLE[c.waitReason] || REASON_TITLE.human)}</b><small>${N.t('ИИ передал диалог. Ответственный: {m}. Клиент ждет: {t}', { m: mgr ? N.tx(mgr.name) : N.t('не назначен'), t: N.waitFor(c.waitSince || c.lastAt) })}</small></div>
      <div class="banner-acts">${c.client.phone ? `<a class="btn btn-light btn-sm" href="tel:${c.client.phone.replace(/\s/g, '')}">${N.icon('phone', 15)} ${N.esc(c.client.phone)}</a>` : ''}<button class="btn btn-primary btn-sm" data-act="take">${N.t('Взять диалог')}</button></div></div>`;
  };
  const composerHtml = c => {
    const ch = N.channel(c.channel);
    const hint = st.mode === 'client'
      ? N.t('Тест: сообщение придет как будто от клиента, ИИ ответит сам')
      : (c.status === 'manager' ? N.t('Ответ уйдет клиенту в {ch}', { ch: N.chName(c.channel) }) : N.t('Ответ уйдет клиенту в {ch}, ИИ в этом диалоге остановится', { ch: N.chName(c.channel) }));
    return `
      <div class="comp-top">
        <div class="seg sm" data-mode>
          <button data-m="manager" class="${st.mode === 'manager' ? 'on' : ''}">${N.icon('user', 14)} ${N.t('Ответ менеджера')}</button>
          <button data-m="client" class="${st.mode === 'client' ? 'on' : ''}">${N.icon('play', 13)} ${N.t('Тест: пишет клиент')}</button>
        </div>
        ${ch && !ch.auto ? `<small class="muted">${N.t('Автоответ ИИ в этом канале выключен')}</small>` : ''}
      </div>
      ${st.mode === 'client' ? `<div class="quick">${(UI.QUICK[c.lang] || UI.QUICK.ru).map(q => `<button class="chip" data-quick="${N.esc(q)}">${N.esc(q)}</button>`).join('')}</div>` : ''}
      <form class="comp" data-form>
        <textarea rows="1" placeholder="${st.mode === 'client' ? N.t('Сообщение клиента') : N.t('Напишите ответ клиенту')}" data-input></textarea>
        <button class="btn btn-primary send" aria-label="${N.t('Отправить')}">${N.icon('send', 18)}</button>
      </form>
      <small class="comp-hint">${hint}</small>`;
  };

  /* ---------- отрисовка ---------- */
  const paintList = () => { N.html(N.qs('#dlgItems', root), listHtml()); };
  const paintChat = (keepComposer) => {
    const c = st.id && N.chat(st.id);
    root.querySelector('.dlg').dataset.view = c ? 'chat' : 'list';
    root.querySelector('.dlg').classList.toggle('card-open', st.showCard);
    if (!c) {
      N.html(N.qs('#dlgChat', root), `<div class="empty big">${N.icon('chat', 40)}<p>${N.t('Выберите диалог слева')}</p></div>`);
      N.html(N.qs('#dlgCard', root), '');
      return;
    }
    const box = N.qs('#dlgChat', root);
    if (!keepComposer || !box.querySelector('[data-form]')) {
      box.innerHTML = `<div class="chat-head" id="chHead"></div><div id="chBanner"></div><div class="msgs" id="msgs"></div><div class="composer" id="composer"></div>`;
      N.html(N.qs('#composer', box), composerHtml(c));
      bindComposer();
    }
    N.html(N.qs('#chHead', box), headHtml(c));
    N.html(N.qs('#chBanner', box), bannerHtml(c));
    const msgs = N.qs('#msgs', box);
    const nearBottom = msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight < 120;
    msgs.innerHTML = UI.messages(c);
    if (nearBottom || !keepComposer) msgs.scrollTop = msgs.scrollHeight;
    N.html(N.qs('#dlgCard', root), `<div class="card-head only-narrow"><b>${N.t('Карточка клиента')}</b><button class="icon-btn" data-act="card">${N.icon('x')}</button></div>` + UI.card(c));
  };
  const markRead = c => {
    if (!c) return;
    let ch = false;
    if (c.unread) { c.unread = 0; ch = true; }
    N.db.notes.filter(n => n.chatId === c.id && n.kind === 'lead' && !n.read).forEach(n => { n.read = true; ch = true; });
    if (ch) N.changed('read');
  };
  const select = id => {
    st.id = id; st.showCard = false;
    N.setQuery(id ? { id } : null);
    paintList(); paintChat(false);
    markRead(N.chat(id));
  };

  const bindComposer = () => {
    const box = N.qs('#composer', root);
    const form = box.querySelector('[data-form]'), ta = box.querySelector('[data-input]');
    const grow = () => { ta.style.height = 'auto'; ta.style.height = Math.min(140, ta.scrollHeight) + 'px'; };
    ta.addEventListener('input', grow);
    ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const text = ta.value.trim(), c = N.chat(st.id);
      if (!text || !c) return;
      ta.value = ''; grow();
      if (st.mode === 'client') N.clientSays(c, text); else N.managerSays(c, text);
    });
    box.addEventListener('click', e => {
      const m = e.target.closest('[data-m]');
      if (m) { st.mode = m.dataset.m; N.html(box, composerHtml(N.chat(st.id))); bindComposer(); box.querySelector('[data-input]').focus(); return; }
      const q = e.target.closest('[data-quick]');
      if (q) { const c = N.chat(st.id); N.clientSays(c, q.dataset.quick); }
    });
  };

  N.page('dialogs', {
    render(el, q) {
      root = el;
      st.id = q.id && N.chat(q.id) ? q.id : (window.innerWidth > 900 ? (filtered()[0] || {}).id : null);
      el.innerHTML = `
        <div class="dlg">
          <section class="dlg-list">
            <div class="dlg-tools">
              <label class="search">${N.icon('search', 16)}<input type="search" placeholder="${N.t('Поиск по клиентам и сообщениям')}" value="${N.esc(st.q)}" data-q></label>
              <div class="chips" data-ch>
                ${['all', 'tg', 'wa', 'ig', 'site'].map(id => `<button class="chip ${st.ch === id ? 'on' : ''}" data-v="${id}">${id === 'all' ? N.t('Все') : N.chIcon(id, 16) + ' ' + N.chName(id)}</button>`).join('')}
              </div>
              <select class="sel" data-status>
                ${[['all', 'Все статусы'], ['wait', 'Ждет менеджера'], ['ai', 'Ведет ИИ'], ['manager', 'У менеджера'], ['closed', 'Закрыт'], ['mine', 'Мои диалоги']].map(([v, t]) => `<option value="${v}" ${st.status === v ? 'selected' : ''}>${N.t(t)}</option>`).join('')}
              </select>
            </div>
            <div class="dlg-items" id="dlgItems"></div>
          </section>
          <section class="dlg-chat" id="dlgChat"></section>
          <aside class="dlg-card" id="dlgCard"></aside>
        </div>`;
      paintList(); paintChat(false);
      markRead(N.chat(st.id));

      el.querySelector('[data-q]').addEventListener('input', e => { st.q = e.target.value; paintList(); });
      el.querySelector('[data-ch]').addEventListener('click', e => {
        const b = e.target.closest('[data-v]'); if (!b) return;
        st.ch = b.dataset.v; el.querySelectorAll('[data-ch] .chip').forEach(x => x.classList.toggle('on', x === b)); paintList();
      });
      el.querySelector('[data-status]').addEventListener('change', e => { st.status = e.target.value; paintList(); });
      el.querySelector('#dlgItems').addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (b) select(b.dataset.id); });
      el.addEventListener('click', async e => {
        const a = e.target.closest('[data-act]');
        const lead = e.target.closest('[data-open-lead]');
        if (lead) { N.openLead(lead.dataset.openLead); return; }
        if (!a) return;
        const c = N.chat(st.id);
        switch (a.dataset.act) {
          case 'back': select(null); break;
          case 'card': st.showCard = !st.showCard; root.querySelector('.dlg').classList.toggle('card-open', st.showCard); break;
          case 'take': N.take(c, N.me().id); st.mode = 'manager'; paintChat(false); N.toast(N.t('Диалог за вами. ИИ в нем больше не отвечает'), { icon: 'hand', tone: 'green' }); break;
          case 'release': N.release(c); break;
          case 'close': if (await N.confirm(N.t('Закрыть диалог? Если клиент напишет снова, диалог откроется и ИИ ответит.'), N.t('Закрыть'))) N.closeChat(c); break;
        }
      });
      el.addEventListener('change', e => {
        if (!e.target.matches('[data-assign]')) return;
        const c = N.chat(st.id), uid = e.target.value || null;
        c.managerId = uid; const l = c.leadId && N.lead(c.leadId); if (l) l.managerId = uid;
        N.changed('assign');
      });
    },
    update(what) {
      if (!root || !root.isConnected) return;
      if (what === 'reset') { st.id = null; this.render(root, {}); return; }
      paintList();
      const c = st.id && N.chat(st.id);
      if (c && c.unread && document.visibilityState === 'visible') { c.unread = 0; N.changed('read'); return; }
      paintChat(true);
    },
    destroy() { root = null; },
  });
})();

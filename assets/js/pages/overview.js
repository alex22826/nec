/* Обзор: что происходит прямо сейчас. Кого ждут, сколько заявок, как работает ИИ. */
(function () {
  const N = window.N;
  let root = null;

  const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер'; };

  const html = () => {
    const db = N.db, me = N.me();
    const chats = db.chats.filter(c => c.channel !== 'test');
    const today = chats.filter(c => N.isToday(c.createdAt) || c.messages.some(m => m.from === 'client' && N.isToday(m.at)));
    const waiting = chats.filter(c => c.status === 'wait').sort((a, b) => (a.waitSince || 0) - (b.waitSince || 0));
    const aiNow = chats.filter(c => c.status === 'ai');
    const pipe = db.leads.filter(l => ['qualify', 'offer', 'contract'].includes(l.stage));
    const aiMsgsToday = chats.reduce((s, c) => s + c.messages.filter(m => m.from === 'ai' && N.isToday(m.at)).length, 0);
    const handedToday = chats.reduce((s, c) => s + c.messages.filter(m => m.sys === 'escalated' && N.isToday(m.at)).length, 0);
    const langs = { ru: 0, uz: 0, en: 0 }; chats.forEach(c => { langs[c.lang] = (langs[c.lang] || 0) + 1; });
    const low = db.products.filter(p => N.stockState(p) !== 'ok').sort((a, b) => N.available(a.id) - N.available(b.id));
    const maxStage = Math.max(1, ...N.STAGES.map(s => db.leads.filter(l => l.stage === s.id).length));
    const recent = db.leads.slice().sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6);

    return `
    <div class="hello">
      <div><h2>${N.t(greet())}, ${N.esc(N.tx(me.name).split(' ')[0])}</h2><p class="muted">${N.t('Заявки и диалоги из Telegram, WhatsApp и Instagram в одном месте. На сообщения клиентов отвечает ИИ-менеджер.')}</p></div>
      <button class="btn btn-primary" data-go="dialogs">${N.icon('chat', 16)} ${N.t('Открыть диалоги')}</button>
    </div>

    ${waiting.length ? `<div class="panel alert-panel">
      <div class="panel-h"><b>${N.icon('file-sign', 18)} ${N.t('Ждут менеджера')}: ${waiting.length}</b><small>${N.t('ИИ довел клиентов до этого шага и передал вам. Свяжитесь с ними')}</small></div>
      ${waiting.map(c => { const l = c.leadId && N.lead(c.leadId), m = c.managerId && N.user(c.managerId); return `<div class="wait-row">
        ${N.chIcon(c.channel, 22)}
        <div class="wr-main"><b>${N.esc(N.clientName(c))}</b><small>${N.esc(c.client.company || c.client.phone || c.client.handle || '')}</small></div>
        <div class="wr-what">${l ? N.esc(l.items.map(i => N.tx(N.product(i.pid).name) + ' × ' + i.qty).join(', ')) : ''}${l && N.leadSum(l) ? ` · <b>${N.money(N.leadSum(l))}</b>` : ''}</div>
        <div class="wr-who"><small>${m ? N.esc(N.tx(m.name)) : ''}</small><small class="warn-txt">${N.icon('clock', 13)} ${N.waitFor(c.waitSince || c.lastAt)}</small></div>
        <button class="btn btn-primary btn-sm" data-chat="${c.id}">${N.t('Открыть')}</button>
      </div>`; }).join('')}
    </div>` : ''}

    <div class="kpis">
      <div class="kpi"><span>${N.t('Обращений сегодня')}</span><b>${today.length}</b><small>${N.t('из всех каналов')}</small></div>
      <div class="kpi"><span>${N.t('Ведет ИИ')}</span><b>${aiNow.length}</b><small>${N.t('отвечает и уточняет детали')}</small></div>
      <div class="kpi ${waiting.length ? 'kpi-warn' : ''}"><span>${N.t('Ждут менеджера')}</span><b>${waiting.length}</b><small>${N.t('готовы к договору или просят человека')}</small></div>
      <div class="kpi"><span>${N.t('Сделки в работе')}</span><b>${N.compact(N.sum(pipe, N.leadSum))}</b><small>${N.t('{n} заявок в воронке', { n: pipe.length })}</small></div>
    </div>

    <div class="grid-2">
      <div class="panel">
        <div class="panel-h"><b>${N.t('Как идут заявки')}</b><button class="link" data-go="leads">${N.t('Все заявки')} ${N.icon('chev-right', 14)}</button></div>
        <div class="funnel">${N.STAGES.map(s => { const ls = db.leads.filter(l => l.stage === s.id); return `<div class="fn-row"><span class="fn-name">${N.t(s.name)}</span><span class="fn-bar"><i class="tone-${s.tone}" style="width:${Math.max(4, ls.length / maxStage * 100)}%"></i></span><b>${ls.length}</b><small>${N.sum(ls, N.leadSum) ? N.compact(N.sum(ls, N.leadSum)) : ''}</small></div>`; }).join('')}</div>
        <div class="flow">
          <div><span>1</span><b>${N.t('Клиент пишет')}</b><small>Telegram, WhatsApp, Instagram</small></div>
          <div><span>2</span><b>${N.t('ИИ отвечает')}</b><small>${N.t('по каталогу и остаткам')}</small></div>
          <div><span>3</span><b>${N.t('Заявка в системе')}</b><small>${N.t('товары, количество, контакты')}</small></div>
          <div><span>4</span><b>${N.t('Менеджер')}</b><small>${N.t('договор и оплата')}</small></div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-h"><b>${N.t('Каналы')}</b>${N.can('channels') ? `<button class="link" data-go="channels">${N.t('Настроить')} ${N.icon('chev-right', 14)}</button>` : ''}</div>
        ${db.channels.map(ch => { const cs = chats.filter(c => c.channel === ch.id); const share = chats.length ? Math.round(cs.length / chats.length * 100) : 0; return `<div class="ch-row">
          ${N.chIcon(ch.id, 30)}<div class="chr-main"><b>${N.chName(ch.id)}</b><small>${N.esc(ch.account)}</small><span class="bar"><i style="width:${share}%"></i></span></div>
          <div class="chr-n"><b>${cs.length}</b><small>${N.t('диалогов')}</small></div>${N.badge(ch.on ? N.t('Подключен') : N.t('Отключен'), ch.on ? 'green' : 'gray', true)}</div>`; }).join('')}
        <div class="ai-today">
          <div><b>${aiMsgsToday}</b><small>${N.t('ответов ИИ сегодня')}</small></div>
          <div><b>${handedToday}</b><small>${N.t('передано менеджеру')}</small></div>
          <div><b>RU ${langs.ru} · UZ ${langs.uz} · EN ${langs.en}</b><small>${N.t('языки клиентов')}</small></div>
        </div>
      </div>
    </div>

    <div class="grid-2 wide-left">
      <div class="panel">
        <div class="panel-h"><b>${N.t('Последние заявки')}</b><button class="link" data-go="leads">${N.t('Все заявки')} ${N.icon('chev-right', 14)}</button></div>
        <div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>${N.t('Клиент')}</th><th>${N.t('Канал')}</th><th>${N.t('Что нужно')}</th><th class="r">${N.t('Сумма')}</th><th>${N.t('Этап')}</th></tr></thead>
          <tbody>${recent.map(l => { const c = N.chat(l.chatId) || { client: {} }; return `<tr data-lead="${l.id}">
            <td data-l="${N.t('Клиент')}"><div class="who-cell">${N.avatar(N.clientName(c), 30)}<span><b>${N.esc(N.clientName(c))}</b><small>№${l.num} · ${N.fmtShort(l.updatedAt)}</small></span></div></td>
            <td data-l="${N.t('Канал')}">${N.chIcon(l.channel, 16)} ${N.chName(l.channel)}</td>
            <td data-l="${N.t('Что нужно')}" class="wrap">${N.esc(l.items.map(i => N.tx(N.product(i.pid).name) + ' × ' + i.qty).join(', ')) || `<span class="muted">${N.t('уточняется')}</span>`}</td>
            <td data-l="${N.t('Сумма')}" class="r nowrap">${N.leadSum(l) ? N.money(N.leadSum(l)) : ''}</td>
            <td data-l="${N.t('Этап')}">${N.stageBadge(l.stage)}</td></tr>`; }).join('')}</tbody>
        </table></div>
      </div>
      <div class="panel">
        <div class="panel-h"><b>${N.t('Склад: требует внимания')}</b><button class="link" data-go="products">${N.t('Продукция')} ${N.icon('chev-right', 14)}</button></div>
        ${low.length ? low.slice(0, 7).map(p => `<div class="stock-row"><span class="cat-ic cat-${p.cat}">${N.icon(N.CATS.find(c => c.id === p.cat).icon, 16)}</span><div><b>${N.esc(N.tx(p.name))}</b><small>${p.sku}${N.reserved(p.id) ? ' · ' + N.t('в резерве {n}', { n: N.reserved(p.id) }) : ''}</small></div>${N.stockBadge(p)}</div>`).join('') : `<p class="muted">${N.t('Все позиции в наличии')}</p>`}
      </div>
    </div>`;
  };

  N.page('overview', {
    render(el) {
      root = el;
      el.innerHTML = html();
      el.addEventListener('click', e => {
        const g = e.target.closest('[data-go]'); if (g) { N.go(g.dataset.go); return; }
        const c = e.target.closest('[data-chat]'); if (c) { N.go('dialogs', { id: c.dataset.chat }); return; }
        const l = e.target.closest('[data-lead]'); if (l) N.openLead(l.dataset.lead);
      });
    },
    update(what) { if (root && root.isConnected && what !== 'typing' && what !== 'extract') root.innerHTML = html(); },
    destroy() { root = null; },
  });
})();

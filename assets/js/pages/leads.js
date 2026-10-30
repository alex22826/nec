/* Заявки: воронка и таблица. Заявка создается из диалога автоматически,
   ИИ переносит в нее товары, количество и контакты клиента. */
(function () {
  const N = window.N;
  const st = { view: 'board', q: '', ch: 'all', mgr: 'all' };
  let root = null;

  const itemsText = l => l.items.map(i => { const p = N.product(i.pid); return p ? `${N.tx(p.name)} × ${N.fmtNum(i.qty)}` : ''; })
    .concat(l.services.map(s => N.tx((N.service(s.sid) || {}).name))).filter(Boolean).join(', ');
  const clientOf = l => { const c = N.chat(l.chatId); return c ? c : { client: {}, channel: l.channel }; };
  const filtered = () => {
    const q = st.q.trim().toLowerCase();
    return N.db.leads.filter(l => (st.ch === 'all' || l.channel === st.ch) && (st.mgr === 'all' || (l.managerId || '') === (st.mgr === 'none' ? '' : st.mgr)))
      .filter(l => { if (!q) return true; const c = clientOf(l).client; return [l.num, c.name, c.handle, c.phone, c.company, itemsText(l)].join(' ').toLowerCase().includes(q); });
  };

  const cardHtml = l => {
    const c = clientOf(l), m = l.managerId && N.user(l.managerId), sum = N.leadSum(l);
    const waiting = c.status === 'wait';
    return `<div class="lead ${waiting ? 'is-wait' : ''}" draggable="true" data-lead="${l.id}">
      <div class="lead-top"><span class="num">№${l.num}</span>${N.chIcon(l.channel, 16)}<small>${N.fmtShort(l.updatedAt)}</small></div>
      <b class="lead-name">${N.esc(N.clientName(c))}</b>
      ${c.client.company ? `<small class="muted">${N.esc(c.client.company)}</small>` : ''}
      <p class="lead-items">${N.esc(itemsText(l)) || `<span class="muted">${N.t('ИИ выясняет потребность')}</span>`}</p>
      ${waiting ? `<span>${N.badge(N.t('Ждет менеджера'), 'amber', true)}</span>` : ''}
      <div class="lead-bot"><b>${sum ? N.money(sum) : ''}</b>${m ? N.avatar(N.tx(m.name), 24, m.color) : ''}</div>
    </div>`;
  };
  const boardHtml = list => `<div class="board">${N.STAGES.map(s => {
    const ls = list.filter(l => l.stage === s.id);
    return `<div class="col" data-stage="${s.id}">
      <div class="col-h tone-${s.tone}"><span><i class="dot"></i>${N.t(s.name)}</span><b>${ls.length}</b></div>
      <div class="col-sum">${N.money(N.sum(ls, N.leadSum))}</div>
      <div class="col-body">${ls.map(cardHtml).join('') || `<p class="col-empty">${N.t('Пусто')}</p>`}</div>
    </div>`;
  }).join('')}</div>`;
  const tableHtml = list => `<div class="tbl-wrap"><table class="tbl">
    <thead><tr><th>№</th><th>${N.t('Дата')}</th><th>${N.t('Клиент')}</th><th>${N.t('Канал')}</th><th>${N.t('Что нужно')}</th><th class="r">${N.t('Сумма')}</th><th>${N.t('Этап')}</th><th>${N.t('Менеджер')}</th></tr></thead>
    <tbody>${list.map(l => { const c = clientOf(l), m = l.managerId && N.user(l.managerId); return `<tr data-lead="${l.id}">
      <td data-l="№"><b>${l.num}</b></td><td data-l="${N.t('Дата')}">${N.fmtDate(l.createdAt)}</td>
      <td data-l="${N.t('Клиент')}"><b>${N.esc(N.clientName(c))}</b><br><small class="muted">${N.esc(c.client.company || c.client.phone || '')}</small></td>
      <td data-l="${N.t('Канал')}">${N.chIcon(l.channel, 16)} ${N.chName(l.channel)}</td>
      <td data-l="${N.t('Что нужно')}" class="wrap">${N.esc(itemsText(l))}</td>
      <td data-l="${N.t('Сумма')}" class="r nowrap">${N.leadSum(l) ? N.money(N.leadSum(l)) : ''}</td>
      <td data-l="${N.t('Этап')}">${N.stageBadge(l.stage)}</td>
      <td data-l="${N.t('Менеджер')}">${m ? N.esc(N.tx(m.name)) : `<span class="muted">${N.t('не назначен')}</span>`}</td></tr>`; }).join('') || `<tr><td colspan="8" class="muted">${N.t('Заявок не найдено')}</td></tr>`}</tbody></table></div>`;

  const paint = () => {
    const list = filtered();
    N.html(N.qs('#leadsBody', root), st.view === 'board' ? boardHtml(list) : tableHtml(list));
  };

  const exportCSV = () => {
    const rows = [['№', N.t('Дата'), N.t('Клиент'), N.t('Телефон'), N.t('Компания'), N.t('Город'), N.t('Канал'), N.t('Что нужно'), N.t('Сумма') + ', $', N.t('Этап'), N.t('Менеджер')]];
    filtered().forEach(l => { const c = clientOf(l).client, m = l.managerId && N.user(l.managerId); rows.push([l.num, N.fmtDT(l.createdAt), c.name, c.phone, c.company, c.city, N.chName(l.channel), itemsText(l), N.leadSum(l), N.t(N.stage(l.stage).name), m ? N.tx(m.name) : '']); });
    N.downloadCSV(`nec-zayavki-${N.fmtDate(Date.now())}.csv`, rows);
  };

  /* ---------- окно заявки ---------- */
  N.openLead = id => {
    const l = N.lead(id); if (!l) return;
    const chat = N.chat(l.chatId);
    const draft = { items: l.items.map(i => Object.assign({}, i)), services: l.services.map(s => Object.assign({}, s)), stage: l.stage, managerId: l.managerId || '', note: l.note || '' };
    const c = chat ? chat.client : {};
    const body = () => {
      const total = N.sum(draft.items, i => i.qty * i.price) + N.sum(draft.services, s => s.price || 0);
      return `
      <div class="lead-client">
        ${N.avatar(N.clientName(chat || { client: c }), 44)}
        <div><b>${N.esc(N.clientName(chat || { client: c }))}</b><small>${N.chIcon(l.channel, 14)} ${N.chName(l.channel)}${c.phone ? ' · ' + N.esc(c.phone) : ''}${c.company ? ' · ' + N.esc(c.company) : ''}${c.city ? ' · ' + N.esc(c.city) : ''}</small></div>
        ${chat ? `<button class="btn btn-light btn-sm" data-go-chat>${N.icon('chat', 15)} ${N.t('Диалог')}</button>` : ''}
      </div>
      <div class="f-label">${N.t('Этап')}</div>
      <div class="stepper">${N.STAGES.map(s => `<button type="button" class="step tone-${s.tone} ${draft.stage === s.id ? 'on' : ''}" data-stage="${s.id}">${N.t(s.name)}</button>`).join('')}</div>
      <div class="f-label">${N.t('Товары')}</div>
      <table class="tbl mini"><thead><tr><th>${N.t('Позиция')}</th><th class="r">${N.t('Кол-во')}</th><th class="r">${N.t('Цена')}</th><th class="r">${N.t('Сумма')}</th><th></th></tr></thead><tbody>
        ${draft.items.map((i, k) => { const p = N.product(i.pid); const a = N.available(p.id) + (l.stage === 'contract' ? (l.items.find(x => x.pid === p.id) || {}).qty || 0 : 0); return `<tr>
          <td data-l="${N.t('Позиция')}"><b>${N.esc(N.tx(p.name))}</b><br><small class="${i.qty > a && l.stage !== 'won' ? 'warn-txt' : 'muted'}">${N.t('доступно')}: ${N.fmtNum(a)} ${N.unit(p)}${i.qty > a && l.stage !== 'won' ? ', ' + N.t('остальное под заказ {d} дн.', { d: p.lead }) : ''}</small></td>
          <td data-l="${N.t('Кол-во')}" class="r"><input class="inp num" type="number" min="1" value="${i.qty}" data-qty="${k}"></td>
          <td data-l="${N.t('Цена')}" class="r nowrap">${N.money(i.price)}</td>
          <td data-l="${N.t('Сумма')}" class="r nowrap"><b>${N.money(i.qty * i.price)}</b></td>
          <td class="r"><button class="icon-btn sm" data-del-item="${k}" title="${N.t('Убрать')}">${N.icon('x', 15)}</button></td></tr>`; }).join('') || `<tr><td colspan="5" class="muted">${N.t('Товаров пока нет')}</td></tr>`}
      </tbody></table>
      <div class="add-row"><select class="sel" data-add-item><option value="">${N.t('Добавить товар')}</option>${N.CATS.map(cat => `<optgroup label="${N.esc(N.tx(cat.name))}">${N.db.products.filter(p => p.cat === cat.id).map(p => `<option value="${p.id}">${N.esc(N.tx(p.name))}, ${N.money(p.price)}</option>`).join('')}</optgroup>`).join('')}</select></div>
      <div class="f-label">${N.t('Услуги')}</div>
      <div class="svc-tags">${draft.services.map((s, k) => `<span class="tagx">${N.esc(N.tx(N.service(s.sid).name))} <small>${s.price ? N.t('от') + ' ' + N.money(s.price) : N.t('по смете')}</small><button data-del-svc="${k}" aria-label="${N.t('Убрать')}">${N.icon('x', 12)}</button></span>`).join('')}
        <select class="sel sm" data-add-svc><option value="">${N.t('Добавить услугу')}</option>${N.db.services.filter(s => !draft.services.some(x => x.sid === s.id)).map(s => `<option value="${s.id}">${N.esc(N.tx(s.name))}</option>`).join('')}</select></div>
      <div class="lead-total"><span>${N.t('Итого по заявке')}</span><b>${N.money(total)}</b></div>
      <div class="grid2">
        <label><span class="f-label">${N.t('Менеджер')}</span><select class="sel" data-mgr><option value="">${N.t('не назначен')}</option>${N.managers().map(u => `<option value="${u.id}" ${u.id === draft.managerId ? 'selected' : ''}>${N.esc(N.tx(u.name))}</option>`).join('')}</select></label>
        <label><span class="f-label">${N.t('Комментарий')}</span><input class="inp" data-note value="${N.esc(draft.note)}" placeholder="${N.t('Например, договорились созвониться')}"></label>
      </div>
      ${draft.stage === 'contract' ? `<p class="hint">${N.icon('info', 15)} ${N.t('На этапе «Договор» товары резервируются на складе.')}</p>` : ''}
      ${draft.stage === 'won' && l.stage !== 'won' ? `<p class="hint">${N.icon('info', 15)} ${N.t('При сохранении товары спишутся со склада.')}</p>` : ''}`;
    };
    N.modal({
      title: `${N.t('Заявка')} №${l.num}`, wide: true, body: body(),
      foot: `<button class="btn btn-ghost" data-close>${N.t('Отмена')}</button><button class="btn btn-primary" data-save>${N.t('Сохранить')}</button>`,
      onMount: m => {
        const re = () => { const b = m.el.querySelector('.modal-body'), y = b.scrollTop; b.innerHTML = body(); b.scrollTop = y; };
        m.el.addEventListener('click', e => {
          const t = e.target;
          if (t.closest('[data-stage]')) { draft.stage = t.closest('[data-stage]').dataset.stage; re(); }
          else if (t.closest('[data-del-item]')) { draft.items.splice(+t.closest('[data-del-item]').dataset.delItem, 1); re(); }
          else if (t.closest('[data-del-svc]')) { draft.services.splice(+t.closest('[data-del-svc]').dataset.delSvc, 1); re(); }
          else if (t.closest('[data-go-chat]')) { m.close(); N.go('dialogs', { id: chat.id }); }
          else if (t.closest('[data-save]')) {
            l.items = draft.items; l.services = draft.services; l.managerId = draft.managerId || null; l.note = draft.note; l.updatedAt = Date.now();
            if (chat) { chat.card.items = l.items.map(i => ({ pid: i.pid, qty: i.qty, ok: true })); chat.card.services = l.services.map(s => s.sid); chat.managerId = l.managerId; }
            const wasWon = l.stage === 'won';
            N.setStage(l, draft.stage);
            N.changed('lead');
            m.close();
            N.toast(draft.stage === 'won' && !wasWon ? N.t('Сделка закрыта, товары списаны со склада') : N.t('Заявка сохранена'), { tone: 'green', icon: 'check' });
          }
        });
        m.el.addEventListener('change', e => {
          const t = e.target;
          if (t.matches('[data-qty]')) { draft.items[+t.dataset.qty].qty = Math.max(1, Math.round(N.parseNum(t.value))); re(); }
          else if (t.matches('[data-add-item]') && t.value) { const p = N.product(t.value), ex = draft.items.find(i => i.pid === p.id); if (ex) ex.qty++; else draft.items.push({ pid: p.id, qty: 1, ok: true, price: p.price }); re(); }
          else if (t.matches('[data-add-svc]') && t.value) { const s = N.service(t.value); draft.services.push({ sid: s.id, price: s.price }); re(); }
          else if (t.matches('[data-mgr]')) draft.managerId = t.value;
        });
        m.el.addEventListener('input', e => { if (e.target.matches('[data-note]')) draft.note = e.target.value; });
      },
    });
  };

  N.page('leads', {
    render(el) {
      root = el;
      el.innerHTML = `
        <div class="toolbar">
          <div class="seg" data-view>
            <button data-v="board" class="${st.view === 'board' ? 'on' : ''}">${N.icon('kanban', 15)} ${N.t('Воронка')}</button>
            <button data-v="table" class="${st.view === 'table' ? 'on' : ''}">${N.icon('list', 15)} ${N.t('Таблица')}</button>
          </div>
          <label class="search">${N.icon('search', 16)}<input type="search" placeholder="${N.t('Клиент, номер, товар')}" value="${N.esc(st.q)}" data-q></label>
          <select class="sel" data-ch>${[['all', 'Все каналы'], ['tg', 'Telegram'], ['wa', 'WhatsApp'], ['ig', 'Instagram'], ['site', 'Сайт']].map(([v, t]) => `<option value="${v}" ${st.ch === v ? 'selected' : ''}>${N.t(t)}</option>`).join('')}</select>
          <select class="sel" data-mgr><option value="all">${N.t('Все менеджеры')}</option>${N.managers().map(u => `<option value="${u.id}" ${st.mgr === u.id ? 'selected' : ''}>${N.esc(N.tx(u.name))}</option>`).join('')}<option value="none" ${st.mgr === 'none' ? 'selected' : ''}>${N.t('Без менеджера')}</option></select>
          <span class="grow"></span>
          <button class="btn btn-light" data-export>${N.icon('download', 16)} ${N.t('Выгрузить в Excel')}</button>
        </div>
        <p class="page-note">${N.t('Заявки создаются из переписки автоматически. Перетащите карточку в другой этап или откройте ее, чтобы поправить состав и менеджера.')}</p>
        <div id="leadsBody"></div>`;
      paint();
      el.querySelector('[data-view]').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; st.view = b.dataset.v; el.querySelectorAll('[data-view] button').forEach(x => x.classList.toggle('on', x === b)); paint(); });
      el.querySelector('[data-q]').addEventListener('input', e => { st.q = e.target.value; paint(); });
      el.querySelector('[data-ch]').addEventListener('change', e => { st.ch = e.target.value; paint(); });
      el.querySelector('[data-mgr]').addEventListener('change', e => { st.mgr = e.target.value; paint(); });
      el.querySelector('[data-export]').addEventListener('click', exportCSV);
      el.addEventListener('click', e => { const c = e.target.closest('[data-lead]'); if (c) N.openLead(c.dataset.lead); });
      // перетаскивание между этапами
      let dragId = null;
      el.addEventListener('dragstart', e => { const c = e.target.closest('[data-lead]'); if (!c) return; dragId = c.dataset.lead; c.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; });
      el.addEventListener('dragend', e => { const c = e.target.closest('[data-lead]'); if (c) c.classList.remove('drag'); el.querySelectorAll('.col.over').forEach(x => x.classList.remove('over')); });
      el.addEventListener('dragover', e => { const col = e.target.closest('.col'); if (!col || !dragId) return; e.preventDefault(); el.querySelectorAll('.col.over').forEach(x => x !== col && x.classList.remove('over')); col.classList.add('over'); });
      el.addEventListener('drop', e => {
        const col = e.target.closest('.col'); if (!col || !dragId) return;
        e.preventDefault();
        const l = N.lead(dragId); dragId = null;
        if (l && l.stage !== col.dataset.stage) {
          const won = col.dataset.stage === 'won';
          N.setStage(l, col.dataset.stage); N.changed('lead');
          N.toast(won ? N.t('Сделка закрыта, товары списаны со склада') : N.t('Заявка №{n}: {s}', { n: l.num, s: N.t(N.stage(l.stage).name) }), { tone: 'green', icon: 'check' });
        }
      });
    },
    update(what) { if (root && root.isConnected && what !== 'typing') paint(); },
    destroy() { root = null; },
  });
})();

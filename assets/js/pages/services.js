/* Услуги: проектирование, строительство, монтаж, производство, сервис.
   ИИ предлагает их, когда клиент спрашивает о монтаже, проекте или обслуживании. */
(function () {
  const N = window.N;
  const st = { cat: 'all' };
  let root = null;

  const inLeads = sid => N.db.leads.filter(l => !['won', 'lost'].includes(l.stage) && l.services.some(s => s.sid === sid)).length;
  const cardHtml = s => {
    const c = N.SCATS.find(x => x.id === s.cat), n = inLeads(s.id);
    return `<button class="svc" data-s="${s.id}">
      <span class="svc-ic scat-${s.cat}">${N.icon(c.icon, 20)}</span>
      <b>${N.esc(N.tx(s.name))}</b>
      <p>${N.esc(N.tx(s.desc))}</p>
      <div class="svc-bot">
        <span><small>${N.t('Стоимость')}</small><b>${s.price ? N.t('от') + ' ' + N.money(s.price) : N.t('по смете')}</b>${s.price ? `<small> ${N.esc(N.tx(s.unit))}</small>` : ''}</span>
        <span><small>${N.t('Срок')}</small><b>${N.esc(N.tx(s.term))}</b></span>
      </div>
      ${n ? `<span class="svc-used">${N.t('в заявках: {n}', { n })}</span>` : ''}
    </button>`;
  };
  const paint = () => {
    const cats = N.SCATS.filter(c => st.cat === 'all' || c.id === st.cat);
    N.html(N.qs('#svcBody', root), cats.map(c => {
      const list = N.db.services.filter(s => s.cat === c.id);
      return list.length ? `<h3 class="grp-h">${N.icon(c.icon, 18)} ${N.esc(N.tx(c.name))}</h3><div class="svc-grid">${list.map(cardHtml).join('')}</div>` : '';
    }).join(''));
  };

  const openService = id => {
    const isNew = !id, edit = N.canEdit();
    const s = isNew ? { id: N.uid('s-'), cat: st.cat === 'all' ? 'install' : st.cat, name: { ru: '', uz: '', en: '' }, desc: { ru: '', uz: '', en: '' }, price: null, unit: { ru: 'за объект', uz: 'obyekt uchun', en: 'per site' }, term: { ru: '', uz: '', en: '' }, kw: [] } : N.service(id);
    if (!edit) {
      N.modal({ title: N.esc(N.tx(s.name)), body: `<p>${N.esc(N.tx(s.desc))}</p><div class="kvs"><div><span>${N.t('Стоимость')}</span><b>${s.price ? N.t('от') + ' ' + N.money(s.price) + ' ' + N.esc(N.tx(s.unit)) : N.t('по смете')}</b></div><div><span>${N.t('Срок')}</span><b>${N.esc(N.tx(s.term))}</b></div></div>`, foot: `<button class="btn btn-ghost" data-close>${N.t('Закрыть')}</button>` });
      return;
    }
    N.modal({
      title: isNew ? N.t('Новая услуга') : N.esc(N.tx(s.name)), wide: true,
      body: `
        <label><span class="f-label">${N.t('Раздел')}</span><select class="sel" name="cat">${N.SCATS.map(c => `<option value="${c.id}" ${s.cat === c.id ? 'selected' : ''}>${N.esc(N.tx(c.name))}</option>`).join('')}</select></label>
        ${N.LANGS.map(l => `<label><span class="f-label">${N.t('Название')} ${l.label}</span><input class="inp" name="name_${l.id}" value="${N.esc(s.name[l.id])}"></label>`).join('')}
        ${N.LANGS.map(l => `<label><span class="f-label">${N.t('Описание')} ${l.label}</span><input class="inp" name="desc_${l.id}" value="${N.esc(s.desc[l.id])}"></label>`).join('')}
        <div class="grid4">
          <label><span class="f-label">${N.t('Цена от, $')}</span><input class="inp" name="price" type="number" min="0" value="${s.price ?? ''}" placeholder="${N.t('пусто = по смете')}"></label>
          <label><span class="f-label">${N.t('За что')}</span><input class="inp" name="unit" value="${N.esc(N.tx(s.unit))}"></label>
          <label><span class="f-label">${N.t('Срок')}</span><input class="inp" name="term" value="${N.esc(N.tx(s.term))}"></label>
        </div>
        <label><span class="f-label">${N.t('Слова, по которым ИИ узнает услугу')}</span><input class="inp" name="kw" value="${N.esc(s.kw.join(', '))}" placeholder="${N.t('через запятую')}"></label>`,
      foot: `${!isNew ? `<button class="btn btn-ghost danger" data-del>${N.icon('trash', 15)} ${N.t('Удалить')}</button><span class="grow"></span>` : ''}<button class="btn btn-ghost" data-close>${N.t('Отмена')}</button><button class="btn btn-primary" data-save>${N.t('Сохранить')}</button>`,
      onMount: m => {
        m.el.addEventListener('click', async e => {
          if (e.target.closest('[data-del]')) {
            if (await N.confirm(N.t('Удалить услугу?'), N.t('Удалить'))) { N.db.services = N.db.services.filter(x => x.id !== s.id); N.db.chats.forEach(c => { c.card.services = c.card.services.filter(x => x !== s.id); }); N.db.leads.forEach(l => { l.services = l.services.filter(x => x.sid !== s.id); }); N.changed('service'); m.close(); }
            return;
          }
          if (!e.target.closest('[data-save]')) return;
          const f = n => m.el.querySelector(`[name="${n}"]`).value.trim();
          s.cat = f('cat');
          N.LANGS.forEach(l => { s.name[l.id] = f('name_' + l.id); s.desc[l.id] = f('desc_' + l.id); });
          if (!s.name.ru) { N.toast(N.t('Укажите название на русском'), { tone: 'red', icon: 'alert' }); return; }
          N.LANGS.forEach(l => { if (!s.name[l.id]) s.name[l.id] = s.name.ru; if (!s.desc[l.id]) s.desc[l.id] = s.desc.ru; });
          s.price = f('price') === '' ? null : Math.max(0, N.parseNum(f('price')));
          s.unit = Object.assign({}, s.unit, { [N.lang]: f('unit') });
          s.term = Object.assign({}, s.term, { [N.lang]: f('term') });
          N.LANGS.forEach(l => { if (!s.term[l.id]) s.term[l.id] = f('term'); if (!s.unit[l.id]) s.unit[l.id] = f('unit'); });
          s.kw = f('kw').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
          if (isNew) N.db.services.push(s);
          N.changed('service'); m.close();
          N.toast(N.t('Услуга сохранена'), { tone: 'green', icon: 'check' });
        });
      },
    });
  };

  N.page('services', {
    render(el) {
      root = el;
      el.innerHTML = `
        <div class="cat-tabs" data-cats>
          <button class="ctab ${st.cat === 'all' ? 'on' : ''}" data-c="all">${N.icon('grid', 16)}<span>${N.t('Все')}</span><b>${N.db.services.length}</b></button>
          ${N.SCATS.map(c => `<button class="ctab ${st.cat === c.id ? 'on' : ''}" data-c="${c.id}">${N.icon(c.icon, 16)}<span>${N.esc(N.tx(c.name))}</span><b>${N.db.services.filter(s => s.cat === c.id).length}</b></button>`).join('')}
        </div>
        <div class="toolbar">
          <p class="page-note">${N.icon('sparkles', 15)} ${N.t('ИИ-менеджер предлагает эти услуги, когда клиент спрашивает про проект, монтаж, наладку или обслуживание, и добавляет их в заявку.')}</p>
          <span class="grow"></span>
          ${N.canEdit() ? `<button class="btn btn-primary" data-new>${N.icon('plus', 16)} ${N.t('Добавить услугу')}</button>` : ''}
        </div>
        <div id="svcBody"></div>`;
      paint();
      el.querySelector('[data-cats]').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; st.cat = b.dataset.c; el.querySelectorAll('.ctab').forEach(x => x.classList.toggle('on', x === b)); paint(); });
      el.addEventListener('click', e => {
        if (e.target.closest('[data-new]')) { openService(null); return; }
        const s = e.target.closest('[data-s]'); if (s) openService(s.dataset.s);
      });
    },
    update(what) { if (root && root.isConnected && ['service', 'lead', 'ai', 'reset', 'sync'].includes(what)) paint(); },
    destroy() { root = null; },
  });
})();

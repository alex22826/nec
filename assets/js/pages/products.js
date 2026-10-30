/* Продукция: каталог с остатками. Остатки и резерв видят все, менять может админ. */
(function () {
  const N = window.N;
  const st = { cat: 'all', q: '', inStock: false };
  let root = null;

  const catOf = id => N.CATS.find(c => c.id === id);
  const filtered = () => {
    const q = st.q.trim().toLowerCase();
    return N.db.products.filter(p => (st.cat === 'all' || p.cat === st.cat) && (!st.inStock || N.available(p.id) > 0))
      .filter(p => !q || [p.sku, N.tx(p.name), N.tx(p.spec), p.name.ru, p.name.en].join(' ').toLowerCase().includes(q));
  };
  const kpis = () => {
    const ps = N.db.products;
    return `<div class="kpis">
      <div class="kpi"><span>${N.t('Позиций в каталоге')}</span><b>${ps.length}</b><small>${N.t('{n} категорий', { n: N.CATS.length })}</small></div>
      <div class="kpi"><span>${N.t('Склад на сумму')}</span><b>${N.compact(N.sum(ps, p => p.stock * p.price))}</b><small>${N.t('по ценам каталога')}</small></div>
      <div class="kpi"><span>${N.t('В резерве по договорам')}</span><b>${N.compact(N.sum(ps, p => N.reserved(p.id) * p.price))}</b><small>${N.t('{n} позиций', { n: ps.filter(p => N.reserved(p.id)).length })}</small></div>
      <div class="kpi ${ps.some(p => N.stockState(p) !== 'ok') ? 'kpi-warn' : ''}"><span>${N.t('Мало или нет')}</span><b>${ps.filter(p => N.stockState(p) !== 'ok').length}</b><small>${N.t('под заказ: {n}', { n: ps.filter(p => N.stockState(p) === 'out').length })}</small></div>
    </div>`;
  };
  const tableHtml = () => {
    const list = filtered(), edit = N.canEdit();
    if (!list.length) return `<div class="empty">${N.icon('box', 28)}<p>${N.t('Ничего не найдено')}</p></div>`;
    return `<div class="tbl-wrap"><table class="tbl prod">
      <thead><tr><th>${N.t('Наименование')}</th><th>${N.t('Артикул')}</th><th class="r">${N.t('Цена')}</th><th class="r">${N.t('На складе')}</th><th class="r">${N.t('Резерв')}</th><th>${N.t('Доступно')}</th><th class="r">${N.t('Изготовление')}</th>${edit ? '<th></th>' : ''}</tr></thead>
      <tbody>${list.map(p => { const r = N.reserved(p.id); return `<tr data-p="${p.id}">
        <td data-l="${N.t('Наименование')}"><div class="who-cell"><span class="cat-ic cat-${p.cat}">${N.icon(catOf(p.cat).icon, 16)}</span><span><b>${N.esc(N.tx(p.name))}</b><small>${N.esc(N.tx(p.spec))}</small></span></div></td>
        <td data-l="${N.t('Артикул')}" class="nowrap muted">${p.sku}</td>
        <td data-l="${N.t('Цена')}" class="r nowrap"><b>${N.money(p.price)}</b>${p.unit === 'm' ? `<small class="muted"> / ${N.unit(p)}</small>` : ''}</td>
        <td data-l="${N.t('На складе')}" class="r nowrap">${N.fmtNum(p.stock)} ${N.unit(p)}</td>
        <td data-l="${N.t('Резерв')}" class="r nowrap">${r ? N.fmtNum(r) + ' ' + N.unit(p) : '<span class="muted">0</span>'}</td>
        <td data-l="${N.t('Доступно')}">${N.stockBadge(p)}</td>
        <td data-l="${N.t('Изготовление')}" class="r nowrap muted">${N.t('{n} дн.', { n: p.lead })}</td>
        ${edit ? `<td class="r nowrap"><button class="btn btn-light btn-sm" data-in="${p.id}" title="${N.t('Приход на склад')}">${N.icon('plus', 14)} ${N.t('Приход')}</button></td>` : ''}
      </tr>`; }).join('')}</tbody></table></div>`;
  };
  const paint = () => { N.html(N.qs('#pKpis', root), kpis()); N.html(N.qs('#pTable', root), tableHtml()); };

  const leadsWith = pid => N.db.leads.filter(l => ['qualify', 'offer', 'contract'].includes(l.stage) && l.items.some(i => i.pid === pid));

  // карточка товара: просмотр для менеджера, правка для админа
  const openProduct = (id) => {
    const isNew = !id, edit = N.canEdit();
    const p = isNew ? { id: N.uid('p'), cat: st.cat === 'all' ? 'parts' : st.cat, sku: 'NEC-', name: { ru: '', uz: '', en: '' }, spec: { ru: '', uz: '', en: '' }, price: 0, stock: 0, min: 1, lead: 30, unit: 'pcs', kw: [] } : N.product(id);
    const used = isNew ? [] : leadsWith(p.id);
    const body = edit ? `
      <div class="grid2">
        <label><span class="f-label">${N.t('Категория')}</span><select class="sel" name="cat">${N.CATS.map(c => `<option value="${c.id}" ${p.cat === c.id ? 'selected' : ''}>${N.esc(N.tx(c.name))}</option>`).join('')}</select></label>
        <label><span class="f-label">${N.t('Артикул')}</span><input class="inp" name="sku" value="${N.esc(p.sku)}"></label>
      </div>
      ${N.LANGS.map(l => `<label><span class="f-label">${N.t('Название')} ${l.label}</span><input class="inp" name="name_${l.id}" value="${N.esc(p.name[l.id])}"></label>`).join('')}
      ${N.LANGS.map(l => `<label><span class="f-label">${N.t('Характеристики')} ${l.label}</span><input class="inp" name="spec_${l.id}" value="${N.esc(p.spec[l.id])}"></label>`).join('')}
      <div class="grid4">
        <label><span class="f-label">${N.t('Цена, $')}</span><input class="inp" name="price" type="number" min="0" value="${p.price}"></label>
        <label><span class="f-label">${N.t('На складе')}</span><input class="inp" name="stock" type="number" min="0" value="${p.stock}"></label>
        <label><span class="f-label">${N.t('Мин. остаток')}</span><input class="inp" name="min" type="number" min="0" value="${p.min}"></label>
        <label><span class="f-label">${N.t('Изготовление, дн.')}</span><input class="inp" name="lead" type="number" min="0" value="${p.lead}"></label>
      </div>
      <label><span class="f-label">${N.t('Слова, по которым ИИ узнает товар')}</span><input class="inp" name="kw" value="${N.esc(p.kw.join(', '))}" placeholder="${N.t('через запятую, например: ктп, подстанция, ktp')}"></label>`
      : `<div class="pv">
        <span class="cat-ic big cat-${p.cat}">${N.icon(catOf(p.cat).icon, 28)}</span>
        <div><b>${N.esc(N.tx(p.name))}</b><p class="muted">${N.esc(N.tx(p.spec))}</p><small class="muted">${p.sku} · ${N.esc(N.tx(catOf(p.cat).name))}</small></div>
      </div>
      <div class="kvs">
        <div><span>${N.t('Цена')}</span><b>${N.money(p.price)}</b></div>
        <div><span>${N.t('На складе')}</span><b>${N.fmtNum(p.stock)} ${N.unit(p)}</b></div>
        <div><span>${N.t('Резерв')}</span><b>${N.fmtNum(N.reserved(p.id))} ${N.unit(p)}</b></div>
        <div><span>${N.t('Доступно')}</span>${N.stockBadge(p)}</div>
        <div><span>${N.t('Изготовление')}</span><b>${N.t('{n} дн.', { n: p.lead })}</b></div>
      </div>`;
    const usedHtml = used.length ? `<div class="f-label">${N.t('В заявках')}</div>${used.map(l => { const c = N.chat(l.chatId) || { client: {} }; const it = l.items.find(i => i.pid === p.id); return `<div class="used-row" data-lead="${l.id}">${N.chIcon(l.channel, 16)}<b>№${l.num}</b><span>${N.esc(N.clientName(c))}</span><span class="grow"></span><span>${N.fmtNum(it.qty)} ${N.unit(p)}</span>${N.stageBadge(l.stage)}</div>`; }).join('')}` : '';
    N.modal({
      title: isNew ? N.t('Новый товар') : N.esc(N.tx(p.name) || p.sku), wide: edit, body: body + usedHtml,
      foot: edit ? `${!isNew ? `<button class="btn btn-ghost danger" data-del>${N.icon('trash', 15)} ${N.t('Удалить')}</button><span class="grow"></span>` : ''}<button class="btn btn-ghost" data-close>${N.t('Отмена')}</button><button class="btn btn-primary" data-save>${N.t('Сохранить')}</button>` : `<button class="btn btn-ghost" data-close>${N.t('Закрыть')}</button>`,
      onMount: m => {
        m.el.addEventListener('click', async e => {
          const lr = e.target.closest('[data-lead]'); if (lr) { m.close(); N.openLead(lr.dataset.lead); return; }
          if (e.target.closest('[data-del]')) {
            if (N.db.leads.some(l => l.items.some(i => i.pid === p.id))) { N.toast(N.t('Товар есть в заявках, удалить нельзя. Поставьте остаток 0'), { tone: 'red', icon: 'alert' }); return; }
            if (await N.confirm(N.t('Удалить товар из каталога?'), N.t('Удалить'))) { N.db.products = N.db.products.filter(x => x.id !== p.id); N.changed('product'); m.close(); }
            return;
          }
          if (!e.target.closest('[data-save]')) return;
          const f = n => m.el.querySelector(`[name="${n}"]`).value;
          p.cat = f('cat'); p.sku = f('sku').trim();
          N.LANGS.forEach(l => { p.name[l.id] = f('name_' + l.id).trim(); p.spec[l.id] = f('spec_' + l.id).trim(); });
          if (!p.name.ru) { N.toast(N.t('Укажите название на русском'), { tone: 'red', icon: 'alert' }); return; }
          N.LANGS.forEach(l => { if (!p.name[l.id]) p.name[l.id] = p.name.ru; if (!p.spec[l.id]) p.spec[l.id] = p.spec.ru; });
          ['price', 'stock', 'min', 'lead'].forEach(k => { p[k] = Math.max(0, N.parseNum(f(k))); });
          p.kw = f('kw').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
          if (isNew) N.db.products.push(p);
          N.changed('product'); m.close();
          N.toast(N.t('Товар сохранен. ИИ уже знает о нем'), { tone: 'green', icon: 'check' });
        });
      },
    });
  };
  const openIncome = id => {
    const p = N.product(id);
    N.modal({
      title: N.t('Приход на склад'),
      body: `<p><b>${N.esc(N.tx(p.name))}</b><br><small class="muted">${N.t('Сейчас на складе')}: ${N.fmtNum(p.stock)} ${N.unit(p)}</small></p>
        <label><span class="f-label">${N.t('Сколько пришло')}, ${N.unit(p)}</span><input class="inp" type="number" min="1" value="1" data-n></label>`,
      foot: `<button class="btn btn-ghost" data-close>${N.t('Отмена')}</button><button class="btn btn-primary" data-ok>${N.t('Оприходовать')}</button>`,
      onMount: m => {
        const go = () => { const n = Math.round(N.parseNum(m.el.querySelector('[data-n]').value)); if (n <= 0) return; p.stock += n; N.changed('stock'); m.close(); N.toast(N.t('Остаток: {n}', { n: N.fmtNum(p.stock) + ' ' + N.unit(p) }), { tone: 'green', icon: 'check' }); };
        m.el.querySelector('[data-ok]').onclick = go;
        m.el.querySelector('[data-n]').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
      },
    });
  };

  N.page('products', {
    render(el) {
      root = el;
      const counts = Object.fromEntries(N.CATS.map(c => [c.id, N.db.products.filter(p => p.cat === c.id).length]));
      el.innerHTML = `
        <div id="pKpis"></div>
        <div class="cat-tabs" data-cats>
          <button class="ctab ${st.cat === 'all' ? 'on' : ''}" data-c="all">${N.icon('grid', 16)}<span>${N.t('Все')}</span><b>${N.db.products.length}</b></button>
          ${N.CATS.map(c => `<button class="ctab ${st.cat === c.id ? 'on' : ''}" data-c="${c.id}">${N.icon(c.icon, 16)}<span>${N.esc(N.tx(c.name))}</span><b>${counts[c.id]}</b></button>`).join('')}
        </div>
        <div class="toolbar">
          <label class="search">${N.icon('search', 16)}<input type="search" placeholder="${N.t('Название, артикул, характеристика')}" value="${N.esc(st.q)}" data-q></label>
          <label class="check"><input type="checkbox" data-in-stock ${st.inStock ? 'checked' : ''}> ${N.t('Только в наличии')}</label>
          <span class="grow"></span>
          ${N.canEdit() ? `<button class="btn btn-primary" data-new>${N.icon('plus', 16)} ${N.t('Добавить товар')}</button>` : `<small class="muted">${N.icon('lock', 14)} ${N.t('Цены и остатки меняет администратор')}</small>`}
        </div>
        <div id="pTable"></div>`;
      paint();
      el.querySelector('[data-cats]').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; st.cat = b.dataset.c; el.querySelectorAll('.ctab').forEach(x => x.classList.toggle('on', x === b)); paint(); });
      el.querySelector('[data-q]').addEventListener('input', e => { st.q = e.target.value; paint(); });
      el.querySelector('[data-in-stock]').addEventListener('change', e => { st.inStock = e.target.checked; paint(); });
      el.addEventListener('click', e => {
        if (e.target.closest('[data-new]')) { openProduct(null); return; }
        const inc = e.target.closest('[data-in]'); if (inc) { openIncome(inc.dataset.in); return; }
        const r = e.target.closest('[data-p]'); if (r) openProduct(r.dataset.p);
      });
    },
    update(what) { if (root && root.isConnected && !['typing', 'extract', 'read'].includes(what)) paint(); },
    destroy() { root = null; },
  });
})();

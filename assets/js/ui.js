/* =========================================================================
   NEC — общие элементы интерфейса: иконки, значки, окна, уведомления.
   ========================================================================= */
(function () {
  const N = window.N = window.N || {};

  /* ---------- иконки (контурные, 24×24) ---------- */
  const I = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/>',
    inbox: '<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 5h13L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8a2.1 2.1 0 0 1-3-3l8-8-1.3-1.3a4 4 0 0 0-5-5l2.6 2.6-1.9 1.9z" transform="translate(-2 0)"/>',
    plug: '<path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v5"/>',
    bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 13v1M15 13v1M9.5 17h5"/><circle cx="12" cy="3.5" r="1"/>',
    bell: '<path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    'file-sign': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 18c1.5-2 2.5-2 3 0s1.5 1 2.5-.5 1.5-.5 2.5.5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    play: '<path d="m7 4 13 8-13 8z"/>',
    'chev-down': '<path d="m6 9 6 6 6-6"/>',
    'chev-right': '<path d="m9 6 6 6-6 6"/>',
    'chev-left': '<path d="m15 6-6 6 6 6"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    droplet: '<path d="M12 2.7s6 6.4 6 11.3a6 6 0 0 1-12 0C6 9.1 12 2.7 12 2.7z"/>',
    wind: '<path d="M17.7 7.7A2.5 2.5 0 1 1 19.5 12H2M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    panel: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h3M13 10h3M8 14h3M13 14h3M8 18h8"/>',
    cog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    ruler: '<path d="M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4zM7.5 10.5l2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2"/>',
    factory: '<path d="M2 20V9l6 4V9l6 4V4h4l2 16z"/><path d="M6 17h2M11 17h2M16 17h2"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    refresh: '<path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M3 21v-5h5"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9zM5 2l.6 1.4L7 4l-1.4.6L5 6l-.6-1.4L3 4l1.4-.6z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M17.9 17.9A10 10 0 0 1 12 19c-6.5 0-10-7-10-7a18 18 0 0 1 5.1-5.9M9.9 4.2A9 9 0 0 1 12 4c6.5 0 10 7 10 7a18 18 0 0 1-2.2 3.2M14.1 14.1a3 3 0 1 1-4.2-4.2M2 2l20 20"/>',
    kanban: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M5.5 7h1M11.5 7h1M17.5 7h1"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',
    undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>',
    lock: '<rect x="4" y="11" width="16" height="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5"/>',
    truck: '<path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    card: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h6"/>',
  };
  N.icon = (name, size = 18, cls = '') => `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[name] || I.info}</svg>`;

  /* ---------- значки каналов ---------- */
  const CH = {
    tg: { color: '#229ED9', svg: '<path fill="#fff" d="M17.6 7.2 15.7 16.8c-.1.6-.5.8-1 .5l-2.9-2.1-1.4 1.3c-.2.2-.3.3-.6.3l.2-3 5.4-4.9c.2-.2 0-.3-.3-.1l-6.7 4.2-2.9-.9c-.6-.2-.6-.6.1-.9l11.3-4.4c.5-.2 1 .1.7 1.4z"/>' },
    wa: { color: '#25D366', svg: '<path fill="#fff" d="M12 5.5a6.5 6.5 0 0 0-5.6 9.8l-.9 3.2 3.3-.9A6.5 6.5 0 1 0 12 5.5zm3.4 8.9c-.1.4-.8.8-1.2.8-.3 0-.7.1-2.2-.5a7.6 7.6 0 0 1-3-2.6c-.2-.3-.7-1-.7-1.9s.5-1.3.6-1.5c.2-.2.4-.2.5-.2h.4c.1 0 .3 0 .4.3l.6 1.4c0 .1.1.2 0 .4l-.2.3-.3.3c-.1.1-.2.2-.1.4.1.2.6.9 1.2 1.5.8.7 1.4.9 1.6 1 .2.1.3.1.4 0l.6-.7c.1-.2.3-.2.4-.1l1.4.7c.2.1.3.1.3.2.1.1.1.5-.1.9z"/>' },
    ig: { color: 'url(#igGrad)', svg: '<rect x="6.5" y="6.5" width="11" height="11" rx="3.2" fill="none" stroke="#fff" stroke-width="1.6"/><circle cx="12" cy="12" r="2.6" fill="none" stroke="#fff" stroke-width="1.6"/><circle cx="15.2" cy="8.8" r=".8" fill="#fff"/>' },
    site: { color: '#0f2742', svg: '<circle cx="12" cy="12" r="5.6" fill="none" stroke="#f5b400" stroke-width="1.5"/><path fill="none" stroke="#f5b400" stroke-width="1.5" d="M6.4 12h11.2M12 6.4c1.8 1.6 1.8 9.6 0 11.2M12 6.4c-1.8 1.6-1.8 9.6 0 11.2"/>' },
    test: { color: '#64748b', svg: '<path fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" d="M9 8h6M10 8v4l-3 5h10l-3-5V8"/>' },
  };
  N.chIcon = (id, size = 18) => {
    const c = CH[id] || CH.test;
    return `<svg class="chi" width="${size}" height="${size}" viewBox="0 0 24 24" aria-label="${N.chName(id)}"><defs><linearGradient id="igGrad" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#f9a63b"/><stop offset=".5" stop-color="#e1306c"/><stop offset="1" stop-color="#7b3fe4"/></linearGradient></defs><circle cx="12" cy="12" r="12" fill="${c.color}"/>${c.svg}</svg>`;
  };

  /* ---------- мелочи ---------- */
  const PALETTE = ['#2563eb', '#0f766e', '#b45309', '#7c3aed', '#be123c', '#0369a1', '#4d7c0f', '#a21caf'];
  N.initials = name => String(name || '?').replace(/^[@+]/, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  N.colorOf = s => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return PALETTE[h % PALETTE.length]; };
  N.avatar = (name, size = 36, color) => `<span class="ava" style="width:${size}px;height:${size}px;background:${color || N.colorOf(name)};font-size:${Math.round(size * 0.38)}px">${N.esc(N.initials(name))}</span>`;
  N.badge = (text, tone = 'gray', dot) => `<span class="badge tone-${tone}">${dot ? '<i class="dot"></i>' : ''}${N.esc(text)}</span>`;
  N.statusBadge = st => { const s = N.STATUSES[st] || N.STATUSES.ai; return N.badge(N.t(s.name), s.tone, true); };
  N.stageBadge = id => { const s = N.stage(id); return N.badge(N.t(s.name), s.tone); };
  N.stockBadge = p => {
    const st = N.stockState(p), a = N.available(p.id);
    if (st === 'out') return N.badge(N.t('Под заказ'), 'red');
    return N.badge(N.fmtNum(a) + ' ' + N.unit(p), st === 'low' ? 'amber' : 'green');
  };
  N.qs = (sel, root = document) => root.querySelector(sel);
  N.qsa = (sel, root = document) => [...root.querySelectorAll(sel)];
  N.html = (el, html) => { if (el) el.innerHTML = html; return el; };
  N.clientName = c => c.client.name || c.client.handle || (c.channel === 'site' ? N.t('Посетитель сайта') : N.t('Клиент'));

  /* ---------- уведомления внизу экрана ---------- */
  N.toast = (msg, opt = {}) => {
    let box = N.qs('#toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
    const el = document.createElement('div');
    el.className = 'toast tone-' + (opt.tone || 'dark');
    el.innerHTML = `${opt.icon ? N.icon(opt.icon, 18) : ''}<div class="toast-body">${opt.title ? `<b>${N.esc(opt.title)}</b>` : ''}<span>${N.esc(msg)}</span></div>${opt.action ? `<button class="btn btn-sm btn-light">${N.esc(opt.action.label)}</button>` : ''}<button class="toast-x" aria-label="${N.t('Закрыть')}">${N.icon('x', 14)}</button>`;
    const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 250); };
    el.querySelector('.toast-x').onclick = close;
    if (opt.action) el.querySelector('.btn').onclick = () => { opt.action.fn(); close(); };
    box.appendChild(el);
    setTimeout(close, opt.timeout || 5000);
  };

  /* ---------- звук для новых уведомлений ---------- */
  let actx = null;
  N.beep = () => {
    if (!N.db || !N.db.settings.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      [660, 880].forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.frequency.value = f; o.type = 'sine';
        g.gain.setValueAtTime(0.0001, actx.currentTime + i * 0.12);
        g.gain.exponentialRampToValueAtTime(0.08, actx.currentTime + i * 0.12 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + i * 0.12 + 0.2);
        o.connect(g); g.connect(actx.destination); o.start(actx.currentTime + i * 0.12); o.stop(actx.currentTime + i * 0.12 + 0.22);
      });
    } catch (e) { /* звук недоступен */ }
  };

  /* ---------- модальные окна ---------- */
  N.modal = ({ title, body, foot, wide, onMount, onClose }) => {
    const wrap = document.createElement('div');
    wrap.className = 'modal-wrap';
    wrap.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true"><div class="modal-head"><h3>${title}</h3><button class="icon-btn" data-close aria-label="${N.t('Закрыть')}">${N.icon('x')}</button></div><div class="modal-body">${body}</div>${foot ? `<div class="modal-foot">${foot}</div>` : ''}</div>`;
    const esc = e => { if (e.key === 'Escape') close(); };
    const close = () => { document.removeEventListener('keydown', esc); wrap.classList.add('out'); setTimeout(() => wrap.remove(), 180); onClose && onClose(); };
    wrap.addEventListener('mousedown', e => { if (e.target === wrap) close(); });
    wrap.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', esc);
    document.body.appendChild(wrap);
    const m = { el: wrap.querySelector('.modal'), close };
    onMount && onMount(m);
    const f = wrap.querySelector('input:not([type=hidden]):not([readonly]), textarea, select');
    if (f && window.innerWidth > 760) setTimeout(() => f.focus(), 30);
    return m;
  };
  N.confirm = (text, okLabel) => new Promise(res => {
    let done = false;
    const m = N.modal({
      title: N.t('Подтвердите действие'), body: `<p>${N.esc(text)}</p>`,
      foot: `<button class="btn btn-ghost" data-close>${N.t('Отмена')}</button><button class="btn btn-primary" data-ok>${N.esc(okLabel || N.t('Да'))}</button>`,
      onMount: mm => { mm.el.querySelector('[data-ok]').onclick = () => { done = true; res(true); mm.close(); }; },
      onClose: () => { if (!done) res(false); },
    });
    return m;
  });

  /* ---------- выпадающее меню у кнопки ---------- */
  N.pop = (anchor, html, onMount, opt = {}) => {
    N.qsa('.pop').forEach(p => p.remove());
    const el = document.createElement('div');
    el.className = 'pop ' + (opt.cls || '');
    el.innerHTML = html;
    document.body.appendChild(el);
    const r = anchor.getBoundingClientRect(), w = el.offsetWidth;
    let left = opt.alignLeft ? r.left : r.right - w;
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    el.style.left = left + 'px';
    el.style.top = Math.min(r.bottom + 6, window.innerHeight - el.offsetHeight - 8) + 'px';
    const off = e => { if (!el.contains(e.target) && !anchor.contains(e.target)) close(); };
    const close = () => { el.remove(); document.removeEventListener('mousedown', off); };
    setTimeout(() => document.addEventListener('mousedown', off), 0);
    onMount && onMount(el, close);
    return close;
  };

  /* ---------- выгрузка CSV для Excel ---------- */
  N.downloadCSV = (name, rows) => {
    const cell = v => { const s = String(v ?? ''); return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const csv = '﻿' + rows.map(r => r.map(cell).join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
})();

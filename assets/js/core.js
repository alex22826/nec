/* =========================================================================
   NEC — ядро: база в localStorage, сессия, роли, события и операции
   с диалогами, заявками и складом. Время хранится в миллисекундах.
   ========================================================================= */
(function () {
  const N = window.N = window.N || {};
  N.APP_VERSION = '2026-10-30.1';
  N.COMPANY = { short: 'NEC', full: 'National Energy Company' };
  const DB_KEY = 'nec.db.v1';
  const SES_KEY = 'nec.session';
  N.DB_VERSION = 1;

  /* ---------- утилиты ---------- */
  N.uid = (p = '') => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  N.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  N.sum = (arr, f) => arr.reduce((s, x) => s + (f ? (+f(x) || 0) : (+x || 0)), 0);
  N.by = (arr, key = 'id') => Object.fromEntries(arr.map(x => [x[key], x]));
  N.store = {
    get(k, def = null) { try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* приватный режим */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ничего */ } },
  };

  /* ---------- числа, деньги, время ---------- */
  N.fmtNum = (n, dec = 0) => {
    const v = Math.round((+n || 0) * 10 ** dec) / 10 ** dec;
    const [i, f] = Math.abs(v).toFixed(dec).split('.');
    return (v < 0 ? '-' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (f && +f ? (N.lang === 'en' ? '.' : ',') + f.replace(/0+$/, '') : '');
  };
  N.money = n => '$' + N.fmtNum(n);
  N.parseNum = s => { const v = parseFloat(String(s ?? '').replace(/\s/g, '').replace(',', '.')); return isNaN(v) ? 0 : v; };
  N.compact = n => {
    const a = Math.abs(n);
    if (a >= 1e6) return '$' + N.fmtNum(n / 1e6, 2) + ' ' + N.t('млн');
    if (a >= 1e4) return '$' + N.fmtNum(n / 1e3, 0) + ' ' + N.t('тыс.');
    return N.money(n);
  };
  const pad = n => String(n).padStart(2, '0');
  const dayStart = ts => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
  N.isToday = ts => dayStart(ts) === dayStart(Date.now());
  N.hm = ts => { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  N.fmtDate = ts => { const d = new Date(ts); return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`; };
  N.fmtDT = ts => `${N.fmtDate(ts)} ${N.hm(ts)}`;
  N.fmtShort = ts => {
    if (N.isToday(ts)) return N.hm(ts);
    if (dayStart(ts) === dayStart(Date.now()) - 864e5) return N.t('вчера');
    const d = new Date(ts); return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;
  };
  N.ago = ts => {
    const m = Math.round((Date.now() - ts) / 6e4);
    if (m < 1) return N.t('только что');
    if (m < 60) return N.t('{n} мин назад', { n: m });
    if (N.isToday(ts)) return N.hm(ts);
    return N.fmtShort(ts) + ' ' + N.hm(ts);
  };

  N.waitFor = ts => {
    const m = Math.max(0, Math.round((Date.now() - ts) / 6e4));
    if (m < 1) return N.t('меньше минуты');
    if (m < 60) return N.t('{n} мин', { n: m });
    if (m < 60 * 24) return N.t('{n} ч {m} мин', { n: Math.floor(m / 60), m: m % 60 });
    return N.t('{n} дн.', { n: Math.floor(m / 1440) });
  };

  /* ---------- события ---------- */
  const subs = {};
  N.on = (evt, fn) => { (subs[evt] = subs[evt] || []).push(fn); };
  N.emit = (evt, data) => (subs[evt] || []).forEach(fn => { try { fn(data); } catch (e) { console.error(e); } });

  /* ---------- база ---------- */
  N.initDB = () => {
    let d = N.store.get(DB_KEY);
    if (!d || d.v !== N.DB_VERSION) { d = N.seed(); N.db = d; N.save(); }
    N.db = d;
    d.chats.forEach(c => { c.typing = null; }); // индикатор набора после перезагрузки не нужен
    return d;
  };
  let saveTimer = null;
  N.save = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => N.store.set(DB_KEY, N.db), 120);
  };
  // любое изменение данных: сохранить и перерисовать то, что открыто
  N.changed = (what) => { N.save(); N.emit('change', what); };
  N.resetDB = () => { N.store.del(DB_KEY); N.db = null; N.initDB(); N.emit('change', 'reset'); };

  /* ---------- роли и сессия ---------- */
  N.ROLES = {
    admin: { name: 'Администратор', pages: ['overview', 'dialogs', 'leads', 'products', 'services', 'channels', 'agent'], edit: true },
    manager: { name: 'Менеджер', pages: ['overview', 'dialogs', 'leads', 'products', 'services'], edit: false },
  };
  // SHA-256 от `логин:пароль:nec`, сами пароли лежат в ACCESS.txt
  const PASS = {
    admin: '5fce6b89555a9059eff5e742d55e98dcc6e02a906e03906b35080a57a6e561c4',
    manager: '3ad1b6ea18860c709258fd7727e25238f9dc2770dcb46bcef14bb2e1154a28ed',
  };
  const sha = async s => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  };
  N.login = async (login, pass) => {
    login = String(login || '').trim().toLowerCase();
    const u = N.db.users.find(x => x.login === login && PASS[x.login]);
    if (!u) return false;
    if (await sha(`${login}:${pass}:nec`) !== PASS[login]) return false;
    N.store.set(SES_KEY, { uid: u.id, at: Date.now() });
    return true;
  };
  N.quickLogin = role => {
    const u = N.db.users.find(x => x.role === role && PASS[x.login]);
    N.store.set(SES_KEY, { uid: u.id, at: Date.now() });
  };
  N.logout = () => { N.store.del(SES_KEY); location.href = 'index.html'; };
  N.me = () => { const s = N.store.get(SES_KEY); return s && N.db.users.find(u => u.id === s.uid) || null; };
  N.can = page => { const u = N.me(); return !!u && N.ROLES[u.role].pages.includes(page); };
  N.canEdit = () => { const u = N.me(); return !!u && N.ROLES[u.role].edit; };

  /* ---------- справочники ---------- */
  N.product = id => N.db.products.find(p => p.id === id);
  N.service = id => N.db.services.find(s => s.id === id);
  N.chat = id => N.db.chats.find(c => c.id === id);
  N.lead = id => N.db.leads.find(l => l.id === id);
  N.user = id => N.db.users.find(u => u.id === id);
  N.channel = id => N.db.channels.find(c => c.id === id);
  N.managers = () => N.db.users.filter(u => u.role === 'manager');
  N.unit = p => N.tx(N.UNITS[p.unit] || N.UNITS.pcs);

  /* ---------- склад ---------- */
  // резерв = товары в заявках на этапе «Договор», при «Сделке» товар списывается со склада
  N.reserved = pid => N.sum(N.db.leads.filter(l => l.stage === 'contract'), l => N.sum(l.items.filter(i => i.pid === pid), i => i.qty));
  N.available = pid => { const p = N.product(pid); return p ? Math.max(0, p.stock - N.reserved(pid)) : 0; };
  N.stockState = p => { const a = N.available(p.id); return a <= 0 ? 'out' : a <= p.min ? 'low' : 'ok'; };

  /* ---------- заявки ---------- */
  N.STAGES = [
    { id: 'new', name: 'Новая', tone: 'gray' },
    { id: 'qualify', name: 'Квалификация', tone: 'blue' },
    { id: 'offer', name: 'КП', tone: 'violet' },
    { id: 'contract', name: 'Договор', tone: 'amber' },
    { id: 'won', name: 'Сделка', tone: 'green' },
    { id: 'lost', name: 'Отказ', tone: 'red' },
  ];
  N.stage = id => N.STAGES.find(s => s.id === id) || N.STAGES[0];
  const stageIdx = id => N.STAGES.findIndex(s => s.id === id);
  N.leadSum = l => N.sum(l.items, i => i.qty * i.price) + N.sum(l.services, s => s.price || 0);

  N.ensureLead = chat => {
    let l = chat.leadId && N.lead(chat.leadId);
    if (!l) {
      l = { id: N.uid('l'), num: ++N.db.seq.lead, chatId: chat.id, channel: chat.channel, stage: 'new', items: [], services: [], managerId: chat.managerId || null, createdAt: Date.now(), updatedAt: Date.now(), note: '' };
      N.db.leads.unshift(l);
      chat.leadId = l.id;
    }
    return l;
  };
  // перенос данных из карточки диалога в заявку
  N.syncLead = chat => {
    const l = N.ensureLead(chat);
    l.items = chat.card.items.map(i => ({ pid: i.pid, qty: i.qty, ok: i.ok, price: (l.items.find(x => x.pid === i.pid) || N.product(i.pid) || {}).price || 0 }));
    l.services = chat.card.services.map(sid => ({ sid, price: (N.service(sid) || {}).price || null }));
    l.managerId = chat.managerId || l.managerId;
    l.updatedAt = Date.now();
    return l;
  };
  // вперед по воронке ИИ двигает сам, назад и в «Сделку»/«Отказ» только человек
  N.raiseStage = (lead, stage) => { if (stageIdx(stage) > stageIdx(lead.stage) && !['won', 'lost'].includes(lead.stage)) N.setStage(lead, stage); };
  N.setStage = (lead, stage) => {
    if (lead.stage === stage) return;
    if (stage === 'won' && !lead.shipped) { lead.items.forEach(i => { const p = N.product(i.pid); if (p) p.stock = Math.max(0, p.stock - i.qty); }); lead.shipped = true; }
    if (lead.stage === 'won' && stage !== 'won' && lead.shipped) { lead.items.forEach(i => { const p = N.product(i.pid); if (p) p.stock += i.qty; }); lead.shipped = false; }
    lead.stage = stage; lead.updatedAt = Date.now();
    const chat = N.chat(lead.chatId);
    if (chat && stage === 'won') { chat.status = 'closed'; N.sysMsg(chat, 'won'); }
  };

  /* ---------- диалоги ---------- */
  N.STATUSES = {
    ai: { name: 'Ведет ИИ', tone: 'blue' },
    wait: { name: 'Ждет менеджера', tone: 'amber' },
    manager: { name: 'У менеджера', tone: 'green' },
    closed: { name: 'Закрыт', tone: 'gray' },
  };
  N.newChat = (channel, client, lang) => {
    const c = { id: N.uid('c'), channel, client: Object.assign({ name: '', handle: '', phone: '', company: '', inn: '', city: '' }, client), lang: lang || 'ru', status: 'ai', managerId: null, unread: 0, leadId: null, messages: [], card: { items: [], services: [] }, ctx: {}, createdAt: Date.now(), lastAt: Date.now() };
    N.db.chats.unshift(c);
    N.ensureLead(c);
    N.notify('lead', c);
    return c;
  };
  N.addMsg = (chat, from, text, extra) => {
    const m = Object.assign({ id: N.uid('m'), from, text, at: Date.now() }, extra);
    chat.messages.push(m);
    chat.lastAt = m.at;
    if (from === 'client') chat.unread = (chat.unread || 0) + 1;
    return m;
  };
  N.sysMsg = (chat, sys, vars) => N.addMsg(chat, 'system', '', { sys, vars: vars || {} });

  // сообщение клиента из мессенджера (или из тестового режима)
  N.clientSays = (chat, text) => {
    N.addMsg(chat, 'client', text);
    if (chat.status === 'closed') { chat.status = 'ai'; N.sysMsg(chat, 'reopened'); }
    N.changed('msg');
    const ch = N.channel(chat.channel);
    if (chat.status === 'manager' || (ch && !ch.auto && chat.channel !== 'test')) return;
    N.ai.respond(chat);
  };
  N.managerSays = (chat, text) => {
    const me = N.me();
    if (chat.status !== 'manager' || chat.managerId !== me.id) N.take(chat, me.id, true);
    N.addMsg(chat, 'manager', text, { uid: me.id });
    chat.unread = 0;
    N.changed('msg');
  };
  N.take = (chat, uid, silent) => {
    chat.status = 'manager'; chat.managerId = uid; chat.unread = 0;
    N.sysMsg(chat, 'taken', { uid });
    const l = chat.leadId && N.lead(chat.leadId); if (l) l.managerId = uid;
    N.db.notes.filter(n => n.chatId === chat.id).forEach(n => { n.read = true; });
    if (!silent) N.changed('status');
  };
  N.release = chat => { chat.status = 'ai'; N.sysMsg(chat, 'released'); N.changed('status'); };
  N.closeChat = chat => { chat.status = 'closed'; N.sysMsg(chat, 'closed'); N.changed('status'); };
  // кому отдать клиента: закрепленный менеджер, менеджер у экрана (в демо), иначе у кого меньше открытых диалогов
  N.pickManager = chat => {
    if (chat.managerId) return N.user(chat.managerId);
    const me = N.me && N.me();
    if (me && me.role === 'manager') return me;
    const load = u => N.db.chats.filter(c => c.managerId === u.id && c.status !== 'closed').length;
    return N.managers().sort((a, b) => load(a) - load(b))[0];
  };
  N.escalate = (chat, reason) => {
    const m = N.pickManager(chat);
    chat.status = 'wait'; chat.managerId = m.id; chat.waitSince = Date.now(); chat.waitReason = reason;
    N.sysMsg(chat, 'escalated', { reason, uid: m.id });
    const l = N.syncLead(chat);
    if (reason === 'contract') N.raiseStage(l, 'contract');
    N.notify(reason, chat);
  };

  /* ---------- уведомления ---------- */
  N.NOTE_KINDS = {
    contract: { title: 'Клиент готов к договору', icon: 'file-sign', tone: 'amber' },
    human: { title: 'Клиент просит менеджера', icon: 'user', tone: 'blue' },
    question: { title: 'ИИ не нашел ответа', icon: 'help', tone: 'violet' },
    kp: { title: 'Нужно коммерческое предложение', icon: 'file', tone: 'blue' },
    lead: { title: 'Новая заявка', icon: 'inbox', tone: 'gray' },
  };
  N.notify = (kind, chat) => {
    const n = { id: N.uid('n'), kind, chatId: chat.id, at: Date.now(), read: false };
    N.db.notes.unshift(n);
    N.db.notes = N.db.notes.slice(0, 60);
    N.emit('notify', n);
    return n;
  };
  N.unreadNotes = () => N.db.notes.filter(n => !n.read);

  N.chName = id => ({ tg: 'Telegram', wa: 'WhatsApp', ig: 'Instagram', test: N.t('Тест') }[id] || id);
})();

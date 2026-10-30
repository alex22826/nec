/* =========================================================================
   NEC — мост с сайтом компании (alex22826/nec-site).
   Сайт и кабинет на одном домене и пишут в общий localStorage:
   nec.site.in  — чаты окна ИИ-консультанта и заявки с формы (пишет сайт);
   nec.site.out — статус диалога и ответы менеджера (пишет кабинет).
   ========================================================================= */
(function () {
  const N = window.N;
  const IN = 'nec.site.in', OUT = 'nec.site.out';

  const blankClient = () => ({ name: '', handle: '', phone: '', company: '', inn: '', city: '' });

  // забрать новые сообщения с сайта в «Диалоги»
  N.siteSync = () => {
    const inbox = N.store.get(IN) || {};
    let any = false;
    Object.values(inbox).forEach(s => {
      if (!s || !s.id || !Array.isArray(s.messages) || !s.messages.length) return;
      let c = N.chat(s.id), changed = false, fresh = false;
      if (!c) {
        c = { id: s.id, channel: 'site', lang: s.lang || 'ru', status: 'ai', managerId: null, unread: 0, client: blankClient(), card: { items: [], services: [] }, ctx: {}, messages: [], createdAt: s.messages[0].at, lastAt: s.messages[0].at };
        N.db.chats.unshift(c);
        N.ensureLead(c);
        N.notify('lead', c);
        changed = true;
      }
      const have = new Set(c.messages.map(m => m.id));
      s.messages.forEach(m => {
        if (have.has(m.id) || !['client', 'ai'].includes(m.from)) return;
        c.messages.push({ id: m.id, from: m.from, text: m.text, at: m.at });
        if (m.from === 'client') { c.unread = (c.unread || 0) + 1; fresh = true; }
        changed = true;
      });
      // сигнал «ждет менеджера» может прийти отдельной записью, уже после сообщений
      const needEsc = s.status === 'wait' && s.waitAt && s.waitAt !== c.siteWaitAt && c.status === 'ai';
      if (!changed && !needEsc) return;
      any = true;
      c.messages.sort((a, b) => a.at - b.at);
      c.lastAt = c.messages[c.messages.length - 1].at;
      if (fresh && c.status === 'closed') { c.status = 'ai'; N.sysMsg(c, 'reopened'); }
      ['name', 'phone', 'company', 'inn', 'city'].forEach(k => { if (s.client && s.client[k]) c.client[k] = s.client[k]; });
      c.lang = s.lang || c.lang;
      // пока диалог ведет ИИ на сайте, карточку заполняет он
      if (c.status !== 'manager' && s.card) c.card = JSON.parse(JSON.stringify(s.card));
      const lead = N.syncLead(c);
      if (c.card.items.length || c.card.services.length) N.raiseStage(lead, 'qualify');
      if (needEsc) {
        c.siteWaitAt = s.waitAt;
        N.escalate(c, s.waitReason || 'human');
      }
    });
    if (any) N.changed('site');
  };

  // отдать сайту статус диалога и ответы менеджера
  let last = '';
  const writeOut = () => {
    if (!N.db) return;
    const ch = N.channel('site');
    const out = { __auto: !ch || (ch.on && ch.auto) };
    N.db.chats.filter(c => c.channel === 'site').forEach(c => {
      const m = c.managerId && N.user(c.managerId);
      out[c.id] = {
        status: c.status, manager: m ? m.name : null,
        messages: c.messages.filter(x => x.from === 'manager').map(x => ({ id: x.id, from: 'manager', text: x.text, at: x.at })),
      };
    });
    const s = JSON.stringify(out);
    if (s !== last) { last = s; try { localStorage.setItem(OUT, s); } catch (e) { /* хранилище недоступно */ } }
  };
  N.on('change', writeOut);
  window.addEventListener('storage', e => { if (e.key === IN) N.siteSync(); });
  window.addEventListener('focus', () => { if (N.db) N.siteSync(); });
})();

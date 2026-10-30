/* =========================================================================
   NEC — ИИ-менеджер. Два режима:
   1) демо: встроенный разбор сообщений (язык, товары, количество, телефон,
      город, намерения) и ответы по каталогу на RU/UZ/EN без интернета;
   2) Claude API: ответ модели по тому же каталогу, ключ задает админ.
   В обоих режимах решение «звать менеджера к договору» принимает N.rules.
   ========================================================================= */
(function () {
  const N = window.N = window.N || {};
  const ai = N.ai = {};
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- разбор текста ---------- */
  const norm = s => String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[ʻʼ‘’`]/g, "'");
  const reEsc = s => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  const kwRe = {};
  // слово ищем с начала слова: «генератор» не должен находиться внутри «ветрогенератор»;
  // короткие слова и «10 кв» проверяем и по концу: «кп» не должно найтись в «кпд», «10 кв» в «10 квт»
  const WHOLE = new Set(['ham', 'тол', 'кру', 'вру']);
  const kwPos = (t, kw) => {
    const whole = kw.length <= 2 || WHOLE.has(kw) || /(кв|kv)$/.test(kw);
    const re = kwRe[kw] || (kwRe[kw] = new RegExp('(^|[^\\p{L}\\p{N}])' + reEsc(kw) + (whole ? '(?![\\p{L}])' : ''), 'u'));
    const m = re.exec(t);
    return m ? m.index + m[1].length : -1;
  };
  const hasAny = (t, list) => list.some(k => kwPos(t, k) >= 0);

  const UZ_WORDS = ['salom', 'assalom', 'alaykum', 'narx', 'qancha', 'bormi', 'kerak', 'rahmat', 'dona', 'nechta', 'qachon', 'yetkaz', 'shartnoma', 'menejer', 'shamol', 'uchun', 'olib', 'buyurtma', 'taklif', 'yaxshi', "xo'p", "bo'ladi", 'kvt', 'sotib', 'qayer', 'ombor', 'montaj', 'tuzamiz', 'kerakmi', 'yana', 'ham', 'bilan', 'ismim', 'raqam', 'ассалом', 'нарх', 'канча', 'керак', 'рахмат'];
  ai.detectLang = (text, prev) => {
    const t = norm(text);
    if (/[ўқғҳ]/.test(t)) return 'uz';
    const cyr = (t.match(/[а-я]/g) || []).length, lat = (t.match(/[a-z]/g) || []).length;
    if (cyr + lat < 3) return prev || 'ru';
    if (hasAny(t, UZ_WORDS) || /[a-z](o'|g')/.test(t) || /(^|\s)(o'|g')/.test(t)) return 'uz';
    return cyr > lat ? 'ru' : 'en';
  };

  const CITIES = [
    { ru: 'Чирчик', uz: 'Chirchiq', en: 'Chirchiq', d: 1, kw: ['чирчик', 'chirchiq', 'chirchik'] },
    { ru: 'Коканд', uz: "Qo'qon", en: 'Kokand', d: 2, kw: ['коканд', "qo'qon", 'kokand'] },
    { ru: 'Ташкент', uz: 'Toshkent', en: 'Tashkent', d: 1, kw: ['ташкент', 'toshkent', 'tashkent'] },
    { ru: 'Самарканд', uz: 'Samarqand', en: 'Samarkand', d: 2, kw: ['самарканд', 'samarqand', 'samarkand'] },
    { ru: 'Бухара', uz: 'Buxoro', en: 'Bukhara', d: 2, kw: ['бухар', 'buxoro', 'bukhara', 'buhara'] },
    { ru: 'Наманган', uz: 'Namangan', en: 'Namangan', d: 2, kw: ['наманган', 'namangan'] },
    { ru: 'Андижан', uz: 'Andijon', en: 'Andijan', d: 2, kw: ['андижан', 'andijon', 'andijan'] },
    { ru: 'Фергана', uz: "Farg'ona", en: 'Fergana', d: 2, kw: ['ферган', "farg'ona", 'fargona', 'fergana'] },
    { ru: 'Навои', uz: 'Navoiy', en: 'Navoi', d: 2, kw: ['навои', 'navoiy', 'navoi'] },
    { ru: 'Карши', uz: 'Qarshi', en: 'Karshi', d: 2, kw: ['карши', 'qarshi', 'karshi'] },
    { ru: 'Джизак', uz: 'Jizzax', en: 'Jizzakh', d: 2, kw: ['джизак', 'jizzax', 'jizzakh'] },
    { ru: 'Гулистан', uz: 'Guliston', en: 'Gulistan', d: 2, kw: ['гулистан', 'guliston', 'gulistan'] },
    { ru: 'Термез', uz: 'Termiz', en: 'Termez', d: 3, kw: ['термез', 'termiz', 'termez'] },
    { ru: 'Нукус', uz: 'Nukus', en: 'Nukus', d: 3, kw: ['нукус', 'nukus'] },
    { ru: 'Ургенч', uz: 'Urganch', en: 'Urgench', d: 3, kw: ['ургенч', 'urganch', 'urgench'] },
  ];
  const cityOf = name => CITIES.find(c => [c.ru, c.uz, c.en].includes(name));

  const fmtPhone = d => `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`;
  const INTENT = {
    thanks: ['спасибо', 'благодар', 'рахмат', 'rahmat', 'thank'],
    human: ['менеджер', 'оператор', 'живой человек', 'позвоните', 'перезвоните', 'свяжитесь со мной', 'operator', 'menejer', 'odam bilan', "qo'ng'iroq qiling", 'call me', 'real person', 'human', 'manager'],
    contract: ['договор', 'контракт', 'счет', 'счета', 'оформля', 'оформим', 'реквизит', 'предоплат', 'оплатим', 'оплачиваем', 'выставьте', 'заключ', 'готовы заказать', 'готовы купить', 'готовы подписать', 'заказываем', 'shartnoma', 'kontrakt', 'hisob-faktura', 'hisob faktura', 'rekvizit', "to'laymiz", 'sotib olamiz', 'buyurtma beramiz', 'rasmiylashtir', 'contract', 'invoice', 'purchase order', 'proforma', 'ready to buy', 'ready to order', 'ready to sign', 'ready to pay', "we'll take", 'we will take', 'place an order', 'place the order'],
    kp: ['кп', 'коммерческ', 'tijoriy taklif', 'taklif', 'proposal', 'quotation', 'quote'],
    price: ['цена', 'цену', 'цены', 'ценам', 'цене', 'стоим', 'сколько стоит', 'почем', 'прайс', 'бюджет', 'narx', 'qancha', 'price', 'cost', 'how much'],
    stock: ['налич', 'на складе', 'склад', 'есть ли', 'есть в', 'bormi', 'omborda', 'mavjud', 'in stock', 'availab', 'do you have', 'have you got'],
    delivery: ['достав', 'привез', 'отгруз', 'самовывоз', 'yetkaz', 'olib ket', 'olib kel', "jo'nat", 'delivery', 'deliver', 'shipping', 'pick up', 'pickup'],
    catalog: ['каталог', 'ассортимент', 'что у вас есть', 'что продаете', 'katalog', 'nima bor', 'nimalar bor', 'catalog', 'what do you sell', 'what do you have', 'what do you offer'],
  };
  const GREET_RE = /^[\s!.,]*(здравств|привет|добр\p{L}* (день|утро|вечер)|салам|салом|ассалом|assalom|salom|hello|hi(?![\p{L}])|hey(?![\p{L}])|good (morning|afternoon|evening))/u;
  const YES_RE = /^[\s]*(да|ага|конечно|давайте|ок|окей|ha|xa|albatta|mayli|xo'p|yes|sure|ok|okay|yep|of course|please do)(?![\p{L}])/u;
  const ACK_RE = /^[\s]*(хорошо|понятно|понял|ясно|yaxshi|tushunarli|good|great|fine|got it)(?![\p{L}])[\s!.,]*$/u;
  const POWER_RE = /(\d+(?:[.,]\d+)?)\s*(квт|kwt|kw|kvt)(?![\p{L}])/gu;
  const QTY_RE = /(\d{1,5})\s*(штук\p{L}*|шт|ед\p{L}*|компл\p{L}*|станци\p{L}*|установк\p{L}*|dona|tadan|ta|komplekt\p{L}*|pcs|pieces|units?|sets?|pc|turbines?)(?![\p{L}])/gu;
  const QTY_NEED_RE = /(need|нужн\p{L}*|надо|kerak|берем|возьмем|думаю|хотим|want|order)\s+(?:примерно\s+|около\s+|about\s+|around\s+)?(\d{1,5})(?!\d|[.,]\d|\s*(квт|kw|kvt|кв|kv|ква|kva|а|a|м|m|метр\p{L}*|metr\p{L}*|%)(?![\p{L}]))/u;
  const QTY_M_RE = /(\d{1,5})\s*(м|метр\p{L}*|m|metr\p{L}*)(?![\p{L}])/u;
  const WORDNUM = { 'один': 1, 'одну': 1, 'одна': 1, 'две': 2, 'два': 2, 'три': 3, 'четыре': 4, 'пять': 5, 'bitta': 1, 'ikkita': 2, 'uchta': 3, "to'rtta": 4, 'beshta': 5, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };
  const WORD_RE = new RegExp('(^|[^\\p{L}])(' + Object.keys(WORDNUM).join('|') + ')(?![\\p{L}])', 'u');

  // что сказал клиент: факты для карточки и намерения
  ai.extract = (text, chat) => {
    const raw = String(text || '');
    let t = norm(raw);
    const ex = { intents: {}, powers: [], qtys: [], sel: [], ambiguous: false, cats: [], services: [] };
    for (const k in INTENT) ex.intents[k] = hasAny(t, INTENT[k]);
    ex.intents.greet = GREET_RE.test(t);
    ex.intents.yes = YES_RE.test(t);
    ex.intents.ack = ACK_RE.test(t);

    // ИНН/STIR вырезаем до поиска телефона, чтобы 9 цифр не приняли за номер
    const inn = raw.match(/(?:инн|stir|inn|tin)[\s:№#-]*((?:\d\s?){9})/i);
    if (inn) { ex.inn = inn[1].replace(/\s/g, ''); t = t.replace(norm(inn[0]), ' '); }
    const ph = t.match(/\+?998[\s\-()]*(\d{2})[\s\-()]*(\d{3})[\s\-]*(\d{2})[\s\-]*(\d{2})(?!\d)/) || t.match(/(?:^|[^\d+])(\d{2})[\s-]?(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})(?!\d)/);
    if (ph) { ex.phone = fmtPhone(ph.slice(1, 5).join('')); t = t.replace(ph[0], ' '); }
    const co = raw.match(/[«"]([^»"]{2,40})[»"](\s*(MCHJ|LLC|LTD|ООО|XK|AJ))?/i)
      || raw.match(/(?:ООО|ОАО|ЧП|MCHJ|LLC|XK)\s+([A-Za-zА-Яа-я0-9' -]{2,40})/)
      || raw.match(/(?:компания|kompaniya|company)[:\s]+([A-Za-zА-Яа-я0-9' -]{2,40})/i)
      || raw.match(/(?:мы из|biz|we are from)\s+([A-Z][A-Za-z0-9'-]+(?: [A-Z][A-Za-z0-9'-]+){1,4})/);
    if (co) ex.company = (co[0].startsWith('«') || co[0].startsWith('"') ? co[0] : co[1]).trim().replace(/[.,]$/, '');
    const nm = raw.match(/(?:меня зовут|mening ismim|ismim|my name is|this is)\s+([A-ZА-ЯЎҚҒҲ][a-zа-яўқғҳ'’]+)/);
    if (nm) ex.name = nm[1];
    const city = CITIES.find(c => hasAny(t, c.kw));
    if (city) ex.city = city;

    // мощность и количество (вместе с позицией в тексте, чтобы понять, к какому товару относится)
    for (const m of t.matchAll(POWER_RE)) ex.powers.push(parseFloat(m[1].replace(',', '.')));
    for (const m of t.matchAll(QTY_RE)) ex.qtys.push({ n: +m[1], pos: m.index });
    if (!ex.qtys.length) { const m = QTY_NEED_RE.exec(t); if (m) ex.qtys.push({ n: +m[2], pos: m.index + m[0].length }); }
    if (!ex.qtys.length && !/\d/.test(t) && t.length < 70) {
      const m = WORD_RE.exec(t); if (m) ex.qtys.push({ n: WORDNUM[m[2]], pos: m.index + m[1].length });
    }

    // товары: точное слово дает 4, категория 1, совпадение мощности 2, тема разговора 1
    ex.cats = N.CATS.filter(c => hasAny(t, c.kw)).map(c => c.id);
    const ctx = chat.ctx || {};
    const res = [];
    for (const p of N.db.products) {
      let s = 0, pos = -1, kw = false;
      for (const k of p.kw) { const i = kwPos(t, k); if (i >= 0) { kw = true; pos = pos < 0 ? i : Math.min(pos, i); } }
      if (kw) s += 4;
      if (ex.cats.includes(p.cat)) s += 1;
      if (p.power && ex.powers.includes(p.power)) { s += 2; if (pos < 0) pos = t.indexOf(String(p.power)); }
      if (s > 0 && ctx.cat === p.cat) s += 1;
      if (s > 0) res.push({ p, s, pos, kw });
    }
    let sel = res.filter(r => r.kw);
    if (sel.length && ex.powers.length) { const f = sel.filter(r => !r.p.power || ex.powers.includes(r.p.power)); if (f.length) sel = f; }
    if (!sel.length) { const max = Math.max(0, ...res.map(r => r.s)); if (max >= 3) sel = res.filter(r => r.s === max); }
    // несколько вариантов одного типа (мини-ГЭС 100 и 500 кВт) без мощности: сначала уточнить
    const powered = sel.filter(r => r.p.power);
    ex.ambiguous = powered.length > 1 && new Set(powered.map(r => r.p.cat)).size === 1 && !ex.powers.length;
    ex.sel = sel;
    if (QTY_M_RE.test(t) && sel.some(r => r.p.unit === 'm')) { const m = QTY_M_RE.exec(t); ex.qtys = [{ n: +m[1], pos: m.index }]; }

    ex.services = N.db.services.filter(s => hasAny(t, s.kw)).map(s => s.id);
    ex.kb = N.db.kb.filter(k => k.kw && hasAny(t, k.kw));
    ex.understood = !!(sel.length || ex.cats.length || ex.services.length || ex.kb.length || ex.phone || ex.city || ex.company || ex.inn || ex.name || ex.qtys.length || Object.values(ex.intents).some(Boolean));
    return ex;
  };

  // перенос фактов в карточку клиента
  ai.applyExtract = (chat, ex) => {
    const c = chat.client, card = chat.card, ctx = chat.ctx = chat.ctx || {};
    if (ex.phone) c.phone = ex.phone;
    if (ex.inn) c.inn = ex.inn;
    if (ex.company && !c.company) c.company = ex.company;
    if (ex.name && (!c.name || c.name.startsWith('@'))) c.name = ex.name;
    if (ex.city) c.city = ex.city[chat.lang] || ex.city.ru;
    const touched = [];
    if (!ex.ambiguous) {
      // количество относим к ближайшему товару слева, иначе к последнему обсуждаемому
      const qtyFor = {};
      ex.qtys.forEach(q => {
        let target = null;
        if (ex.sel.length) {
          const before = ex.sel.filter(r => r.pos >= 0 && r.pos <= q.pos).sort((a, b) => b.pos - a.pos);
          target = (before[0] || ex.sel[0]).p.id;
        } else if (ctx.focus && ctx.focus.length) target = ctx.focus[0];
        else if (card.items.length) target = card.items[card.items.length - 1].pid;
        if (target) qtyFor[target] = q.n;
      });
      const ids = ex.sel.map(r => r.p.id);
      Object.keys(qtyFor).forEach(id => { if (!ids.includes(id)) ids.push(id); });
      ids.forEach(id => {
        let it = card.items.find(i => i.pid === id);
        if (!it) { it = { pid: id, qty: 1, ok: false }; card.items.push(it); }
        if (qtyFor[id]) { it.qty = qtyFor[id]; it.ok = true; }
        touched.push(id);
      });
      if (ex.sel.length) ctx.focus = ex.sel.map(r => r.p.id);
    }
    ex.services.forEach(sid => { if (!card.services.includes(sid)) card.services.push(sid); });
    const cat = (ex.sel[0] && ex.sel[0].p.cat) || ex.cats[0];
    if (cat) ctx.cat = cat;
    return touched;
  };

  /* ---------- фразы ---------- */
  const DAYS = { ru: { 1: '1 день', 2: '2-3 дня', 3: '3-4 дня' }, uz: { 1: '1 kun', 2: '2-3 kun', 3: '3-4 kun' }, en: { 1: '1 day', 2: '2-3 days', 3: '3-4 days' } };
  const PH = {
    ru: {
      hi: n => `Здравствуйте${n ? ', ' + n : ''}!`,
      me: 'Я ИИ-менеджер компании NEC.',
      intro: 'Помогу подобрать гидро- и ветроэлектростанции, высоковольтные и низковольтные щиты, запчасти, а также услуги по проектированию, строительству и монтажу. Что вас интересует?',
      ok: (n, u) => `на складе ${n} ${u}`, low: (n, u) => `на складе осталось ${n} ${u}`, out: d => `под заказ, изготовим за ${d} дней`,
      per: u => ` за ${u}`,
      options: 'Подходят варианты:',
      askHydro: 'Для точного подбора нужны напор воды в метрах и расход, либо примерная мощность, которая нужна объекту.',
      askPower: 'Какая мощность вам нужна?',
      askWhich: 'Подскажите, какое оборудование или услуга вас интересует?',
      askQty: 'Сколько нужно?',
      askQtyOf: n => `Уточните количество: ${n}.`,
      total: (q, u, s) => `За ${q} ${u}: ${s}.`,
      partial: (a, r, d) => `Сейчас на складе ${a}, остальные ${r} изготовим за ${d} дней.`,
      cart: s => `Итого по оборудованию: ${s}.`,
      svc: (n, p, u) => `${n}: от ${p} ${u}.`, svcEst: n => `${n}: по смете.`,
      delivery: (c, d) => c ? `Доставляем по всему Узбекистану. ${c}: срок ${d}, стоимость от $150.` : 'Доставляем по всему Узбекистану за 1-4 дня, стоимость от $150. Возможен самовывоз со склада в Ташкенте.',
      kpOffer: 'Подготовить коммерческое предложение?',
      kpYes: 'Хорошо, готовлю коммерческое предложение, менеджер отправит его сегодня.',
      askPhone: 'Оставьте, пожалуйста, имя и номер телефона, чтобы менеджер мог с вами связаться.',
      askPhoneShort: 'Оставьте, пожалуйста, номер телефона для связи.',
      contract: (m, ph) => `Отлично! Передаю заявку менеджеру. ${m} свяжется с вами${ph ? ' по номеру ' + ph : ''} в течение 15 минут и подготовит договор.`,
      human: m => `Конечно, подключаю менеджера. ${m} ответит здесь или перезвонит в ближайшее время.`,
      unknown: 'Уточню этот вопрос у инженера и вернусь с ответом. Менеджер уже видит ваш запрос.',
      waiting: m => `Ваш запрос уже у менеджера, ${m} скоро свяжется с вами.`,
      thanks: 'Пожалуйста! Если появятся вопросы, пишите в любое время.',
      fine: 'Хорошо.',
      catalog: l => `В каталоге NEC: ${l}. Что подобрать?`,
    },
    uz: {
      hi: n => `Assalomu alaykum${n ? ', ' + n : ''}!`,
      me: "Men NEC kompaniyasining sun'iy intellekt menejeriman.",
      intro: "Gidro va shamol elektr stansiyalari, yuqori va past kuchlanishli shitlar, ehtiyot qismlar hamda loyihalash, qurilish va montaj xizmatlarini tanlashda yordam beraman. Sizni nima qiziqtiradi?",
      ok: (n, u) => `omborda ${n} ${u} bor`, low: (n, u) => `omborda ${n} ${u} qoldi`, out: d => `buyurtma asosida, ${d} kunda tayyorlaymiz`,
      per: u => ` (${u} uchun)`,
      options: 'Mos variantlar:',
      askHydro: "Aniq tanlash uchun suv bosimi (metrda) va sarfi yoki obyektga kerakli taxminiy quvvat kerak.",
      askPower: 'Sizga qancha quvvat kerak?',
      askWhich: 'Qaysi uskuna yoki xizmat sizni qiziqtiradi?',
      askQty: 'Nechta kerak?',
      askQtyOf: n => `${n}: nechta kerak?`,
      total: (q, u, s) => `${q} ${u} uchun jami: ${s}.`,
      partial: (a, r, d) => `Hozir omborda ${a} ta, qolgan ${r} tasini ${d} kunda tayyorlaymiz.`,
      cart: s => `Uskunalar bo'yicha jami: ${s}.`,
      svc: (n, p, u) => `${n}: ${p} dan, ${u}.`, svcEst: n => `${n}: smeta asosida.`,
      delivery: (c, d) => c ? `Butun O'zbekiston bo'ylab yetkazib beramiz. ${c}: ${d}, narxi $150 dan.` : "Butun O'zbekiston bo'ylab 1-4 kunda yetkazib beramiz, narxi $150 dan. Toshkentdagi ombordan olib ketish ham mumkin.",
      kpOffer: 'Tijoriy taklif tayyorlaymi?',
      kpYes: 'Yaxshi, tijoriy taklif tayyorlayapman, menejer uni bugun yuboradi.',
      askPhone: "Menejer siz bilan bog'lanishi uchun ismingiz va telefon raqamingizni qoldiring.",
      askPhoneShort: "Aloqa uchun telefon raqamingizni qoldiring.",
      contract: (m, ph) => `Ajoyib! So'rovingizni menejerga topshirdim. ${m} siz bilan 15 daqiqa ichida${ph ? ' ' + ph + ' raqami orqali' : ''} bog'lanadi va shartnomani tayyorlaydi.`,
      human: m => `Albatta, menejerni ulayapman. ${m} shu yerda javob beradi yoki tez orada qo'ng'iroq qiladi.`,
      unknown: "Bu savolni muhandisdan aniqlab, javob beraman. Menejer so'rovingizni ko'rib turibdi.",
      waiting: m => `So'rovingiz menejerda, ${m} tez orada siz bilan bog'lanadi.`,
      thanks: 'Arzimaydi! Savollar bo\'lsa, istalgan vaqtda yozing.',
      fine: 'Yaxshi.',
      catalog: l => `NEC katalogida: ${l}. Nimani tanlab beray?`,
    },
    en: {
      hi: n => `Hello${n ? ' ' + n : ''}!`,
      me: 'I am the AI manager of NEC.',
      intro: 'I can help you choose hydro and wind power plants, high and low voltage switchgear, spare parts, as well as design, construction and installation services. What are you interested in?',
      ok: (n, u) => `${n} ${u} in stock`, low: (n, u) => `only ${n} ${u} left in stock`, out: d => `made to order in ${d} days`,
      per: u => ` per ${u}`,
      options: 'Suitable options:',
      askHydro: 'To size the plant I need the water head in meters and the flow, or the approximate capacity the site needs.',
      askPower: 'What capacity do you need?',
      askWhich: 'Which equipment or service are you interested in?',
      askQty: 'How many units do you need?',
      askQtyOf: n => `How many do you need: ${n}?`,
      total: (q, u, s) => `Total for ${q} ${u}: ${s}.`,
      partial: (a, r, d) => `${a} in stock now, the remaining ${r} will be made in ${d} days.`,
      cart: s => `Total for equipment: ${s}.`,
      svc: (n, p, u) => `${n}: from ${p} ${u}.`, svcEst: n => `${n}: per estimate.`,
      delivery: (c, d) => c ? `We deliver across Uzbekistan. ${c}: ${d}, from $150.` : 'We deliver across Uzbekistan in 1-4 days, from $150. Pickup from our Tashkent warehouse is also possible.',
      kpOffer: 'Shall I prepare a commercial proposal?',
      kpYes: 'Sure, I am preparing a commercial proposal, our manager will send it today.',
      askPhone: 'Please leave your name and phone number so our manager can contact you.',
      askPhoneShort: 'Please leave a phone number for contact.',
      contract: (m, ph) => `Great! I have passed your request to our manager. ${m} will contact you${ph ? ' at ' + ph : ''} within 15 minutes and prepare the contract.`,
      human: m => `Of course, I am connecting a manager. ${m} will reply here or call you shortly.`,
      unknown: 'Let me check this with our engineer and get back to you. A manager can already see your request.',
      waiting: m => `Your request is with our manager, ${m} will contact you shortly.`,
      thanks: 'You are welcome! Feel free to write any time.',
      fine: 'Fine.',
      catalog: l => `The NEC catalog includes: ${l}. What shall I pick for you?`,
    },
  };

  const priceStr = (p, L, lang) => N.money(p.price) + (p.unit === 'm' ? L.per(N.UNITS.m[lang]) : '');
  const productLine = (p, L, lang) => {
    const a = N.available(p.id), u = N.UNITS[p.unit][lang];
    const st = a <= 0 ? L.out(p.lead) : a <= p.min ? L.low(N.fmtNum(a), u) : L.ok(N.fmtNum(a), u);
    return `${p.name[lang]}: ${priceStr(p, L, lang)}, ${st}.`;
  };

  // сигналы для правила «пора к договору»
  ai.signals = (chat, ex, extra = {}) => {
    const card = chat.card;
    const lead = chat.leadId && N.lead(chat.leadId);
    return Object.assign({
      contractWords: !!ex.intents.contract,
      kpAsked: !!ex.intents.kp,
      humanAsked: !!ex.intents.human,
      hasItems: card.items.length > 0 || card.services.length > 0,
      hasQty: card.items.some(i => i.ok),
      hasPhone: !!chat.client.phone,
      hasCompany: !!(chat.client.company || chat.client.inn),
      sum: lead ? N.leadSum(lead) : N.sum(card.items, i => i.qty * ((N.product(i.pid) || {}).price || 0)),
      clientMsgs: chat.messages.filter(m => m.from === 'client').length,
    }, extra);
  };

  /* ---------- демо-режим ---------- */
  ai.demoReply = (chat, text) => {
    const lang = chat.lang = ai.detectLang(text, chat.lang);
    const L = PH[lang], ctx = chat.ctx = chat.ctx || {};
    const ex = ai.extract(text, chat);
    ai.applyExtract(chat, ex);
    const cfg = N.db.settings.ai.escalate;
    const firstName = (chat.client.name || '').replace(/^@.*/, '').split(' ')[0];
    const mgr = N.pickManager(chat), mName = mgr ? mgr.name[lang] : '';
    const waiting = chat.status === 'wait';
    const parts = [];
    const firstAi = !chat.messages.some(m => m.from === 'ai');
    if (ex.intents.greet || firstAi) parts.push(L.hi(firstName) + (firstAi ? ' ' + L.me : ''));

    // просьба позвать человека важнее всего остального
    if (ex.intents.human && cfg.human && !waiting) {
      parts.push(L.human(mName));
      return { text: parts.join(' '), escalate: 'human', ex };
    }

    // товары: новые из сообщения или те, о которых уже говорили, если спросили цену/наличие
    let shown = ex.sel.map(r => r.p);
    if (ex.ambiguous) {
      parts.push(L.options + '\n' + shown.map(p => '• ' + productLine(p, L, lang)).join('\n'));
    } else {
      if (!shown.length && (ex.intents.price || ex.intents.stock) && ctx.focus) shown = ctx.focus.map(N.product).filter(Boolean);
      // итог считаем по тем товарам, где количество названо в этом сообщении
      const totalFor = p => {
        const i = chat.card.items.find(x => x.pid === p.id && x.ok);
        if (!i || !ex.qtys.length) return;
        const u = N.UNITS[p.unit][lang], a = N.available(p.id);
        if (i.qty > 1) parts.push(L.total(N.fmtNum(i.qty), u, N.money(i.qty * p.price)));
        if (i.qty > a && p.unit !== 'm') parts.push(L.partial(a, i.qty - a, p.lead));
      };
      shown.forEach(p => { parts.push(productLine(p, L, lang)); totalFor(p); });
      if (!shown.length && ex.qtys.length) (ctx.focus || []).map(N.product).filter(Boolean).forEach(totalFor);
      const priced = chat.card.items.filter(i => i.ok);
      if (priced.length > 1 && (ex.qtys.length || ex.intents.price)) parts.push(L.cart(N.money(N.sum(priced, i => i.qty * N.product(i.pid).price))));
    }
    ex.services.forEach(sid => {
      const s = N.service(sid);
      parts.push(s.price ? L.svc(s.name[lang], N.money(s.price), s.unit[lang]) : L.svcEst(s.name[lang]));
    });
    ex.kb.forEach(k => parts.push(k.text[lang] || k.text.ru || k.text));
    if (ex.intents.delivery) { const c = cityOf(chat.client.city); parts.push(L.delivery(c ? c[lang] : '', c ? DAYS[lang][c.d] : '')); }
    if (ex.intents.catalog && !shown.length) parts.push(L.catalog(N.CATS.map(c => c.name[lang].toLowerCase()).join(', ')));

    const s = ai.signals(chat, ex);
    const contract = !waiting && N.rules.isContractStage(s);
    let escalate = null, kp = false;
    if (contract) {
      parts.push(L.contract(mName, chat.client.phone));
      if (!chat.client.phone) parts.push(L.askPhoneShort);
      escalate = 'contract'; ctx.lastAsk = null;
    } else if (waiting) {
      parts.push(L.waiting(mName));
    } else if (ex.intents.kp || (ex.intents.yes && ctx.lastAsk === 'kp')) {
      parts.push(L.kpYes); kp = true;
      if (!chat.client.phone) { parts.push(L.askPhoneShort); ctx.lastAsk = 'phone'; } else ctx.lastAsk = null;
    } else {
      const meaningful = parts.length > (ex.intents.greet || firstAi ? 1 : 0);
      if (!meaningful && ex.intents.thanks) { parts.push(L.thanks); ctx.lastAsk = null; return { text: parts.join(' '), ex }; }
      const answerable = ex.sel.length || ex.services.length || ex.kb.length || ['price', 'stock', 'delivery', 'catalog'].some(k => ex.intents[k]);
      const offTopic = !ex.understood || (/\?/.test(text) && !answerable && !ex.qtys.length && !ex.phone);
      if (!meaningful && offTopic && text.trim().length > 6 && !firstAi) {
        parts.push(L.unknown);
        return { text: parts.join(' '), escalate: cfg.question ? 'question' : null, ex };
      }
      if (!meaningful && (ex.intents.ack || ex.intents.yes)) parts.push(L.fine);
      // один следующий вопрос, чтобы довести клиента до заявки
      const card = chat.card, pending = card.items.find(i => !i.ok);
      let q, ask;
      if (ex.ambiguous) { q = ctx.cat === 'hydro' ? L.askHydro : L.askPower; ask = 'power'; }
      else if (!card.items.length && !card.services.length) { q = firstAi && !ex.cats.length ? L.intro : (ex.cats.length ? (ex.cats[0] === 'hydro' ? L.askHydro : L.askPower) : L.askWhich); ask = 'what'; }
      else if (pending) { q = card.items.length > 1 ? L.askQtyOf(N.product(pending.pid).name[lang]) : L.askQty; ask = 'qty'; }
      else if (!chat.client.phone) { q = L.askPhone; ask = 'phone'; }
      else { q = L.kpOffer; ask = 'kp'; }
      parts.push(q); ctx.lastAsk = ask;
    }
    return { text: parts.join(' ').replace(/ \n/g, '\n').replace(/:\n/g, ':\n'), escalate, kp, ex };
  };

  /* ---------- Claude API ---------- */
  const SCHEMA = {
    type: 'object', additionalProperties: false,
    required: ['reply', 'lang', 'name', 'phone', 'company', 'city', 'items', 'services', 'contract_ready', 'needs_human', 'wants_proposal'],
    properties: {
      reply: { type: 'string', description: 'Ответ клиенту на его языке' },
      lang: { type: 'string', enum: ['ru', 'uz', 'en'] },
      name: { type: 'string' }, phone: { type: 'string' }, company: { type: 'string' }, city: { type: 'string' },
      items: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['sku', 'qty', 'qty_confirmed'], properties: { sku: { type: 'string' }, qty: { type: 'integer' }, qty_confirmed: { type: 'boolean' } } } },
      services: { type: 'array', items: { type: 'string' } },
      contract_ready: { type: 'boolean' },
      needs_human: { type: 'boolean' },
      wants_proposal: { type: 'boolean' },
    },
  };
  const TONES = { business: 'деловой и вежливый', friendly: 'дружелюбный и простой' };
  ai.systemPrompt = chat => {
    const st = N.db.settings.ai, m = N.pickManager(chat);
    const cat = N.db.products.map(p => `${p.sku} | ${p.name.ru} / ${p.name.uz} / ${p.name.en} | $${p.price}${p.unit === 'm' ? ' за метр' : ''} | доступно: ${N.available(p.id)} ${N.UNITS[p.unit].ru} | изготовление ${p.lead} дн. | ${p.spec.ru}`).join('\n');
    const svc = N.db.services.map(s => `${s.id} | ${s.name.ru} / ${s.name.en} | ${s.price ? 'от $' + s.price + ' ' + s.unit.ru : 'по смете'} | срок ${s.term.ru}`).join('\n');
    const kb = N.db.kb.map(k => `## ${N.tx(k.title)}\n${typeof k.text === 'string' ? k.text : k.text.ru}`).join('\n\n');
    const c = chat.client;
    return `Ты ${st.name}, ИИ-менеджер по продажам компании National Energy Company (NEC), Узбекистан. NEC строит и производит энергооборудование: гидро- и ветроэлектростанции, высоковольтные и низковольтные щиты, запчасти к ним, и оказывает услуги проектирования, строительства и монтажа. Ты переписываешься с клиентом в ${N.chName(chat.channel)}.

Как отвечать:
- На языке клиента: русский, узбекский латиницей или английский. 2-5 коротких предложений, тон ${TONES[st.tone] || TONES.business}.
- Цены, наличие и сроки бери только из каталога ниже. Не придумывай товары, скидки и условия. Скидки, рассрочку и нестандартные условия согласовывает менеджер.
- Задавай один уточняющий вопрос за раз: что нужно, мощность, количество, город, имя и телефон.
- Не используй длинное тире, букву ё и многоточие. Цены пиши как $96 000.
- contract_ready: true, если клиент готов заключить договор, просит счет или реквизиты, готов оплатить. Тогда напиши, что менеджер ${m ? m.name.ru : ''} свяжется в течение 15 минут и подготовит договор.
- needs_human: true, если клиент просит живого человека или вопрос нельзя решить по каталогу и базе знаний.
- wants_proposal: true, если клиент просит коммерческое предложение.
- items: все товары, которые клиент хочет, sku из каталога, qty_confirmed только если клиент сам назвал количество. services: id услуг. Неизвестные поля оставляй пустой строкой.
${st.prompt ? '\nУказания руководителя:\n' + st.prompt + '\n' : ''}
Известно о клиенте: имя «${c.name}», телефон «${c.phone}», компания «${c.company}», город «${c.city}».

Каталог (sku | название | цена | доступно на складе | срок изготовления | характеристики):
${cat}

Услуги (id | название | цена | срок):
${svc}

База знаний:
${kb}`;
  };
  ai.claudeReply = async (chat) => {
    const st = N.db.settings.ai;
    const msgs = [];
    chat.messages.forEach(m => {
      if (m.from === 'system' || !m.text) return;
      const role = m.from === 'client' ? 'user' : 'assistant';
      const text = m.from === 'manager' ? '[Сообщение менеджера] ' + m.text : m.text;
      const last = msgs[msgs.length - 1];
      if (last && last.role === role) last.content += '\n\n' + text; else msgs.push({ role, content: text });
    });
    while (msgs.length && msgs[0].role !== 'user') msgs.shift();
    const body = {
      model: st.model || 'claude-opus-5-5', max_tokens: 4096,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      system: ai.systemPrompt(chat), messages: msgs,
    };
    const headers = {
      'content-type': 'application/json', 'x-api-key': st.apiKey, 'anthropic-version': '2026-10-21',
      'anthropic-dangerous-direct-browser-access': 'true',
    };
    // при отказе модели запрос сам перейдет на запасную модель (у Haiku этого нет)
    if (!/haiku/.test(body.model)) { body.fallbacks = 'default'; headers['anthropic-beta'] = 'server-side-fallback-2026-07-01'; }
    const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data.error && data.error.message) || 'HTTP ' + res.status);
    if (data.stop_reason === 'refusal' || data.stop_reason === 'max_tokens') throw new Error(data.stop_reason);
    const block = (data.content || []).filter(b => b.type === 'text').pop();
    const out = JSON.parse(block.text);

    // факты от модели переносим в карточку
    const c = chat.client;
    chat.lang = out.lang || chat.lang;
    if (out.name && !c.name) c.name = out.name;
    if (out.phone) c.phone = out.phone;
    if (out.company) c.company = out.company;
    if (out.city) c.city = out.city;
    const bySku = N.by(N.db.products, 'sku');
    const items = out.items.map(i => bySku[i.sku] && { pid: bySku[i.sku].id, qty: Math.max(1, i.qty || 1), ok: !!i.qty_confirmed }).filter(Boolean);
    if (items.length) chat.card.items = items;
    out.services.forEach(sid => { if (N.service(sid) && !chat.card.services.includes(sid)) chat.card.services.push(sid); });

    const ex = { intents: { contract: out.contract_ready, kp: out.wants_proposal, human: out.needs_human } };
    const waiting = chat.status === 'wait';
    const s = ai.signals(chat, ex);
    let escalate = null;
    if (!waiting && N.rules.isContractStage(s)) escalate = 'contract';
    else if (!waiting && out.needs_human && st.escalate.human) escalate = 'human';
    return { text: out.reply, escalate, kp: out.wants_proposal && !escalate, ex };
  };

  /* ---------- ответ клиенту ---------- */
  ai.respond = async (chat) => {
    const last = [...chat.messages].reverse().find(m => m.from === 'client');
    if (!last || chat.typing === 'ai') return;
    chat.typing = 'ai';
    N.emit('change', 'typing');
    const st = N.db.settings.ai, t0 = Date.now();
    let out;
    try {
      out = st.mode === 'claude' && st.apiKey ? await ai.claudeReply(chat) : ai.demoReply(chat, last.text);
    } catch (e) {
      console.warn('Claude API', e);
      N.emit('ai-error', e.message);
      out = ai.demoReply(chat, last.text);
    }
    N.emit('change', 'extract'); // карточка заполняется, пока ИИ «печатает»
    const pause = 700 + Math.min(1600, out.text.length * 10) - (Date.now() - t0);
    if (pause > 0) await sleep(pause);
    chat.typing = null;
    if (!chat.test && !N.chat(chat.id)) return; // данные сбросили, пока ИИ думал
    N.addMsg(chat, 'ai', out.text);
    if (chat.test) { // тестовый чат: без заявки и уведомлений, только показать, что было бы
      if (out.escalate) { chat.status = 'wait'; chat.waitReason = out.escalate; N.sysMsg(chat, 'escalated', { reason: out.escalate, uid: (N.pickManager(chat) || {}).id }); }
      N.emit('change', 'test');
      return;
    }
    chat.aiReplies = (chat.aiReplies || 0) + 1;
    const lead = N.syncLead(chat);
    if (chat.card.items.length || chat.card.services.length) N.raiseStage(lead, 'qualify');
    if (out.kp) { N.raiseStage(lead, 'offer'); if (st.escalate.kp) N.notify('kp', chat); }
    if (out.escalate) N.escalate(chat, out.escalate);
    N.changed('ai');
  };
})();

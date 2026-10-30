/* Языки интерфейса: RU (ключ словаря), UZ латиницей, EN.
   N.t('Русская строка', {vars}) для интерфейса, N.tx({ru,uz,en}) для данных. */
(function () {
  const N = window.N = window.N || {};
  N.LANGS = [{ id: 'ru', label: 'RU' }, { id: 'uz', label: 'UZ' }, { id: 'en', label: 'EN' }];
  N.lang = (N.store && N.store.get('nec.lang')) || 'ru';
  if (!N.LANGS.some(l => l.id === N.lang)) N.lang = 'ru';
  document.documentElement.lang = N.lang;
  N.setLang = l => { N.lang = l; N.store.set('nec.lang', l); document.documentElement.lang = l; };
  N.missing = new Set();
  N.t = (s, vars) => {
    let r = s;
    if (N.lang !== 'ru') {
      const e = N.DICT && N.DICT[s];
      if (e) r = e[N.lang === 'uz' ? 0 : 1]; else N.missing.add(s);
    }
    return vars ? r.replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m)) : r;
  };
  N.tx = o => o == null ? '' : typeof o === 'string' ? o : (o[N.lang] || o.ru || '');
  N.UNITS = {
    pcs: { ru: 'шт', uz: 'dona', en: 'pcs' },
    m: { ru: 'м', uz: 'm', en: 'm' },
    set: { ru: 'компл', uz: 'komplekt', en: 'sets' },
  };
})();

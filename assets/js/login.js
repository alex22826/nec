/* Страница входа: логин и пароль, ниже быстрый вход за админа и менеджера. */
(function () {
  const N = window.N;
  N.initDB();
  if (N.me()) { location.replace('app.html'); return; }
  let showPass = false;

  const render = () => {
    const admin = N.db.users.find(u => u.role === 'admin'), mgr = N.db.users.find(u => u.login === 'manager');
    document.title = N.t('Вход') + ' | NEC';
    document.body.innerHTML = `
    <div class="login">
      <aside class="login-side">
        <div class="brand"><span class="logo">${N.icon('zap', 20)}</span><div class="brand-txt"><b>NEC</b><small>National Energy Company</small></div></div>
        <div class="login-hero">
          <h1>${N.t('Заявки, переписка и склад в одном кабинете')}</h1>
          <p>${N.t('Стройка и производство энергооборудования: гидро- и ветроэлектростанции, высоковольтные и низковольтные щиты, запчасти.')}</p>
          <div class="feats">
            <div class="feat"><span class="feat-ic">${N.icon('chat', 18)}</span><div><b>${N.t('Telegram, WhatsApp, Instagram')}<span class="feat-chs">${N.chIcon('tg', 16)}${N.chIcon('wa', 16)}${N.chIcon('ig', 16)}</span></b><small>${N.t('Все обращения клиентов приходят в одно окно')}</small></div></div>
            <div class="feat"><span class="feat-ic">${N.icon('sparkles', 18)}</span><div><b>${N.t('ИИ-менеджер на трех языках')}</b><small>${N.t('Отвечает по каталогу и остаткам, переносит данные в заявку')}</small></div></div>
            <div class="feat"><span class="feat-ic">${N.icon('file-sign', 18)}</span><div><b>${N.t('Сигнал менеджеру к договору')}</b><small>${N.t('Когда клиент готов, менеджер получает уведомление и связывается')}</small></div></div>
          </div>
        </div>
        <div class="login-foot">© ${new Date().getFullYear()} National Energy Company · ${N.t('демо-версия')}</div>
      </aside>
      <main class="login-main">
        <div class="login-top"><div class="seg lang-seg" id="langSeg">${N.LANGS.map(l => `<button data-lang="${l.id}" class="${l.id === N.lang ? 'on' : ''}">${l.label}</button>`).join('')}</div></div>
        <div class="login-card">
          <h2>${N.t('Вход в кабинет')}</h2>
          <p>${N.t('Введите логин и пароль, которые выдал администратор.')}</p>
          <form id="form" autocomplete="on">
            <label><span class="f-label">${N.t('Логин')}</span><input class="inp" name="login" autocomplete="username" autocapitalize="none" spellcheck="false" required></label>
            <label><span class="f-label">${N.t('Пароль')}</span><span class="inp-wrap"><input class="inp" name="pass" type="${showPass ? 'text' : 'password'}" autocomplete="current-password" required><button type="button" class="icon-btn sm" id="eye" aria-label="${N.t('Показать пароль')}">${N.icon(showPass ? 'eye-off' : 'eye', 17)}</button></span></label>
            <div class="login-err" id="err"></div>
            <button class="btn btn-primary" type="submit">${N.t('Войти')}</button>
          </form>
          <div class="sep">${N.t('Быстрый вход для демо')}</div>
          <div class="quick-login">
            <button class="ql" data-role="admin">${N.avatar(N.tx(admin.name), 38, admin.color)}<span><b>${N.t('Администратор')}</b><small>${N.esc(N.tx(admin.name))}</small></span></button>
            <button class="ql" data-role="manager">${N.avatar(N.tx(mgr.name), 38, mgr.color)}<span><b>${N.t('Менеджер')}</b><small>${N.esc(N.tx(mgr.name))}</small></span></button>
          </div>
          <p class="login-note">${N.t('Демо-данные хранятся только в этом браузере.')}</p>
        </div>
      </main>
    </div>`;

    N.qs('#langSeg').onclick = e => { const b = e.target.closest('[data-lang]'); if (b) { N.setLang(b.dataset.lang); render(); } };
    N.qs('#eye').onclick = () => { const i = N.qs('[name="pass"]'); showPass = !showPass; i.type = showPass ? 'text' : 'password'; N.qs('#eye').innerHTML = N.icon(showPass ? 'eye-off' : 'eye', 17); };
    N.qs('#form').onsubmit = async e => {
      e.preventDefault();
      const f = e.target, err = N.qs('#err');
      err.textContent = '';
      const ok = await N.login(f.login.value, f.pass.value).catch(() => false);
      if (ok) location.href = 'app.html';
      else { err.textContent = N.t('Неверный логин или пароль'); f.pass.select(); }
    };
    document.querySelectorAll('[data-role]').forEach(b => { b.onclick = () => { N.quickLogin(b.dataset.role); location.href = 'app.html'; }; });
  };
  render();
})();

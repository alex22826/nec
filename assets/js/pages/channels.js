/* Каналы: Telegram, WhatsApp, Instagram. В демо подключение условное,
   в боевой версии сервер принимает вебхуки мессенджеров и кладет сообщения в «Диалоги». */
(function () {
  const N = window.N;
  let root = null;

  const STEPS = {
    tg: ['Создайте бота у @BotFather и скопируйте токен.', 'Вставьте токен в поле ниже и нажмите «Сохранить».', 'Сервер NEC установит вебхук, и сообщения боту появятся в разделе «Диалоги».'],
    wa: ['Подключите номер к WhatsApp Business Platform в кабинете Meta.', 'Укажите ID номера телефона и постоянный токен доступа.', 'Пропишите адрес вебхука ниже и подтвердите его в Meta.'],
    ig: ['Переведите аккаунт Instagram в профессиональный и свяжите со страницей Facebook.', 'В Meta Business Suite разрешите приложению доступ к сообщениям.', 'Вставьте токен страницы и подтвердите вебхук.'],
  };
  const FIELDS = { tg: [['token', 'Токен бота']], wa: [['phoneId', 'ID номера телефона'], ['token', 'Токен доступа']], ig: [['pageId', 'ID страницы Facebook'], ['token', 'Токен страницы']] };
  const HOOK = { tg: 'telegram', wa: 'whatsapp', ig: 'instagram' };

  const stats = id => {
    const cs = N.db.chats.filter(c => c.channel === id);
    return { chats: cs.length, today: cs.reduce((s, c) => s + c.messages.filter(m => N.isToday(m.at) && m.from !== 'system').length, 0), leads: N.db.leads.filter(l => l.channel === id).length };
  };
  const html = () => `
    <p class="page-note">${N.icon('info', 15)} ${N.t('Демо: подключение условное, переписки тестовые. В рабочей версии сообщения из мессенджеров приходят на сервер компании и сразу появляются в разделе «Диалоги».')}</p>
    <div class="ch-grid">${N.db.channels.map(ch => { const s = stats(ch.id); return `
      <div class="panel ch-card">
        <div class="ch-card-h">${N.chIcon(ch.id, 44)}<div><b>${N.chName(ch.id)}</b><small>${N.esc(ch.account)}</small></div>${N.badge(ch.on ? N.t('Подключен') : N.t('Отключен'), ch.on ? 'green' : 'gray', true)}</div>
        <div class="ch-stats"><div><b>${s.chats}</b><small>${N.t('диалогов')}</small></div><div><b>${s.today}</b><small>${N.t('сообщений сегодня')}</small></div><div><b>${s.leads}</b><small>${N.t('заявок')}</small></div></div>
        <label class="toggle-row"><span><b>${N.t('Канал подключен')}</b><small>${N.t('с {d}', { d: N.fmtDate(ch.connectedAt) })}</small></span><input type="checkbox" class="tgl" data-on="${ch.id}" ${ch.on ? 'checked' : ''}></label>
        <label class="toggle-row"><span><b>${N.t('Автоответ ИИ')}</b><small>${N.t('ИИ отвечает клиентам сам')}</small></span><input type="checkbox" class="tgl" data-auto="${ch.id}" ${ch.auto ? 'checked' : ''}></label>
        <button class="btn btn-light" data-setup="${ch.id}">${N.icon('cog', 16)} ${N.t('Как подключить')}</button>
      </div>`; }).join('')}
    </div>
    <div class="panel">
      <div class="panel-h"><b>${N.t('Как сообщение попадает в систему')}</b></div>
      <div class="flow big">
        <div><span>1</span><b>${N.t('Клиент пишет')}</b><small>${N.t('в Telegram, WhatsApp или Instagram на своем языке')}</small></div>
        <div><span>2</span><b>${N.t('ИИ отвечает')}</b><small>${N.t('за секунды, по каталогу, ценам и остаткам')}</small></div>
        <div><span>3</span><b>${N.t('Данные в заявке')}</b><small>${N.t('товары, количество, телефон, компания, город')}</small></div>
        <div><span>4</span><b>${N.t('Сигнал менеджеру')}</b><small>${N.t('когда клиент готов к договору')}</small></div>
      </div>
    </div>`;

  const openSetup = id => {
    const ch = N.channel(id);
    ch.cfg = ch.cfg || {};
    N.modal({
      title: N.t('Подключение') + ': ' + N.chName(id),
      body: `<ol class="steps">${STEPS[id].map(s => `<li>${N.t(s)}</li>`).join('')}</ol>
        ${FIELDS[id].map(([k, label]) => `<label><span class="f-label">${N.t(label)}</span><input class="inp" name="${k}" value="${N.esc(ch.cfg[k] || '')}" autocomplete="off"></label>`).join('')}
        <label><span class="f-label">${N.t('Аккаунт')}</span><input class="inp" name="account" value="${N.esc(ch.account)}"></label>
        <label><span class="f-label">${N.t('Адрес вебхука на сервере')}</span><input class="inp" readonly value="https://${N.t('ваш-сервер')}/hooks/${HOOK[id]}"></label>
        <p class="hint">${N.icon('lock', 15)} ${N.t('В демо данные хранятся только в этом браузере и никуда не отправляются.')}</p>`,
      foot: `<button class="btn btn-ghost" data-close>${N.t('Отмена')}</button><button class="btn btn-primary" data-save>${N.t('Сохранить')}</button>`,
      onMount: m => {
        m.el.querySelector('[data-save]').onclick = () => {
          FIELDS[id].forEach(([k]) => { ch.cfg[k] = m.el.querySelector(`[name="${k}"]`).value.trim(); });
          ch.account = m.el.querySelector('[name="account"]').value.trim() || ch.account;
          N.changed('channel'); m.close();
          N.toast(N.t('Настройки канала сохранены'), { tone: 'green', icon: 'check' });
        };
      },
    });
  };

  N.page('channels', {
    render(el) {
      root = el;
      el.innerHTML = html();
      el.addEventListener('change', e => {
        const on = e.target.dataset.on, auto = e.target.dataset.auto;
        if (on) { const ch = N.channel(on); ch.on = e.target.checked; if (ch.on) ch.connectedAt = Date.now(); N.changed('channel'); }
        if (auto) { N.channel(auto).auto = e.target.checked; N.changed('channel'); N.toast(e.target.checked ? N.t('ИИ снова отвечает в {ch}', { ch: N.chName(auto) }) : N.t('В {ch} отвечают только менеджеры', { ch: N.chName(auto) }), { icon: 'bot' }); }
      });
      el.addEventListener('click', e => { const b = e.target.closest('[data-setup]'); if (b) openSetup(b.dataset.setup); });
    },
    update(what) { if (root && root.isConnected && !['typing', 'extract'].includes(what)) root.innerHTML = html(); },
    destroy() { root = null; },
  });
})();

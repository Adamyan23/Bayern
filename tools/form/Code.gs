/**
 * BAYERN — приём заявок с сайта.
 * Кладёт заявку строкой в Google Таблицу и присылает письмо на почту.
 * Что куда вставлять — в FORM.md (в корне проекта).
 */

// Куда присылать письмо о новой заявке. Несколько адресов — через запятую.
const NOTIFY_EMAIL = 'levon.adamyan23@gmail.com';

// Название листа в таблице (создастся сам).
const SHEET_NAME = 'Заявки';

const HEADERS = ['Дата', 'Тип', 'Имя', 'Компания', 'Телефон', 'Email', 'Бренд', 'Направление', 'Сообщение', 'Язык', 'Страница'];
const TYPES = { client: 'Клиент', partner: 'Подрядчик / партнёр' };
const DIRECTIONS = { subcontract: 'Субподряд на объектах', dealer: 'Дилерство / партнёрство', other: 'Другое' };

/** Сайт присылает заявку сюда. Вручную эту функцию запускать не нужно — для проверки есть testZayavka. */
function doPost(e) {
  try {
    if (!e || !e.postData) {
      console.log('Эту функцию вызывает сайт. Для проверки выберите в списке сверху функцию testZayavka и нажмите «Выполнить».');
      return json_({ ok: false, error: 'нет данных заявки' });
    }
    const d = JSON.parse(e.postData.contents);
    if (d.website) return json_({ ok: true }); // ловушка для спам-ботов
    if (!d.name || !d.phone) return json_({ ok: false, error: 'нет имени или телефона' });

    const when = new Date();
    const sheet = sheet_();
    sheet.appendRow([
      when,
      TYPES[d.type] || d.type || '',
      d.name || '', d.company || '', d.phone || '', d.email || '',
      d.brand || '', DIRECTIONS[d.direction] || d.direction || '',
      d.message || '', (d.lang || '').toUpperCase(), d.page || ''
    ]);

    sendMail_(d, when, sheet);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err) });
  }
}

/** Открыть ссылку скрипта в браузере — проверка, что он живой. */
function doGet() {
  return json_({ ok: true, hint: 'BAYERN form endpoint' });
}

function sendMail_(d, when, sheet) {
  const rows = [
    ['Тип', TYPES[d.type] || d.type],
    ['Имя', d.name],
    ['Компания', d.company],
    ['Телефон', d.phone],
    ['Email', d.email],
    ['Бренд', d.brand],
    ['Направление', DIRECTIONS[d.direction] || d.direction],
    ['Сообщение', d.message],
    ['Язык сайта', (d.lang || '').toUpperCase()],
    ['Время', Utilities.formatDate(when, Session.getScriptTimeZone(), 'dd.MM.yyyy HH:mm')]
  ].filter(function (r) { return r[1]; });

  const html =
    '<div style="font:15px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#26373F">' +
    '<h2 style="margin:0 0 4px">Новая заявка с сайта BAYERN</h2>' +
    '<table cellpadding="6" style="border-collapse:collapse;margin-top:12px">' +
    rows.map(function (r) {
      return '<tr><td style="border:1px solid #E2E0DD;color:#4E6B78">' + r[0] + '</td>' +
             '<td style="border:1px solid #E2E0DD"><b>' + escape_(String(r[1])) + '</b></td></tr>';
    }).join('') +
    '</table>' +
    '<p style="margin-top:16px"><a href="' + sheet.getParent().getUrl() + '">Открыть таблицу заявок</a></p>' +
    '</div>';

  const options = { to: NOTIFY_EMAIL, subject: 'BAYERN — заявка: ' + d.name + ' (' + d.phone + ')', htmlBody: html, name: 'Сайт BAYERN' };
  if (d.email) options.replyTo = d.email; // «Ответить» — сразу клиенту
  MailApp.sendEmail(options);
}

function sheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 140);
    sh.setColumnWidth(9, 320);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function escape_(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

/** Кнопка «Выполнить» в редакторе: проверка, что таблица и письмо работают. */
function testZayavka() {
  doPost({ postData: { contents: JSON.stringify({
    type: 'client', name: 'Тестовая заявка', company: 'BAYERN', phone: '+374 55 105500',
    email: NOTIFY_EMAIL, brand: 'Weber MT', message: 'Проверка формы', lang: 'ru', page: 'https://bayern.am/'
  }) } });
}

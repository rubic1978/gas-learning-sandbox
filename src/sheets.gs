/**
 * Google Sheets API – Core Fundamentals
 *
 * Этот файл демонстрирует типичные операции с Google Таблицами:
 *   1. Чтение диапазона (batch‑чтение)
 *   2. Запись диапазона (batch‑запись)
 *   3. Добавление/удаление листов
 *   4. Кеширование данных для снижения количества запросов
 *   5. Обработка ошибок и логирование
 *
 * Все функции написаны на Google Apps Script (ES5‑compatible) и могут быть
 * вызваны напрямую из редактора или через `clasp push`/`clasp run`.
 *
 * Для тестирования откройте любую Google Таблицу, привяжите к ней скрипт
 * (File → Project properties → Script ID → `clasp push`), затем выполните
 * нужные функции через меню Run.
 */

/**
 * Получить объект Spreadsheet по ID.
 *
 * @param {string} spreadsheetId ID таблицы (из URL)
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function getSpreadsheet(spreadsheetId) {
  try {
    return SpreadsheetApp.openById(spreadsheetId);
  } catch (e) {
    Logger.log('❌ Ошибка открытия таблицы: %s', e.message);
    throw e;
  }
}

/**
 * Пример 1. Чтение диапазона A1:C10 из листа «Data».
 *
 * @param {string} spreadsheetId ID таблицы
 * @returns {Array<Array<*>>} Двумерный массив значений
 */
function readDataRange(spreadsheetId) {
  const ss = getSpreadsheet(spreadsheetId);
  const sheet = ss.getSheetByName('Data');
  if (!sheet) {
    throw new Error('Лист «Data» не найден');
  }

  // batch‑чтение: один запрос к API
  const range = sheet.getRange('A1:C10');
  const values = range.getValues(); // [[row1col1, row1col2, ...], ...]
  Logger.log('✅ Прочитано %d строк', values.length);
  return values;
}

/**
 * Пример 2. Запись массива данных в диапазон начиная с A2.
 *
 * @param {string} spreadsheetId ID таблицы
 * @param {Array<Array<*>>} data Двумерный массив, который нужно записать
 */
function writeDataRange(spreadsheetId, data) {
  const ss = getSpreadsheet(spreadsheetId);
  const sheet = ss.getSheetByName('Data') || ss.insertSheet('Data');

  // Определяем размер диапазона по размеру массива
  const numRows = data.length;
  const numCols = data[0] ? data[0].length : 0;
  if (numRows === 0 || numCols === 0) {
    throw new Error('Переданные данные пусты');
  }

  // batch‑запись: один запрос к API
  const range = sheet.getRange(2, 1, numRows, numCols); // старт с A2
  range.setValues(data);
  Logger.log('✅ Записано %d строк, %d столбцов', numRows, numCols);
}

/**
 * Пример 3. Добавление нового листа с именем «Report».
 *
 * @param {string} spreadsheetId ID таблицы
 */
function addReportSheet(spreadsheetId) {
  const ss = getSpreadsheet(spreadsheetId);
  const existing = ss.getSheetByName('Report');
  if (existing) {
    Logger.log('⚠️ Лист «Report» уже существует, удаляем и создаём заново');
    ss.deleteSheet(existing);
  }
  ss.insertSheet('Report');
  Logger.log('✅ Лист «Report» создан');
}

/**
 * Пример 4. Кеширование часто используемых данных.
 *
 * Кеш хранится в сервисе CacheService (5 минут TTL по умолчанию).
 * Это экономит квоты, если одни и те же данные читаются многократно.
 *
 * @param {string} spreadsheetId ID таблицы
 * @returns {Array<Array<*>>} Данные из кеша или из листа
 */
function getCachedData(spreadsheetId) {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'sheetData_' + spreadsheetId;
  const cached = cache.get(cacheKey);
  if (cached) {
    Logger.log('✅ Данные получены из кеша');
    return JSON.parse(cached);
  }

  // Если кеш пуст — читаем из листа и сохраняем
  const data = readDataRange(spreadsheetId);
  cache.put(cacheKey, JSON.stringify(data), 300); // 5 минут
  Logger.log('✅ Данные получены из листа и закешированы');
  return data;
}

/**
 * Пример 5. Объединённый сценарий: читаем, модифицируем и записываем.
 *
 * Добавляем к каждому числовому полю 10 % надбавку.
 *
 * @param {string} spreadsheetId ID таблицы
 */
function processAndUpdate(spreadsheetId) {
  try {
    const raw = getCachedData(spreadsheetId);
    const processed = raw.map(row =>
      row.map(cell => (typeof cell === 'number' ? cell * 1.1 : cell))
    );
    writeDataRange(spreadsheetId, processed);
    Logger.log('✅ Обработка завершена, данные обновлены');
  } catch (e) {
    Logger.log('❌ Ошибка в processAndUpdate: %s', e.message);
    // При необходимости можно добавить уведомление в Slack/Email
    throw e;
  }
}

/**
 * Пример 6. Удаление всех листов, кроме «Data».
 *
 * Полезно для очистки тестовой среды.
 *
 * @param {string} spreadsheetId ID таблицы
 */
function cleanSheets(spreadsheetId) {
  const ss = getSpreadsheet(spreadsheetId);
  const sheets = ss.getSheets();
  sheets.forEach(sheet => {
    if (sheet.getName() !== 'Data') {
      ss.deleteSheet(sheet);
      Logger.log('🗑️ Удалён лист: %s', sheet.getName());
    }
  });
}

/**
 * Как использовать:
 *
 * 1. Откройте таблицу, скопируйте её ID из URL:
 *    https://docs.google.com/spreadsheets/d/<ID>/edit
 *
 * 2. Вызовите любую функцию из редактора:
 *    readDataRange('<ID>');
 *    writeDataRange('<ID>', [[1,2,3],[4,5,6]]);
 *    addReportSheet('<ID>');
 *    processAndUpdate('<ID>');
 *
 * 3. При работе с большими объёмами (10 000+ строк) рекомендуется:
 *    - использовать `getValues()`/`setValues()` (batch‑операции)
 *    - разбивать запись на порции по 500‑1000 строк, чтобы не превысить лимит времени выполнения
 *    - включать кеширование (`CacheService`) для часто читаемых справочных таблиц
 *
 * 4. Для отладки используйте `Logger.log()` и просматривайте логи через
 *    View → Logs или `clasp logs`.
 */

/**
 * Тестовая функция‑заглушка, вызываемая из меню Run → testSheetsApi.
 * Заполняет лист «Data» случайными числами и демонстрирует весь цикл.
 */
function testSheetsApi() {
  const spreadsheetId = 'YOUR_SPREADSHEET_ID_HERE'; // <-- замените на реальный ID
  // 1️⃣ Заполняем лист случайными данными (10 строк × 3 столбца)
  const sample = Array.from({ length: 10 }, () =>
    Array.from({ length: 3 }, () => Math.floor(Math.random() * 100))
  );
  writeDataRange(spreadsheetId, sample);

  // 2️⃣ Добавляем лист отчёта
  addReportSheet(spreadsheetId);

  // 3️⃣ Обрабатываем данные (10 % надбавка)
  processAndUpdate(spreadsheetId);
}
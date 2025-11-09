/**
 * Примеры триггеров Google Apps Script
 *
 * 1. onEdit(e) – простой триггер, вызывается при изменении ячейки в таблице.
 * 2. timeBasedTrigger() – установка временного триггера (каждый час).
 * 3. deleteAllTriggers() – вспомогательная функция для очистки триггеров.
 *
 * Важно:
 * - Простые триггеры (onEdit, onOpen) работают без авторизации, но имеют ограничения.
 * - Установленные (installable) триггеры требуют разрешений и могут выполнять более тяжёлые задачи.
 * - При работе с большими диапазонами используйте batch‑операции и кэширование.
 */

/**
 * Простой триггер onEdit.
 * Записывает в столбец B значение "Изменено" каждый раз,
 * когда пользователь меняет значение в столбце A.
 *
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e событие редактирования
 */
function onEdit(e) {
  const range = e.range;
  const sheet = range.getSheet();

  // Проверяем, что изменение произошло в столбце A (1)
  if (range.getColumn() === 1) {
    const targetCell = sheet.getRange(range.getRow(), 2);
    targetCell.setValue('Изменено');
  }
}

/**
 * Устанавливает часовой временной триггер, вызывающий функцию hourlyTask.
 * Вызывается один раз; повторный запуск перезапишет существующий триггер.
 */
function timeBasedTrigger() {
  // Удаляем старый триггер, если он существует
  deleteAllTriggers('hourlyTask');

  // Создаём новый триггер, который будет запускаться каждый час
  ScriptApp.newTrigger('hourlyTask')
    .timeBased()
    .everyHours(1)
    .create();
}

/**
 * Функция, вызываемая часовым триггером.
 * Пример: записывает текущую дату/время в лист "Log".
 */
function hourlyTask() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = ss.getSheetByName('Log') || ss.insertSheet('Log');
  const now = new Date();
  logSheet.appendRow([now, 'Hourly task executed']);
}

/**
 * Удаляет все установленные триггеры, вызывающие указанную функцию.
 *
 * @param {string} functionName имя функции‑триггера для удаления
 */
function deleteAllTriggers(functionName) {
  const all = ScriptApp.getProjectTriggers();
  all.forEach(t => {
    if (t.getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(t);
    }
  });
}

/**
 * Пример использования:
 * 1. Откройте Google Таблицу, привяжите скрипт к ней (clasp push).
 * 2. Вставьте в лист столбец A любые данные – столбец B автоматически получит "Изменено".
 * 3. Выполните timeBasedTrigger() один раз (Run → timeBasedTrigger) для создания часового триггера.
 * 4. Проверьте лист "Log" – каждая запись будет добавлена каждый час.
 *
 * Советы по отладке:
 * - Для onEdit используйте Logger.log(JSON.stringify(e)) чтобы увидеть структуру объекта.
 * - При работе с installable триггерами проверяйте разрешения в меню "Resources → Cloud Platform project".
 */
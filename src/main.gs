/**
 * Пример функции, вызываемой из Google Sheets.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Sandbox')
    .addItem('Say Hello', 'sayHello')
    .addItem('Hello World', 'helloWorld')
    .addToUi();
}

function sayHello() {
  SpreadsheetApp.getActiveSpreadsheet()
    .toast('Hello from GAS Learning Sandbox!');
}
function helloWorld() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.getRange('A1').setValue('Hello World');
  SpreadsheetApp.getActiveSpreadsheet().toast('Hello World written to A1');
}
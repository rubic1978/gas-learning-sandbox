## Hello World script for Google Sheets

Функция `helloWorld` записывает строку **Hello World** в ячейку `A1` текущего листа и выводит toast‑сообщение.

```javascript
function helloWorld() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.getRange('A1').setValue('Hello World');
  SpreadsheetApp.getActiveSpreadsheet().toast('Hello World written to A1');
}
```

**Как запустить:**  
1. Откройте Google Таблицу, к которой привязан скрипт.  
2. В меню «Extensions → Apps Script» найдите функцию `helloWorld` и нажмите ► Run, либо используйте пункт меню «Sandbox → Hello World», добавленный в `onOpen()`.  
3. После выполнения в ячейке `A1` появится текст *Hello World*, а в правом нижнем углу появится toast‑сообщение.
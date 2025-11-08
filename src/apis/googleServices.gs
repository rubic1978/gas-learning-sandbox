/**
 * Пример обращения к Google Drive API.
 */
function listRootFiles() {
  const files = DriveApp.getRootFolder().getFiles();
  while (files.hasNext()) {
    const file = files.next();
    logInfo('File: ' + file.getName());
  }
}
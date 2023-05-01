const DB_SPREADSHEET_ID = '16NO3MBLAmppRenVaGc1Rfz59DkzOBG2QZMYIIzrDvG8',
      TO_PRINT_FOLDER_ID = '1c3QHB47w5RPTFGd8wh5GPEpO-8YWp2Sn',
      TEMPLATES_FOLDER_ID = '1uKJib1rdJMRaMA3FzuHhTPgJTsM2ODM4';

function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate();
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


function getSheet(name) {
  return SpreadsheetApp.openById(DB_SPREADSHEET_ID).getSheetByName(name);
}

function getColumnNames(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

function getData(sheet) {
  return sheet.getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues()
}

function getColumnData(sheet, columnIndex) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const range_values = sheet.getRange(2, columnIndex, lastRow - 1, columnIndex).getValues();
    return range_values.map(x => x.length && x[0].toString());
  }
  return [];
}

function formatDate(date) {
  if (!date) return '';
  return typeof date === 'string' ? date.split('-').reverse().join('/') : `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}
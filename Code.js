function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate();
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function saveCustomer(formData) {
  const sheet = getSheet('customer');
  const formValues = getColumnNames(sheet).map(name => formData[name] ? formData[name] : '');
  const systemNumbersIndex = getColumnData(sheet, 1).findIndex(x => x === formData['system_number']);
  const row = systemNumbersIndex === -1 ? (sheet.getLastRow() + 1) : (systemNumbersIndex + 2);
  sheet.getRange(row, 1, 1, sheet.getLastColumn()).setValues([formValues]);
  systemNumbersIndex === -1 && createCustomerFolder(formData);  
}

function searchCustomer(formData) {
  const sheet = getSheet('customer');
  const columnNames = getColumnNames(sheet);
  let data = getData(sheet);

  let searchTerm, columnIndex, value;
  for (const field in formData) {
    searchTerm = formData[field].trim().toLowerCase();
    if (!searchTerm) continue;

    columnIndex = columnNames.indexOf(field);
    data = data.filter(row => {
      value = row[columnIndex];
      return value?.toLowerCase()?.includes(searchTerm);
    })
  }

  return data.map(value => (value.reduce((acc, val, index) => {
        acc[columnNames[index]] = val;
        return acc;
      }, {})
    )
  )
}

function deleteCustomer(customer) {
  const sheet = getSheet('customer');
  const row = getData(sheet).findIndex(cust => cust[0] === customer.system_number) + 2;
  if (row > 1) {
    sheet.deleteRow(row);
    let customerFolder;
    const folders = DriveApp.getFolderById('1c3QHB47w5RPTFGd8wh5GPEpO-8YWp2Sn')
                            .getFoldersByName(`${customer.first_name} ${customer.last_name} (${customer.system_number})`);
    while (folders.hasNext())
      customerFolder = folders.next();
    customerFolder?.setTrashed(true);
    return true;
  }
  return false;
}

function getDocuments() {
  const data = {};

  // folders inside 'Document Templates' folder
  const folders = DriveApp.getFolderById('1uKJib1rdJMRaMA3FzuHhTPgJTsM2ODM4').getFolders();
  while (folders.hasNext()) {
    const folder = folders.next();
    const fileData = [];
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      fileData.push({
        id: file.getId(),
        name: file.getName()
      })
    }
    data[folder.getName()] = fileData;
  }

  return data;
}

function createDocuments(customer) {  
  let customerFolder;
  const folders = DriveApp.getFolderById('1c3QHB47w5RPTFGd8wh5GPEpO-8YWp2Sn')
                          .getFoldersByName(`${customer.first_name} ${customer.last_name} (${customer.system_number})`);
  while (folders.hasNext())
    customerFolder = folders.next();
  if (!customerFolder)
    customerFolder = createCustomerFolder(customer);

  const requestedFiles = customer.documentIds.map(id => DriveApp.getFileById(id));
  requestedFiles.forEach(requestedFile => {
    const copy = requestedFile.makeCopy();
    copy.moveTo(customerFolder);
    copy.setName(requestedFile.getName());
    
    const docCopy = DocumentApp.openById(copy.getId());
    const body = docCopy.getBody();
    customer['date_of_birth'] = customer['date_of_birth'] ? formatDate(customer['date_of_birth']) : null;
    customer['ni_date'] = customer['ni_date'] ? formatDate(customer['ni_date']) : null;
    customer['ΗΜΕΡΟΜΗΝΙΑ'] = new Date().toLocaleDateString('el-gr');
    for (const prop in customer) {
      body.replaceText(`{${prop}}`, customer[prop]);
    }
    docCopy.saveAndClose();
  })
}

function createCustomerFolder(customer) {
  const folder = DriveApp.createFolder(`${customer.first_name} ${customer.last_name} (${customer.system_number})`);
  folder.moveTo(DriveApp.getFolderById('1c3QHB47w5RPTFGd8wh5GPEpO-8YWp2Sn'));
  return folder;
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

function getSheet(name) {
  return SpreadsheetApp.openById('16NO3MBLAmppRenVaGc1Rfz59DkzOBG2QZMYIIzrDvG8').getSheetByName(name);
}

function formatDate(dateString) {
  return dateString.split('-').reverse().join('/');
}
function getDocuments() {
  const data = {};
  const folders = DriveApp.getFolderById(TEMPLATES_FOLDER_ID).getFolders();
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

function createDocuments(customer, documentIds) {  
  let customerFolder;
  const folders = DriveApp.getFolderById(TO_PRINT_FOLDER_ID)
                          .getFoldersByName(`${customer.first_name} ${customer.last_name} (${customer.system_number})`);
  while (folders.hasNext())
    customerFolder = folders.next();
  if (!customerFolder)
    customerFolder = createCustomerFolder(customer);

  const requestedFiles = documentIds.map(id => DriveApp.getFileById(id));
  requestedFiles.forEach(requestedFile => {
    const copy = requestedFile.makeCopy();
    copy.moveTo(customerFolder);
    copy.setName(requestedFile.getName());
    
    const docCopy = DocumentApp.openById(copy.getId());
    const body = docCopy.getBody();
    customer['date_of_birth'] = formatDate(customer['date_of_birth']);
    customer['ni_date'] = formatDate(customer['ni_date']);
    customer['ΗΜΕΡΟΜΗΝΙΑ'] = formatDate(new Date());
    for (const prop in customer) { body.replaceText(`{${prop}}`, customer[prop]); }
    docCopy.saveAndClose();
  })
}

function createCustomerFolder(customer) {
  const folder = DriveApp.createFolder(`${customer.first_name} ${customer.last_name} (${customer.system_number})`);
  folder.moveTo(DriveApp.getFolderById(TO_PRINT_FOLDER_ID));
  return folder;
}
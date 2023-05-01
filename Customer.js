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
    const folders = DriveApp.getFolderById(TO_PRINT_FOLDER_ID)
                            .getFoldersByName(`${customer.first_name} ${customer.last_name} (${customer.system_number})`);
    while (folders.hasNext())
      customerFolder = folders.next();
    customerFolder?.setTrashed(true);
    return true;
  }
  return false;
}

function loadCustomerForm() {
  const sheet = getSheet('customer-form');
  const data = getData(sheet);
  const columnNames = getColumnNames(sheet);
  return data.reduce((acc, cur) => {
            if (cur[0]) acc.push({
              [columnNames[0]]: cur[0],
              [columnNames[1]]: cur[1],
              [columnNames[2]]: cur[2],
              [columnNames[3]]: cur[3],
              [columnNames[4]]: cur[4],
              [columnNames[5]]: cur[5],
              [columnNames[6]]: cur[6],
            })
            return acc
          }, [])
}
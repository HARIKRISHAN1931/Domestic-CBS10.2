const ExcelJS = require('exceljs');

async function main() {
  const file = 'src/modules/Administration/TenantAndBranchManagement/CountryMaster/data/country-master.data.xlsx';
  const wb = new ExcelJS.Workbook();

  // Create sheet — all form fields
  const wsCreate = wb.addWorksheet('Create');
  wsCreate.addRow(['countryCode','countryName','countryAbbrevation','numCountyCd','countryType','isdCode','zone','region','pinLength']);
  wsCreate.addRow(['IND','India','IN','356','1','+91','1','2','6']);

  // Update sheet — searchKey + tab + fields to update
  const wsUpdate = wb.addWorksheet('Update');
  wsUpdate.addRow(['searchKey','tab','countryName']);
  wsUpdate.addRow(['IND','authorized','India Updated']);

  // Auth sheet — searchKey + tab where pending record sits
  const wsAuth = wb.addWorksheet('Auth');
  wsAuth.addRow(['searchKey','tab']);
  wsAuth.addRow(['IND','pending']);

  await wb.xlsx.writeFile(file);
  console.log('Written');

  const wb2 = new ExcelJS.Workbook();
  await wb2.xlsx.readFile(file);
  console.log('Sheets:', wb2.worksheets.map(function(w) { return w.name; }));
  wb2.worksheets.forEach(function(ws) {
    console.log('\nSheet:', ws.name);
    ws.eachRow(function(r, i) { console.log(i, JSON.stringify(r.values)); });
  });
}

main().then(function() {}).catch(function(e) { console.error(e); });

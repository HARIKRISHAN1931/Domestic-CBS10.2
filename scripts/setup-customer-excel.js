const ExcelJS = require('exceljs');
const path = require('path');

const FILE = path.join(__dirname, '../src/modules/Masters/CustomerManagement/CustomerCreationretail/data/customer-creation.data.xlsx');

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(FILE);

  const src = wb.getWorksheet('Customer');
  const headers = [];
  const dataRow = [];

  src.getRow(1).eachCell({ includeEmpty: true }, (cell, colNum) => {
    headers[colNum - 1] = String(cell.value ?? '');
  });
  src.getRow(2).eachCell({ includeEmpty: true }, (cell, colNum) => {
    dataRow[colNum - 1] = String(cell.value ?? '');
  });

  console.log('Headers:', headers.length, '| First 8:', headers.slice(0, 8).join(', '));
  console.log('Data row:', dataRow.slice(0, 8).join(', '));

  if (!wb.getWorksheet('Create')) {
    const ws = wb.addWorksheet('Create');
    ws.addRow(headers);
    ws.addRow(dataRow);
    console.log('Added Create sheet');
  }

  if (!wb.getWorksheet('Auth')) {
    const ws = wb.addWorksheet('Auth');
    ws.addRow(['searchKey', 'tab']);
    ws.addRow(['', 'pending']);
    console.log('Added Auth sheet');
  }

  if (!wb.getWorksheet('Update')) {
    const ws = wb.addWorksheet('Update');
    ws.addRow([...headers, 'searchKey', 'tab']);
    ws.addRow([...dataRow, '', 'authorized']);
    console.log('Added Update sheet');
  }

  await wb.xlsx.writeFile(FILE);
  console.log('File written successfully');

  // Verify
  const wb2 = new ExcelJS.Workbook();
  await wb2.xlsx.readFile(FILE);
  console.log('Verified sheets:', wb2.worksheets.map(w => w.name).join(', '));
}

main().catch(err => { console.error('FAILED:', err.message); process.exit(1); });

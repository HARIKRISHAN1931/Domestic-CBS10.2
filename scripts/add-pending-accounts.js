const ExcelJS = require('exceljs');
const path    = require('path');

(async () => {
  const fp = path.resolve(__dirname, '../src/modules/Masters/AccountsManagement/CustomerAccountCreation/data/CustomerAccountCreation.xlsx');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(fp);
  const ws = wb.getWorksheet('Authorize');

  const existing = [];
  ws.eachRow((r, i) => { if (i > 1) existing.push(String(r.getCell(2).value)); });

  const toAdd = [
    '139015201755553',
    '139015201755554',
    '139015201755555',
    '139015201755556',
  ];

  const today = new Date().toLocaleString('en-IN');
  for (const acc of toAdd) {
    if (!existing.includes(acc)) {
      ws.addRow(['@regression', acc, '11', '15201', '01', 'Pending', today]);
      console.log('Added:', acc);
    } else {
      console.log('Already exists:', acc);
    }
  }

  await wb.xlsx.writeFile(fp);
  console.log('Done. Total rows:', ws.rowCount - 1);
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });

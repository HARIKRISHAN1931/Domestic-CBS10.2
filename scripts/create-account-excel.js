const ExcelJS = require('exceljs');
const path    = require('path');
const fs      = require('fs');

(async () => {
  const fp = path.resolve(__dirname, '../src/modules/Masters/AccountsManagement/CustomerAccountCreation/data/CustomerAccountCreation.xlsx');
  const dir = path.dirname(fp);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const wb = new ExcelJS.Workbook();
  const hs = {
    font: { bold: true, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } },
  };

  const sheets = {
    Create: {
      cols: ['testTag','customerNumber','moduleCode','productCode','schemeCode','modeOfOperation','nomineeYN','stmtFreq','stmtMode'],
      rows: [['@sanity @regression','1395042','11','15201','01','9','N','4','2']],
    },
    Update: {
      cols: ['testTag','customerNumber','modeOfOperation','nomineeYN','stmtFreq','stmtMode'],
      rows: [],
    },
    Authorize: {
      cols: ['testTag','accountNo','moduleCode','productCode','schemeCode','authStatus','createdAt'],
      rows: [],
    },
    Negative: {
      cols: ['testTag','scenario','customerNumber','moduleCode','productCode','schemeCode','expectedError'],
      rows: [
        ['@regression','Empty customerNumber','','11','15201','01','Save confirm modal'],
        ['@regression','Empty moduleCode','1395042','','','','Save confirm modal'],
        ['@regression','Empty form','','','','','Save confirm modal'],
      ],
    },
    Database: {
      cols: ['testTag','accountNo','customerId','expectedStatus','expectedModuleCode'],
      rows: [],
    },
    AuthorizedList: {
      cols: ['testTag','accountNo','moduleCode','productCode','schemeCode','authStatus','authorizedAt'],
      rows: [],
    },
  };

  for (const [name, def] of Object.entries(sheets)) {
    const ws = wb.addWorksheet(name);
    ws.columns = def.cols.map(h => ({ key: h, width: h === 'testTag' ? 24 : 20 }));
    const hr = ws.addRow(def.cols);
    hr.eachCell(c => { c.font = hs.font; c.fill = hs.fill; });
    def.rows.forEach(r => ws.addRow(r));
  }

  await wb.xlsx.writeFile(fp);
  console.log('Created:', fp);
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });

const ExcelJS = require('exceljs');
const path = require('path');

async function run() {
  const wb = new ExcelJS.Workbook();

  const sheets = {
    Create:    [['tenantId','institutionName','tenantGroupId','address1','pinCode'],['TEST001','Test Co-operative Bank Ltd','GRP001','123 Main Street','400001']],
    Update:    [['tenantId','institutionName','address2'],['TEST001','Test Co-operative Bank Updated','456 New Street']],
    Authorize: [['tenantId'],['TEST001']],
    Negative:  [['tenantId'],['TEST001']],
    Database:  [['tenantId'],['TEST001']],
  };

  for (const [name, rows] of Object.entries(sheets)) {
    const ws = wb.addWorksheet(name);
    rows.forEach(r => ws.addRow(r));
  }

  const outPath = path.join(__dirname, '../src/modules/Administration/TenantAndBranchManagement/TenantMaster/data/tenant-master.data.xlsx');
  await wb.xlsx.writeFile(outPath);
  console.log('Created: ' + outPath);
}

run().catch(e => { console.error(e); process.exit(1); });

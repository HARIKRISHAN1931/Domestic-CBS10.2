/**
 * Run once to scaffold country-master.data.xlsx with the 3 required sheets.
 * Usage: npx ts-node scripts/setup-country-master-excel.ts
 */
import * as ExcelJS from 'exceljs';
import * as path    from 'path';
import * as fs      from 'fs';

const FILE = path.join(
  process.cwd(),
  'src/modules/Administration/TenantAndBranchManagement/CountryMaster/data/country-master.data.xlsx',
);

const CREATE_HEADERS = [
  'countryCode', 'countryName', 'countryAbbrevation', 'numCountyCd',
  'countryType', 'isdCode', 'zone', 'region',
  'restrictedY', 'restrictedN', 'gracePrdY', 'gracePrdN', 'gracePrd',
  'ecgcCoverY', 'ecgcCoverN', 'isAplhanumericY', 'isAplhanumericN', 'pinLength',
];

const UPDATE_HEADERS = [...CREATE_HEADERS, 'searchKey', 'tab'];

const AUTH_HEADERS = ['searchKey', 'tab'];

async function ensureSheet(
  wb: ExcelJS.Workbook,
  name: string,
  headers: string[],
): Promise<void> {
  let ws = wb.getWorksheet(name);
  if (!ws) {
    ws = wb.addWorksheet(name);
    ws.addRow(headers);
    // Add one sample data row so testers know the structure
    const sample: Record<string, string> = {};
    headers.forEach(h => { sample[h] = ''; });
    ws.addRow(headers.map(() => ''));
  }
}

(async () => {
  const wb = new ExcelJS.Workbook();
  if (fs.existsSync(FILE)) {
    await wb.xlsx.readFile(FILE);
    console.log('Loaded existing workbook:', FILE);
  } else {
    console.log('Creating new workbook:', FILE);
  }

  await ensureSheet(wb, 'Create', CREATE_HEADERS);
  await ensureSheet(wb, 'Update', UPDATE_HEADERS);
  await ensureSheet(wb, 'Auth',   AUTH_HEADERS);

  await wb.xlsx.writeFile(FILE);
  console.log('✅ Sheets ensured: Create, Update, Auth');
})();

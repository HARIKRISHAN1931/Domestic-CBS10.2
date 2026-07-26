/**
 * Ensures Create, Update, Auth sheets exist in all 6 screen Excel files.
 * Usage: npx ts-node scripts/setup-all-masters-excel.ts
 */
import * as ExcelJS from 'exceljs';
import * as path    from 'path';
import * as fs      from 'fs';

const BASE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement');

const SCREENS: Array<{ file: string; createHeaders: string[]; updateHeaders: string[] }> = [
  {
    file: `${BASE}/StateMaster/data/state-master.data.xlsx`,
    createHeaders: ['countryCode', 'stateCode', 'gstCode', 'stateName', 'numstateCode'],
    updateHeaders: ['countryCode', 'stateCode', 'gstCode', 'stateName', 'numstateCode', 'searchKey', 'tab'],
  },
  {
    file: `${BASE}/DistrictMaster/data/district-master.data.xlsx`,
    createHeaders: ['countryCode', 'stateCode', 'districtCode', 'districtName', 'numCityCode', 'censusDistCode', 'subDistCode'],
    updateHeaders: ['countryCode', 'stateCode', 'districtCode', 'districtName', 'numCityCode', 'censusDistCode', 'subDistCode', 'searchKey', 'tab'],
  },
  {
    file: `${BASE}/Subdivisionthana/data/subdivisionthana.data.xlsx`,
    createHeaders: ['country', 'state', 'cityCd', 'areaCd', 'areaDesc'],
    updateHeaders: ['country', 'state', 'cityCd', 'areaCd', 'areaDesc', 'searchKey', 'tab'],
  },
  {
    file: `${BASE}/BlockmunicipalMaster/data/blockmunicipal-master.data.xlsx`,
    createHeaders: ['country', 'state', 'city', 'area', 'municipalityBlock', 'areaName', 'censusBlockCd'],
    updateHeaders: ['country', 'state', 'city', 'area', 'municipalityBlock', 'areaName', 'censusBlockCd', 'searchKey', 'tab'],
  },
  {
    file: `${BASE}/VillageMaster/data/village-master.data.xlsx`,
    createHeaders: ['country', 'state', 'city', 'area', 'municipalityBlock', 'villageCode', 'villageDesc', 'pinCode'],
    updateHeaders: ['country', 'state', 'city', 'area', 'municipalityBlock', 'villageCode', 'villageDesc', 'pinCode', 'searchKey', 'tab'],
  },
  {
    file: `${BASE}/UrbanMaster/data/urban-master.data.xlsx`,
    createHeaders: ['country', 'state', 'city', 'area', 'municipalityBlock', 'ruralUrban', 'urbanCode', 'urbanDesc', 'pinCode'],
    updateHeaders: ['country', 'state', 'city', 'area', 'municipalityBlock', 'ruralUrban', 'urbanCode', 'urbanDesc', 'pinCode', 'searchKey', 'tab'],
  },
];

const AUTH_HEADERS = ['searchKey', 'tab'];

async function ensureSheet(wb: ExcelJS.Workbook, name: string, headers: string[]): Promise<void> {
  if (!wb.getWorksheet(name)) {
    const ws = wb.addWorksheet(name);
    ws.addRow(headers);
    ws.addRow(headers.map(() => ''));
  }
}

(async () => {
  for (const screen of SCREENS) {
    const wb = new ExcelJS.Workbook();
    if (fs.existsSync(screen.file)) {
      await wb.xlsx.readFile(screen.file);
    }
    await ensureSheet(wb, 'Create', screen.createHeaders);
    await ensureSheet(wb, 'Update', screen.updateHeaders);
    await ensureSheet(wb, 'Auth',   AUTH_HEADERS);
    await wb.xlsx.writeFile(screen.file);
    console.log(`✅ ${path.basename(screen.file)}`);
  }
})();

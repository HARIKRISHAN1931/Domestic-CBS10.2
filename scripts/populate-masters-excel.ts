/**
 * Populates Create/Update/Auth sheets with sample test data for all 6 master screens.
 * Usage: npx ts-node scripts/populate-masters-excel.ts
 */
import * as ExcelJS from 'exceljs';
import * as path    from 'path';

const BASE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement');

async function setRow(wb: ExcelJS.Workbook, sheet: string, data: Record<string, string>): Promise<void> {
  const ws = wb.getWorksheet(sheet);
  if (!ws) return;
  // Row 1 = headers, Row 2 = data
  const headers: string[] = [];
  ws.getRow(1).eachCell((cell) => headers.push(String(cell.value ?? '')));
  const row = ws.getRow(2);
  headers.forEach((h, i) => { row.getCell(i + 1).value = data[h] ?? ''; });
  row.commit();
}

(async () => {
  // ── StateMaster ──────────────────────────────────────────────────────────
  {
    const file = `${BASE}/StateMaster/data/state-master.data.xlsx`;
    const wb   = new ExcelJS.Workbook(); await wb.xlsx.readFile(file);
    await setRow(wb, 'Create', {
      countryCode: 'IN', stateCode: 'TS01', gstCode: '36',
      stateName: 'Test State Auto', numstateCode: '036',
    });
    await setRow(wb, 'Update', {
      countryCode: 'IN', stateCode: 'TS01', gstCode: '36',
      stateName: 'Test State Updated', numstateCode: '036',
      searchKey: 'TS01', tab: 'authorized',
    });
    await setRow(wb, 'Auth', { searchKey: 'TS01', tab: 'pending' });
    await wb.xlsx.writeFile(file);
    console.log('✅ StateMaster');
  }

  // ── DistrictMaster ───────────────────────────────────────────────────────
  {
    const file = `${BASE}/DistrictMaster/data/district-master.data.xlsx`;
    const wb   = new ExcelJS.Workbook(); await wb.xlsx.readFile(file);
    await setRow(wb, 'Create', {
      countryCode: 'IN', stateCode: 'TS01', districtCode: 'DT01',
      districtName: 'Test District Auto', numCityCode: '001',
      censusDistCode: 'CD01', subDistCode: 'SD01',
    });
    await setRow(wb, 'Update', {
      countryCode: 'IN', stateCode: 'TS01', districtCode: 'DT01',
      districtName: 'Test District Updated', numCityCode: '001',
      censusDistCode: 'CD01', subDistCode: 'SD01',
      searchKey: 'DT01', tab: 'authorized',
    });
    await setRow(wb, 'Auth', { searchKey: 'DT01', tab: 'pending' });
    await wb.xlsx.writeFile(file);
    console.log('✅ DistrictMaster');
  }

  // ── Subdivisionthana (AreaMaster) ─────────────────────────────────────────
  {
    const file = `${BASE}/Subdivisionthana/data/subdivisionthana.data.xlsx`;
    const wb   = new ExcelJS.Workbook(); await wb.xlsx.readFile(file);
    await setRow(wb, 'Create', {
      country: 'IN', state: 'TS01', cityCd: 'DT01',
      areaCd: 'AR01', areaDesc: 'Test Area Auto',
    });
    await setRow(wb, 'Update', {
      country: 'IN', state: 'TS01', cityCd: 'DT01',
      areaCd: 'AR01', areaDesc: 'Test Area Updated',
      searchKey: 'AR01', tab: 'authorized',
    });
    await setRow(wb, 'Auth', { searchKey: 'AR01', tab: 'pending' });
    await wb.xlsx.writeFile(file);
    console.log('✅ Subdivisionthana');
  }

  // ── BlockmunicipalMaster ─────────────────────────────────────────────────
  {
    const file = `${BASE}/BlockmunicipalMaster/data/blockmunicipal-master.data.xlsx`;
    const wb   = new ExcelJS.Workbook(); await wb.xlsx.readFile(file);
    await setRow(wb, 'Create', {
      country: 'IN', state: 'TS01', city: 'DT01', area: 'AR01',
      municipalityBlock: 'BL01', areaName: 'Test Block Auto', censusBlockCd: 'CB01',
    });
    await setRow(wb, 'Update', {
      country: 'IN', state: 'TS01', city: 'DT01', area: 'AR01',
      municipalityBlock: 'BL01', areaName: 'Test Block Updated', censusBlockCd: 'CB01',
      searchKey: 'BL01', tab: 'authorized',
    });
    await setRow(wb, 'Auth', { searchKey: 'BL01', tab: 'pending' });
    await wb.xlsx.writeFile(file);
    console.log('✅ BlockmunicipalMaster');
  }

  // ── VillageMaster ────────────────────────────────────────────────────────
  {
    const file = `${BASE}/VillageMaster/data/village-master.data.xlsx`;
    const wb   = new ExcelJS.Workbook(); await wb.xlsx.readFile(file);
    await setRow(wb, 'Create', {
      country: 'IN', state: 'TS01', city: 'DT01', area: 'AR01',
      municipalityBlock: 'BL01', villageCode: 'VL01',
      villageDesc: 'Test Village Auto', pinCode: '500001',
    });
    await setRow(wb, 'Update', {
      country: 'IN', state: 'TS01', city: 'DT01', area: 'AR01',
      municipalityBlock: 'BL01', villageCode: 'VL01',
      villageDesc: 'Test Village Updated', pinCode: '500001',
      searchKey: 'VL01', tab: 'authorized',
    });
    await setRow(wb, 'Auth', { searchKey: 'VL01', tab: 'pending' });
    await wb.xlsx.writeFile(file);
    console.log('✅ VillageMaster');
  }

  // ── UrbanMaster ──────────────────────────────────────────────────────────
  {
    const file = `${BASE}/UrbanMaster/data/urban-master.data.xlsx`;
    const wb   = new ExcelJS.Workbook(); await wb.xlsx.readFile(file);
    await setRow(wb, 'Create', {
      country: 'IN', state: 'TS01', city: 'DT01', area: 'AR01',
      municipalityBlock: 'BL01', ruralUrban: 'U',
      urbanCode: 'UR01', urbanDesc: 'Test Urban Auto', pinCode: '500001',
    });
    await setRow(wb, 'Update', {
      country: 'IN', state: 'TS01', city: 'DT01', area: 'AR01',
      municipalityBlock: 'BL01', ruralUrban: 'U',
      urbanCode: 'UR01', urbanDesc: 'Test Urban Updated', pinCode: '500001',
      searchKey: 'UR01', tab: 'authorized',
    });
    await setRow(wb, 'Auth', { searchKey: 'UR01', tab: 'pending' });
    await wb.xlsx.writeFile(file);
    console.log('✅ UrbanMaster');
  }
})();

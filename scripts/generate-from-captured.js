const fs      = require('fs');
const path    = require('path');
const ExcelJS = require('exceljs');

const BASE    = path.join(__dirname, '../src/modules/Administration/TenantAndBranchManagement');
const CAP_DIR = path.join(__dirname, '../captured-screens');
const SKIP    = new Set(['menuSearchBox','lockloginId','lockpwd','searchBox','level1','level2','qmenul1l2',
                         'okButtonforShowDiffPopUp','createdBy123','createdDate','createdTime',
                         'lastmodifBy','lastmodifDate','lastmodifTime','status','rev','rejectedReson',
                         'branchCode','branchName']);

// Screen definitions: folder, itemId, label, keyField, updateField
const SCREENS = [
  { folder: 'TenantGroupMaster',      itemId: 'TENANTGROUPMST',          label: 'Tenant Group Master',          key: 'institutionId',  updateField: 'institutionName', saveBtn: '#btnSave',            sampleKey: 'GRP01' },
  { folder: 'TenantMaster',           itemId: 'TENANTMST',               label: 'Tenant Master',                key: 'tenantId',       updateField: 'institutionName', saveBtn: '#btnSave',            sampleKey: 'TNT001' },
  { folder: 'CountryMaster',          itemId: 'COUNTRYMST',              label: 'Country Master',               key: 'countryCode',    updateField: 'countryName',    saveBtn: 'button#saveCustomer', sampleKey: 'IND' },
  { folder: 'StateMaster',            itemId: 'STATEMST',                label: 'State Master',                 key: 'stateCode',      updateField: 'stateName',      saveBtn: 'button#saveCustomer', sampleKey: 'MH' },
  { folder: 'DistrictMaster',         itemId: 'DISTRICTMST',             label: 'District Master',              key: 'districtCode',   updateField: 'districtName',   saveBtn: 'button#saveCustomer', sampleKey: 'PUN' },
  { folder: 'Subdivisionthana',       itemId: 'AREAMASTER',              label: 'Sub-Division/Thana',           key: 'areaCd',         updateField: 'areaDesc',       saveBtn: 'button#saveCustomer', sampleKey: 'ARE01' },
  { folder: 'BlockmunicipalMaster',   itemId: 'MUNICIPALITYBLOCKMASTER', label: 'Block/Municipal Master',       key: 'blockCode',      updateField: 'blockName',      saveBtn: 'button#saveCustomer', sampleKey: 'BLK01' },
  { folder: 'VillageMaster',          itemId: 'VILLAGEMASTER',           label: 'Village Master',               key: 'villageCode',    updateField: 'villageDesc',    saveBtn: 'button#saveCustomer', sampleKey: 'VIL01' },
  { folder: 'UrbanMaster',            itemId: 'URBANMASTER',             label: 'Urban Master',                 key: 'urbanCode',      updateField: 'urbanDesc',      saveBtn: 'button#saveCustomer', sampleKey: 'URB01' },
  { folder: 'IfscMaster',             itemId: 'IFSCMST',                 label: 'IFSC Master',                  key: 'ifscCd',         updateField: 'bankName',       saveBtn: '#btnSave',            sampleKey: 'SBIN0001234' },
  { folder: 'BranchManagement',       itemId: 'BRANCHMGMT',              label: 'Branch Management',            key: 'branchCode',     updateField: 'branchName',     saveBtn: 'button#saveCustomer', sampleKey: '001' },
];

function loadFields(folder) {
  const file = path.join(CAP_DIR, `${folder}.json`);
  if (!fs.existsSync(file)) return [];
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  return (data.fields || []).filter(f => f.id && !SKIP.has(f.id) && f.type !== 'button' && f.type !== 'password');
}

function toKebab(s) { return s.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, ''); }

function genFillLine(f) {
  if (f.type === 'select') return `    if (data.${f.id} !== undefined) await this.sel('${f.id}', data.${f.id}!);`;
  if (f.type === 'radio')  return `    if (data.${f.id} !== undefined) await this.page.locator('#' + data.${f.id}).click().catch(() => {});`;
  return `    if (data.${f.id} !== undefined) { await this.inp('${f.id}', data.${f.id}!); await this.tab('${f.id}'); }`;
}

function genPage(s, fields) {
  const iface = fields.map(f => `  ${f.id}?: string;`).join('\n');
  const fills = fields.map(genFillLine).join('\n');
  return `import { Locator } from '@playwright/test';
import { BasePage } from '../../../../../framework/base/BasePage';

export interface ${s.folder}Data {
${iface}
}

export class ${s.folder}Page extends BasePage {
  readonly pageTitle = '${s.label}';

  private v   = (id: string): Locator => this.page.locator(\`#\${id}\`).first();
  private inp = async (id: string, val: string) => { await this.fill(this.v(id), val); };
  private sel = async (id: string, val: string) => { await this.selectOption(this.v(id), val); };
  private tab = async (id: string) => { await this.v(id).press('Tab'); };

  async openCreateForm(): Promise<void> {
    const addBtn = this.page.locator('#addButton');
    await addBtn.waitFor({ state: 'attached', timeout: 15_000 });
    await addBtn.click({ force: true });
    await this.waitForAjax();
    await this.page.locator('#${s.key}').first().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async fillForm(data: ${s.folder}Data): Promise<void> {
    await this.waitForAjax();
${fills}
  }

  async save(): Promise<string> {
    const btn = this.page.locator('${s.saveBtn}').first();
    await btn.waitFor({ state: 'visible', timeout: 15_000 });
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await btn.click({ force: true });
    await this.waitForAjax();
    // Handle confirm modal if present
    const confirm = this.page.locator('#submitForm');
    if (await confirm.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await confirm.click();
      await this.waitForAjax();
    }
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 20_000 });
    return (await toast.innerText()).trim();
  }

  async create(data: ${s.folder}Data): Promise<string> {
    await this.fillForm(data);
    return this.save();
  }

  async approve(searchText: string): Promise<string> {
    await this.page.locator('#dt-pendingdata tbody tr').filter({ hasText: searchText }).first()
      .locator('.authorization-btns a').first().click();
    await this.waitForAjax();
    await this.page.locator('#idApprove').click();
    await this.page.locator('#btnApproveId').click();
    await this.waitForAjax();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.innerText()).trim();
  }

  async reject(searchText: string, remark: string): Promise<string> {
    await this.page.locator('#dt-pendingdata tbody tr').filter({ hasText: searchText }).first()
      .locator('.authorization-btns a').first().click();
    await this.waitForAjax();
    await this.page.locator('#idReject').click();
    await this.page.locator('#rejectRemark, #remarkId').first().fill(remark);
    await this.page.locator('#btnRejectId').click();
    await this.waitForAjax();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.innerText()).trim();
  }

  async update(searchText: string, data: Partial<${s.folder}Data>): Promise<string> {
    await this.page.locator('#searchInput, input[type="search"]').first().fill(searchText);
    await this.waitForAjax();
    await this.page.locator('a.btn-edit, .edit-btn, a[title="Edit"]').first().click();
    await this.waitForAjax();
    await this.fillForm(data as ${s.folder}Data);
    return this.save();
  }
}
`;
}

function genRepo(s) {
  return `import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface ${s.folder}DbRow {
  authStatus: string;
  isActive:   number;
}

export class ${s.folder}Repository extends BaseRepository {
  async findByCode(code: string): Promise<${s.folder}DbRow | null> {
    return this.queryOne<${s.folder}DbRow>(
      \`SELECT authStatus, isActive FROM ${s.folder.toUpperCase()} WHERE ${s.key} = @code AND isActive = 1\`,
      { code }
    );
  }
}
`;
}

function genSpec(s, type) {
  const dataFile = `path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/${s.folder}/data/${toKebab(s.folder)}.data.xlsx')`;
  const imports = `import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { ${s.folder}Page, ${s.folder}Data } from '../src/${s.folder}Page';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = ${dataFile};
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', '${s.itemId}');
`;

  if (type === 'create') return `${imports}
test.describe('${s.label} > Create @smoke @regression', () => {
  test('should create ${s.label.toLowerCase()}', async ({ authenticatedPage }) => {
    const [rows] = await Promise.all([ExcelHelper.readSheet<${s.folder}Data>(DATA_FILE, 'Create')]);
    const data   = rows[0];
    const screen = new ${s.folder}Page(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    const toast = await test.step('Fill and save', () => screen.create(data));
    expect(toast).toBeTruthy();
  });
});
`;

  if (type === 'authorize') return `${imports}
test.describe('${s.label} > Authorize @regression', () => {
  test('should authorize ${s.label.toLowerCase()}', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<${s.folder}Data>(DATA_FILE, 'Authorize');
    const data   = rows[0];
    const screen = new ${s.folder}Page(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Approve', () => screen.approve(data.${s.key}!));
    expect(toast).toBeTruthy();
  });
});
`;

  if (type === 'update') return `${imports}
test.describe('${s.label} > Update @regression', () => {
  test('should update ${s.label.toLowerCase()}', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<${s.folder}Data>(DATA_FILE, 'Update');
    const data   = rows[0];
    const screen = new ${s.folder}Page(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Search, edit and save', () => screen.update(data.${s.key}!, { ${s.updateField}: data.${s.updateField} }));
    expect(toast).toBeTruthy();
  });
});
`;

  if (type === 'negative') return `${imports}
test.describe('${s.label} > Negative @regression', () => {
  test('should reject ${s.label.toLowerCase()}', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<${s.folder}Data>(DATA_FILE, 'Negative');
    const data   = rows[0];
    const screen = new ${s.folder}Page(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Reject', () => screen.reject(data.${s.key}!, 'Rejected by automation'));
    expect(toast).toBeTruthy();
  });
});
`;

  if (type === 'db') return `import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { ${s.folder}Data } from '../src/${s.folder}Page';
import { ${s.folder}Repository } from '../src/${s.folder}Repository';
import path from 'path';

const DATA_FILE = ${dataFile};

test.describe('${s.label} > Database @database @regression', () => {
  test('should exist in DB after create', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<${s.folder}Data>(DATA_FILE, 'Database');
    const repo = new ${s.folder}Repository(db);
    const row  = await repo.findByCode(rows[0].${s.key}!);
    expect(row, \`${s.label} must exist in DB\`).not.toBeNull();
  });
});
`;
}

async function genExcel(s, fields, filePath) {
  const wb = new ExcelJS.Workbook();
  const enabledFields = fields.filter(f => f.type !== 'radio');
  const headers = enabledFields.map(f => f.id);

  const SAMPLE = {
    institutionId: s.sampleKey, institutionName: `Test ${s.label}`,
    tenantId: s.sampleKey,
    countryCode: s.sampleKey, countryName: 'Test Country', countryAbbrevation: 'TC', numCountyCd: '999', pinLength: '6',
    stateCode: s.sampleKey, stateName: 'Test State', gstCode: '99', numstateCode: '999',
    districtCode: s.sampleKey, districtName: 'Test District', numCityCode: '999', censusDistCode: '99', subDistCode: '99',
    areaCd: s.sampleKey, areaDesc: 'Test Area',
    blockCode: s.sampleKey, blockName: 'Test Block',
    villageCode: s.sampleKey, villageDesc: 'Test Village',
    urbanCode: s.sampleKey, urbanDesc: 'Test Urban',
    ifscCd: s.sampleKey, bankName: 'Test Bank', bankRbiCd: '999', branchRbiCd: '9999',
    addr1: '123 Test Street', addr2: 'Test Area', addr3: 'Test City', city: 'Mumbai', state: 'Maharashtra',
    branchCode: s.sampleKey, branchName: 'Test Branch',
    address1: '123 Test Street', emailId: 'test@bank.com', tele1: '0222222222', postalCode: '400001',
    bsrCode: '9999999', micrCode: '400002001', ifscCode: 'SBIN0001234',
  };

  const sampleRow = headers.map(h => SAMPLE[h] !== undefined ? SAMPLE[h] : '');

  const sheets = {
    Create:    [headers, sampleRow],
    Update:    [[s.key, s.updateField], [s.sampleKey, `Updated ${s.label}`]],
    Authorize: [[s.key], [s.sampleKey]],
    Negative:  [[s.key], [s.sampleKey]],
    Database:  [[s.key], [s.sampleKey]],
  };

  for (const [name, rows] of Object.entries(sheets)) {
    const ws = wb.addWorksheet(name);
    rows.forEach(r => ws.addRow(r));
  }
  await wb.xlsx.writeFile(filePath);
}

async function main() {
  for (const s of SCREENS) {
    const fields   = loadFields(s.folder);
    const srcDir   = path.join(BASE, s.folder, 'src');
    const testsDir = path.join(BASE, s.folder, 'tests');
    const dataDir  = path.join(BASE, s.folder, 'data');
    [srcDir, testsDir, dataDir].forEach(d => fs.mkdirSync(d, { recursive: true }));

    fs.writeFileSync(path.join(srcDir,   `${s.folder}Page.ts`),       genPage(s, fields));
    fs.writeFileSync(path.join(srcDir,   `${s.folder}Repository.ts`), genRepo(s));
    fs.writeFileSync(path.join(testsDir, 'create.spec.ts'),            genSpec(s, 'create'));
    fs.writeFileSync(path.join(testsDir, 'authorize.spec.ts'),         genSpec(s, 'authorize'));
    fs.writeFileSync(path.join(testsDir, 'update.spec.ts'),            genSpec(s, 'update'));
    fs.writeFileSync(path.join(testsDir, 'negative.spec.ts'),          genSpec(s, 'negative'));
    fs.writeFileSync(path.join(testsDir, 'db.spec.ts'),                genSpec(s, 'db'));

    const excelPath = path.join(dataDir, `${toKebab(s.folder)}.data.xlsx`);
    await genExcel(s, fields, excelPath);

    console.log(`✓ ${s.folder} (${fields.length} fields)`);
  }
  console.log('\n✅ All screens generated.');
}

main().catch(e => { console.error(e); process.exit(1); });

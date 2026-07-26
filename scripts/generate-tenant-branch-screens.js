const fs   = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const BASE = path.join(__dirname, '../src/modules/Administration/TenantAndBranchManagement');
const SUB  = 'setupAdm';
const TOP  = 'Administration';

const SCREENS = [
  { folder: 'TenantGroupMaster',      itemId: 'TENANTGROUPMST',        label: 'Tenant Group Master',         fields: ['groupId','groupName','description'],                         key: 'groupId' },
  { folder: 'BranchManagement',       itemId: 'BRANCHMGMT',            label: 'Branch Management',           fields: ['branchCode','branchName','address1','pinCode','state','city'], key: 'branchCode' },
  { folder: 'Subdivisionthana',       itemId: 'AREAMASTER',            label: 'Sub-Division/Thana',          fields: ['areaCode','areaName','districtCode'],                         key: 'areaCode' },
  { folder: 'BlockmunicipalMaster',   itemId: 'MUNICIPALITYBLOCKMASTER',label: 'Block/Municipal Master',     fields: ['blockCode','blockName','districtCode'],                       key: 'blockCode' },
  { folder: 'VillageMaster',          itemId: 'VILLAGEMASTER',         label: 'Village Master',              fields: ['villageCode','villageName','blockCode'],                      key: 'villageCode' },
  { folder: 'UrbanMaster',            itemId: 'URBANMASTER',           label: 'Urban Master',                fields: ['urbanCode','urbanName','districtCode'],                       key: 'urbanCode' },
  { folder: 'BranchToBranchDataMapping', itemId: 'BRTOBRMAP',          label: 'Branch To Branch Data Mapping', fields: ['fromBranch','toBranch','mappingType'],                    key: 'fromBranch' },
  { folder: 'IfscMaster',             itemId: 'IFSCMST',               label: 'IFSC Master',                 fields: ['ifscCode','bankName','branchName','address'],                 key: 'ifscCode' },
  { folder: 'CountryMaster',          itemId: 'COUNTRYMST',            label: 'Country Master',              fields: ['countryCode','countryName','isoCode'],                        key: 'countryCode' },
  { folder: 'StateMaster',            itemId: 'STATEMST',              label: 'State Master',                fields: ['stateCode','stateName','countryCode'],                        key: 'stateCode' },
  { folder: 'DistrictMaster',         itemId: 'DISTRICTMST',           label: 'District Master',             fields: ['districtCode','districtName','stateCode'],                    key: 'districtCode' },
];

function toPascal(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function genPage(s) {
  const iface = s.fields.map(f => `  ${f}?: string;`).join('\n');
  const fills  = s.fields.map(f =>
    `    if (data.${f}) { await this.inp('${f}', data.${f}); await this.tab('${f}'); }`
  ).join('\n');

  return `import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../../../framework/base/BasePage';

export interface ${s.folder}Data {
${iface}
}

export class ${s.folder}Page extends BasePage {
  readonly pageTitle = '${s.label}';

  private v   = (id: string): Locator => this.loc(\`#\${id}\`);
  private inp = async (id: string, val: string) => { await this.fill(this.v(id), val); };
  private tab = async (id: string) => { await this.v(id).press('Tab'); };

  async openCreateForm(): Promise<void> {
    await this.loc('button.add, #addButton, a.button.add').first().click();
    await this.waitForAjax();
    await this.v('${s.key}').waitFor({ state: 'visible', timeout: 30_000 });
  }

  async fillForm(data: ${s.folder}Data): Promise<void> {
    await this.waitForAjax();
${fills}
  }

  async save(): Promise<string> {
    for (let attempt = 1; attempt <= 10; attempt++) {
      const btn = this.loc('button#saveCustomer, a.button.sm.btn-save, #btnSave').first();
      const visible = await btn.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true).catch(() => false);
      if (!visible) continue;
      await btn.scrollIntoViewIfNeeded().catch(() => {});
      await btn.click({ force: true });
      await this.waitForAjax();
      const confirmVisible = await this.loc('#submitForm').waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false);
      if (!confirmVisible) continue;
      await this.loc('#submitForm').click();
      await this.waitForAjax();
      const errToast = this.loc('.toast-messages .msg-toast.msg-error em');
      if (await errToast.isVisible({ timeout: 3_000 }).catch(() => false)) continue;
      const toast = this.loc('.toast-messages .msg-toast.msg-success em');
      if (await toast.isVisible({ timeout: 15_000 }).catch(() => false)) return (await toast.innerText()).trim();
    }
    throw new Error('[${s.folder}] Save failed after 10 attempts');
  }

  async create(data: ${s.folder}Data): Promise<string> {
    await this.fillForm(data);
    return this.save();
  }

  async approve(searchText: string): Promise<string> {
    await this.loc('#dt-pendingdata tbody tr').filter({ hasText: searchText }).first()
      .locator('.authorization-btns a').first().click();
    await this.waitForAjax();
    await this.loc('#idApprove').click();
    await this.loc('#btnApproveId').click();
    await this.waitForAjax();
    const toast = this.loc('.toast-messages .msg-toast.msg-success em');
    await toast.first().waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.first().innerText()).trim();
  }

  async reject(searchText: string, remark: string): Promise<string> {
    await this.loc('#dt-pendingdata tbody tr').filter({ hasText: searchText }).first()
      .locator('.authorization-btns a').first().click();
    await this.waitForAjax();
    await this.loc('#idReject').click();
    await this.loc('#rejectRemark, #remarkId').first().fill(remark);
    await this.loc('#btnRejectId').click();
    await this.waitForAjax();
    const toast = this.loc('.toast-messages .msg-toast.msg-success em');
    await toast.first().waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.first().innerText()).trim();
  }

  async update(searchText: string, data: Partial<${s.folder}Data>): Promise<string> {
    await this.loc('#searchInput, input[type="search"]').first().fill(searchText);
    await this.waitForAjax();
    await this.loc('a.btn-edit, .edit-btn, a[title="Edit"]').first().click();
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
  ${s.key}: string;
  authStatus: string;
  isActive:   number;
}

export class ${s.folder}Repository extends BaseRepository {
  async findByCode(code: string): Promise<${s.folder}DbRow | null> {
    return this.queryOne<${s.folder}DbRow>(
      \`SELECT ${s.key}, authStatus, isActive FROM ${s.folder.toUpperCase()} WHERE ${s.key} = @code AND isActive = 1\`,
      { code }
    );
  }

  async findAuthorized(code: string): Promise<${s.folder}DbRow | null> {
    return this.queryOne<${s.folder}DbRow>(
      \`SELECT ${s.key}, authStatus, isActive FROM ${s.folder.toUpperCase()} WHERE ${s.key} = @code AND authStatus = 'A' AND isActive = 1\`,
      { code }
    );
  }
}
`;
}

function genCreate(s) {
  return `import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { ${s.folder}Page, ${s.folder}Data } from '../src/${s.folder}Page';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/${s.folder}/data/${s.folder.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/,'')}.data.xlsx');

test.describe('${s.label} > Create @smoke @regression', () => {

  test('should create ${s.label.toLowerCase()}', async ({ authenticatedPage }) => {
    const rows = await ExcelHelper.readSheet<${s.folder}Data>(DATA_FILE, 'Create');
    const data = rows[0];
    const screen = new ${s.folder}Page(authenticatedPage);
    const menu   = new MenuNavigation(authenticatedPage);

    await test.step('Navigate to ${s.label}', () => menu.navigate('${TOP}', '${SUB}', '${s.itemId}'));
    await test.step('Open create form', () => screen.openCreateForm());
    const toast = await test.step('Fill and save', () => screen.create(data));
    expect(toast).toBeTruthy();
  });

});
`;
}

function genAuthorize(s) {
  return `import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { ${s.folder}Page, ${s.folder}Data } from '../src/${s.folder}Page';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/${s.folder}/data/${s.folder.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/,'')}.data.xlsx');

test.describe('${s.label} > Authorize @regression', () => {

  test('should authorize ${s.label.toLowerCase()}', async ({ authenticatedPage }) => {
    const rows = await ExcelHelper.readSheet<${s.folder}Data>(DATA_FILE, 'Authorize');
    const data = rows[0];
    const screen = new ${s.folder}Page(authenticatedPage);
    const menu   = new MenuNavigation(authenticatedPage);

    await test.step('Navigate to ${s.label}', () => menu.navigate('${TOP}', '${SUB}', '${s.itemId}'));
    const toast = await test.step('Approve pending record', () => screen.approve(data.${s.key}!));
    expect(toast).toBeTruthy();
  });

});
`;
}

function genUpdate(s) {
  return `import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { ${s.folder}Page, ${s.folder}Data } from '../src/${s.folder}Page';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/${s.folder}/data/${s.folder.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/,'')}.data.xlsx');

test.describe('${s.label} > Update @regression', () => {

  test('should update ${s.label.toLowerCase()}', async ({ authenticatedPage }) => {
    const rows = await ExcelHelper.readSheet<${s.folder}Data>(DATA_FILE, 'Update');
    const data = rows[0];
    const screen = new ${s.folder}Page(authenticatedPage);
    const menu   = new MenuNavigation(authenticatedPage);

    await test.step('Navigate to ${s.label}', () => menu.navigate('${TOP}', '${SUB}', '${s.itemId}'));
    const toast = await test.step('Search, edit and save', () => screen.update(data.${s.key}!, data));
    expect(toast).toBeTruthy();
  });

});
`;
}

function genNegative(s) {
  return `import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { ${s.folder}Page, ${s.folder}Data } from '../src/${s.folder}Page';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/${s.folder}/data/${s.folder.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/,'')}.data.xlsx');

test.describe('${s.label} > Negative @regression', () => {

  test('should reject ${s.label.toLowerCase()}', async ({ authenticatedPage }) => {
    const rows = await ExcelHelper.readSheet<${s.folder}Data>(DATA_FILE, 'Negative');
    const data = rows[0];
    const screen = new ${s.folder}Page(authenticatedPage);
    const menu   = new MenuNavigation(authenticatedPage);

    await test.step('Navigate to ${s.label}', () => menu.navigate('${TOP}', '${SUB}', '${s.itemId}'));
    const toast = await test.step('Reject pending record', () => screen.reject(data.${s.key}!, 'Rejected by automation'));
    expect(toast).toBeTruthy();
  });

});
`;
}

function genDb(s) {
  return `import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { ${s.folder}Data } from '../src/${s.folder}Page';
import { ${s.folder}Repository } from '../src/${s.folder}Repository';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/${s.folder}/data/${s.folder.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/,'')}.data.xlsx');

test.describe('${s.label} > Database @database @regression', () => {

  test('should exist in DB after create', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<${s.folder}Data>(DATA_FILE, 'Database');
    const data = rows[0];
    const repo = new ${s.folder}Repository(db);

    const row = await repo.findByCode(data.${s.key}!);
    expect(row, \`${s.label} \${data.${s.key}} must exist in DB\`).not.toBeNull();
  });

});
`;
}

async function genExcel(s, filePath) {
  const wb = new ExcelJS.Workbook();
  const keyVal = s.key.replace(/([A-Z])/g, ' $1').trim().toUpperCase().slice(0,6) + '001';
  const createRow = s.fields.map(f => f === s.key ? keyVal : `Sample ${f}`);
  const sheets = {
    Create:    [s.fields, createRow],
    Update:    [[s.key, s.fields[1] || s.fields[0]], [keyVal, 'Updated Value']],
    Authorize: [[s.key], [keyVal]],
    Negative:  [[s.key], [keyVal]],
    Database:  [[s.key], [keyVal]],
  };
  for (const [name, rows] of Object.entries(sheets)) {
    const ws = wb.addWorksheet(name);
    rows.forEach(r => ws.addRow(r));
  }
  await wb.xlsx.writeFile(filePath);
}

function toKebab(s) {
  return s.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

async function main() {
  for (const s of SCREENS) {
    const screenDir = path.join(BASE, s.folder);
    const srcDir    = path.join(screenDir, 'src');
    const testsDir  = path.join(screenDir, 'tests');
    const dataDir   = path.join(screenDir, 'data');

    [srcDir, testsDir, dataDir].forEach(d => fs.mkdirSync(d, { recursive: true }));

    fs.writeFileSync(path.join(srcDir,    `${s.folder}Page.ts`),       genPage(s));
    fs.writeFileSync(path.join(srcDir,    `${s.folder}Repository.ts`), genRepo(s));
    fs.writeFileSync(path.join(testsDir,  'create.spec.ts'),           genCreate(s));
    fs.writeFileSync(path.join(testsDir,  'authorize.spec.ts'),        genAuthorize(s));
    fs.writeFileSync(path.join(testsDir,  'update.spec.ts'),           genUpdate(s));
    fs.writeFileSync(path.join(testsDir,  'negative.spec.ts'),         genNegative(s));
    fs.writeFileSync(path.join(testsDir,  'db.spec.ts'),               genDb(s));

    const excelFile = path.join(dataDir, `${toKebab(s.folder)}.data.xlsx`);
    await genExcel(s, excelFile);

    console.log(`✓ ${s.folder}`);
  }
  console.log('\nAll screens generated.');
}

main().catch(e => { console.error(e); process.exit(1); });

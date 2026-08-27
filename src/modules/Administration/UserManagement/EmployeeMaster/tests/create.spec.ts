import * as path from 'path';
import * as fs from 'fs';
import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { EmployeeMasterPage } from '../src/EmployeeMasterPage';
import { EmployeeMasterValidator } from '../src/EmployeeMasterBuilder';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { EmployeeMasterData } from '../src/EmployeeMasterPage';

const DATA_FILE    = path.resolve(__dirname, '../data/employee-master.data.xlsx');
const DOC_FILE     = path.resolve(__dirname, '../data/test-doc.png');
const CREATED_FILE = path.resolve(__dirname, '../data/created-employees.json');
const NAV          = (page: any) => new MenuNavigation(page).navigate('Administration', 'usermgmtAdm', 'EMPLOYEEMST');

// Append empId to created-employees.json for authorize spec to consume
const storeCreatedEmpId = (empId: string): void => {
  const existing: string[] = fs.existsSync(CREATED_FILE)
    ? JSON.parse(fs.readFileSync(CREATED_FILE, 'utf-8'))
    : [];
  if (!existing.includes(empId)) {
    existing.push(empId);
    fs.writeFileSync(CREATED_FILE, JSON.stringify(existing, null, 2));
  }
};

const resolveRow = (row: EmployeeMasterData): EmployeeMasterData => ({
  ...row,
  docUpload:  DOC_FILE,
  docUpload1: DOC_FILE,
});

const createAndVerify = async (page: any, data: EmployeeMasterData, label: string) => {
  const screen    = new EmployeeMasterPage(page);
  const validator = new EmployeeMasterValidator();

  await test.step(`[${label}] Navigate`,  () => NAV(page));
  await test.step(`[${label}] Open form`, () => screen.openCreateForm());
  console.log(`[${label}] empId=${data.empId} postBr=${data.postBr} mobile=${data.mobile}`);
  await test.step(`[${label}] Fill form`, () => screen.fillForm(data));
  const toast = await test.step(`[${label}] Save`, () => screen.save());
  console.log(`[${label}] Toast: ${toast}`);
  validator.validateCreated(toast);

  // Store empId for authorize spec
  storeCreatedEmpId(data.empId!);
  console.log(`[${label}] Stored empId=${data.empId} in created-employees.json`);

  await test.step(`[${label}] Verify pending grid`, async () => {
    await screen.switchToPendingTab();
    await page.waitForTimeout(500);
    expect(
      await screen.isRecordInPendingGrid(data.empId!),
      `${data.empId} must appear in pending grid`
    ).toBe(true);
  });
};

// Load all data rows — skip header (row1) and notes (row2), filter valid empId only
const loadRows = async (): Promise<EmployeeMasterData[]> => {
  const rows = await ExcelHelper.readSheet<EmployeeMasterData>(DATA_FILE, 'Create');
  return rows
    .slice(1)                                              // skip notes row (row 2 in Excel)
    .filter(r => r.empId && String(r.empId).trim() !== '' && !String(r.empId).includes(' '))
    .map(resolveRow);
};

test.describe('Employee Master > Create', () => {

  // ── SANITY: first row from Excel ─────────────────────────────────────────────
  test('should create employee - sanity @sanity @sanity', async ({ authenticatedPage }) => {
    test.setTimeout(180_000);
    const rows = await loadRows();
    const data = rows[0];
    await createAndVerify(authenticatedPage, data, `SANITY-${data.empId}`);
  });

  // ── REGRESSION: remaining 83 rows (rows[0] already covered by sanity) ─────────
  test('should create all branch employees @regression', async ({ authenticatedPage }) => {
    test.setTimeout(5_400_000); // 83 employees × ~60s each
    const rows = await loadRows();
    for (const data of rows.slice(1)) {
      await createAndVerify(authenticatedPage, data, `${data.empId}-Br${data.postBr}`);
    }
  });

});

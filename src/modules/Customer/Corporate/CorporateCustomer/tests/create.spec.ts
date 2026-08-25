import * as path from 'path';
import * as fs from 'fs';
import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { CorporateCustomerPage, CorporateCustomerData } from '../src/CorporateCustomerPage';
import { CorporateCustomerValidator } from '../src/CorporateCustomerBuilder';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';

const DATA_FILE    = path.resolve(__dirname, '../data/corporate-customer.data.xlsx');
const DOC_FILE     = path.resolve(__dirname, '../data/test-doc.png');
const CREATED_FILE = path.resolve(__dirname, '../data/created-customers.json');

const NAV = async (page: any): Promise<void> => {
  await page.locator('a.item-nav').first().click();
  await page.waitForTimeout(400);
  await page.locator('a[href*="corporateCustomerList"]').click({ force: true });
  await page.waitForTimeout(2_000);
};

const storeCreated = (name: string): void => {
  const list: string[] = fs.existsSync(CREATED_FILE)
    ? JSON.parse(fs.readFileSync(CREATED_FILE, 'utf-8')) : [];
  if (!list.includes(name)) { list.push(name); fs.writeFileSync(CREATED_FILE, JSON.stringify(list, null, 2)); }
};

const loadRows = async (): Promise<CorporateCustomerData[]> => {
  const rows = await ExcelHelper.readSheet<CorporateCustomerData>(DATA_FILE, 'Create');
  return rows
    .slice(1)
    .filter(r => r.memberFName && String(r.memberFName).trim() !== '')
    .map(r => ({ ...r, docUpload: DOC_FILE }));
};

const createAndVerify = async (
  page: any,
  data: CorporateCustomerData,
  label: string,
  mode: 'mandatory' | 'full' = 'full'
) => {
  const screen    = new CorporateCustomerPage(page);
  const validator = new CorporateCustomerValidator();

  await test.step(`[${label}] Navigate`, () => NAV(page));
  await test.step(`[${label}] Open form`, () => screen.openCreateForm());
  console.log(`[${label}] name=${data.memberFName} mobile=${data.mobileNo1} mode=${mode}`);
  await test.step(`[${label}] Fill form`, () => screen.fillForm(data, mode));
  const toast = await test.step(`[${label}] Save`, () => screen.save());
  console.log(`[${label}] Toast: ${toast}`);
  validator.validateCreated(toast);
  storeCreated(String(data.memberFName));

  await test.step(`[${label}] Verify pending grid`, async () => {
    await screen.switchToPendingTab();
    expect(
      await screen.isRecordInPendingGrid(String(data.memberFName)),
      `${data.memberFName} must appear in pending grid`
    ).toBe(true);
  });
};

test.describe('Corporate Customer > Create', () => {

  test('should create corporate customer @sanity @smoke', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);  // mandatory-only: ~1-2 min
    const rows = await loadRows();
    await createAndVerify(authenticatedPage, rows[0], `SANITY-${rows[0].memberFName}`, 'mandatory');
  });

  test('should create all corporate customers @regression', async ({ authenticatedPage }) => {
    test.setTimeout(900_000);
    const rows = await loadRows();
    for (const data of rows) {
      await createAndVerify(authenticatedPage, data, String(data.memberFName), 'full');
    }
  });

});

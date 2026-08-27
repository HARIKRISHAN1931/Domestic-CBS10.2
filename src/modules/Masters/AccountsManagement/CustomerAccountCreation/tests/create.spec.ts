import * as path from 'path';
import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { AccountOpeningPage } from '../src/AccountOpeningPage';
import { AccountOpeningBuilder, AccountOpeningValidator } from '../src/AccountOpeningBuilder';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { AccountOpeningFormData } from '../src/AccountOpeningPage';

const DATA_FILE = path.resolve(__dirname, '../data/CustomerAccountCreation.xlsx');
const NAV       = (page: any) => new MenuNavigation(page).navigate('Masters', 'accountmgmt', 'PRDACNOMST');

const createAndVerify = async (page: any, data: AccountOpeningFormData, label: string) => {
  const screen    = new AccountOpeningPage(page);
  const validator = new AccountOpeningValidator();

  await test.step(`[${label}] Navigate`,  () => NAV(page));
  await test.step(`[${label}] Open form`, () => screen.openCreateForm());
  const toast = await test.step(`[${label}] Create`, () => screen.create(data));
  console.log(`[${label}] Toast: ${toast}`);
  validator.validateCreated(toast);

  await test.step(`[${label}] Verify pending grid`, async () => {
    await screen.switchToPendingTab();
    expect(
      await screen.isRecordInPendingGrid(data.customerNumber!),
      `${data.customerNumber} must appear in pending grid`
    ).toBe(true);
  });
};

test.describe('Customer Account Creation (PRDACNOMST) > Create', () => {

  test('should open Customer Account Creation screen via menu @smoke', async ({ authenticatedPage }) => {
    await NAV(authenticatedPage);
    const screen = new AccountOpeningPage(authenticatedPage);
    await expect(authenticatedPage.locator('a.button.add, button.button.add, #btnAddAccount').first())
      .toBeVisible({ timeout: 15_000 });
    console.log(`[SMOKE] Menu PRDACNOMST opened: ${screen.pageTitle}`);
  });

  test('should create account from Excel data @sanity @regression', async ({ authenticatedPage }) => {
    test.setTimeout(300_000);
    const builder = new AccountOpeningBuilder();
    const rows = await ExcelHelper.readSheet<Record<string, unknown>>(DATA_FILE, 'Create');
    for (const row of rows) {
      const data = builder.from(row);
      if (!data.customerNumber) continue;
      const tag = String(row.testTag ?? '');
      await createAndVerify(authenticatedPage, data, `[${tag}] ${data.customerNumber}`);
    }
  });

});

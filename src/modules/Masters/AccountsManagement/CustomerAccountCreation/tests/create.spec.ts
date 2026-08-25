import * as path from 'path';
import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { AccountOpeningPage } from '../src/AccountOpeningPage';
import { AccountOpeningBuilder, AccountOpeningValidator } from '../src/AccountOpeningBuilder';
import { AccountOpeningRepository } from '../src/AccountOpeningRepository';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { AccountOpeningFormData } from '../src/AccountOpeningPage';

const DATA_FILE = path.resolve(__dirname, '../data/CustomerAccountCreation.xlsx');
const NAV       = (page: any) => new MenuNavigation(page).navigate('Masters', 'accountsMgmt', 'PRDACNOMST');

const createAndVerify = async (page: any, data: AccountOpeningFormData, label: string) => {
  const screen    = new AccountOpeningPage(page);
  const validator = new AccountOpeningValidator();

  await test.step(`[${label}] Navigate`,  () => NAV(page));
  await test.step(`[${label}] Open form`, () => screen.openCreateForm());
  await test.step(`[${label}] Fill form`, () => screen.fillForm(data));
  const toast = await test.step(`[${label}] Save`, () => screen.save());
  console.log(`[${label}] Toast: ${toast}`);
  validator.validateCreated(toast);

  await test.step(`[${label}] Verify pending grid`, async () => {
    await screen.switchToPendingTab();
    expect(
      await screen.isRecordInPendingGrid(data.customerId!),
      `${data.customerId} must appear in pending grid`
    ).toBe(true);
  });
};

test.describe('Customer Account Creation (PRDACNOMST) > Create', () => {

  test('should create savings account @smoke @sanity', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const data = new AccountOpeningBuilder().build();
    await createAndVerify(authenticatedPage, data, `SAVINGS-${data.customerId}`);
  });

  test('should create account from Excel data @regression', async ({ authenticatedPage }) => {
    test.setTimeout(300_000);
    const rows = await ExcelHelper.readSheet<AccountOpeningFormData>(DATA_FILE, 'Create');
    for (const row of rows) {
      if (!row.customerId) continue;
      await createAndVerify(authenticatedPage, row, `EXCEL-${row.customerId}`);
    }
  });

  test('should create joint account @regression', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const data = new AccountOpeningBuilder().buildJointAccount();
    await createAndVerify(authenticatedPage, data, `JOINT-${data.customerId}`);
  });

});

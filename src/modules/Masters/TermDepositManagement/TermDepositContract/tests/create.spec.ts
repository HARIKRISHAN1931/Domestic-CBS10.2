import * as path from 'path';
import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { TermDepositPage, TDContractData } from '../src/TermDepositPage';
import { TermDepositBuilder, TermDepositValidator } from '../src/TermDepositBuilder';
import { TermDepositRepository } from '../src/TermDepositRepository';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

const DATA_FILE = path.resolve(__dirname, '../data/TermDepositContract.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'td', 'TERMDEPOSITCONTRACTD');

const createAndVerify = async (page: any, data: TDContractData, label: string) => {
  const screen    = new TermDepositPage(page);
  const validator = new TermDepositValidator();

  await test.step(`[${label}] Navigate`,  () => NAV(page));
  await test.step(`[${label}] Open form`, () => screen.openCreateForm());
  await test.step(`[${label}] Fill form`, () => screen.fillForm(data));
  const toast = await test.step(`[${label}] Save`, () => screen.save());
  console.log(`[${label}] Toast: ${toast}`);
  validator.validateCreated(toast);

  await test.step(`[${label}] Verify pending grid`, async () => {
    await screen.switchToPendingTab();
    expect(
      await screen.isRecordInPendingGrid(data.customerCode),
      `${data.customerCode} must appear in pending grid`
    ).toBe(true);
  });
};

test.describe('Term Deposit Contract > Create', () => {

  test('should create FD Individual @sanity @sanity', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const data = new TermDepositBuilder().buildSanity();
    await createAndVerify(authenticatedPage, data, 'FD-INDIVIDUAL');
  });

  test('should create FD with nominee @regression', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const data = new TermDepositBuilder().buildWithNominee();
    await createAndVerify(authenticatedPage, data, 'FD-NOMINEE');
  });

  test('should create RD Individual @regression', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const data = new TermDepositBuilder().buildRD();
    await createAndVerify(authenticatedPage, data, 'RD-INDIVIDUAL');
  });

  test('should create FD with auto renew @regression', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const data = new TermDepositBuilder().buildAutoRenew();
    await createAndVerify(authenticatedPage, data, 'FD-AUTORENEW');
  });

  test('should create TD from Excel data @regression', async ({ authenticatedPage }) => {
    test.setTimeout(300_000);
    const rows = await ExcelHelper.readSheet<TDContractData>(DATA_FILE, 'Create');
    for (const row of rows) {
      if (!row.customerCode || !row.productCode) continue;
      await createAndVerify(authenticatedPage, row, `EXCEL-${row.productCode}`);
    }
  });

});

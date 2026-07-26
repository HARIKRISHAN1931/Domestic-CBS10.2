import { test, expect } from '../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../common/helpers/ExcelHelper';
import { TermDepositPage, TDContractData } from './TermDepositPage';
import { TermDepositRepository } from './TermDepositRepository';
import { TermDepositValidator } from './TermDepositValidator';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Deposit/TermDeposit/term-deposit.data.xlsx');

test.describe('Term Deposit Contract @smoke @regression', () => {

  test('should create TD contract successfully', async ({ page, db }) => {
    test.setTimeout(180_000);
    const rows = await ExcelHelper.readSheet<TDContractData>(DATA_FILE, 'Create');
    const data = rows[0];

    const screen    = new TermDepositPage(page);
    const repo      = new TermDepositRepository(db);
    const validator = new TermDepositValidator();

    await test.step('Open create form', async () => { await screen.openCreateForm(); });

    const toast = await test.step('Fill and save', async () => screen.create(data));
    validator.validateCreated(toast);

    await test.step('DB: verify contract in D020004', async () => {
      const contracts = await repo.findContractsByCustomer(data.customerCode);
      expect(contracts.length, 'At least one TD contract must exist for customer').toBeGreaterThan(0);
      validator.validateDbRecord(contracts[0], contracts[0].prdAcctId);
    });
  });

  test('should fail without mandatory fields @regression', async ({ page }) => {
    test.setTimeout(60_000);
    const screen = new TermDepositPage(page);
    await screen.openCreateForm();
    await page.locator('#saveParamDetails, #btnSave').first().click({ force: true }).catch(() => {});
    const errToast = page.locator('.toast-messages .msg-toast.msg-error em');
    await expect(errToast.first()).toBeVisible({ timeout: 10_000 });
  });

});

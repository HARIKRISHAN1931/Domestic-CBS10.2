import { test, expect } from '../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../common/helpers/ExcelHelper';
import { LoanMastersPage, LoanCollateralData, LoanSecurityData, LoanSuretyData } from './LoanMastersPage';
import { LoanMastersValidator } from './LoanMastersBuilder';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Loans/LoanMasters/loan-masters.data.xlsx');

test.describe('Loan Masters @smoke @regression', () => {

  test('should create loan collateral @smoke', async ({ page }) => {
    test.setTimeout(120_000);
    const rows = await ExcelHelper.readSheet<LoanCollateralData>(DATA_FILE, 'Collateral');
    const data = rows[0];
    const screen    = new LoanMastersPage(page);
    const validator = new LoanMastersValidator();

    await test.step('Open create form', async () => { await screen.openCreateForm(); });
    await test.step('Fill collateral form', async () => { await screen.fillCollateralForm(data); });
    const toast = await test.step('Save', async () => screen.save());
    validator.validateCreated(toast);
  });

  test('should create loan security @smoke', async ({ page }) => {
    test.setTimeout(120_000);
    const rows = await ExcelHelper.readSheet<LoanSecurityData>(DATA_FILE, 'Security');
    const data = rows[0];
    const screen    = new LoanMastersPage(page);
    const validator = new LoanMastersValidator();

    await test.step('Open create form', async () => { await screen.openCreateForm(); });
    await test.step('Fill security form', async () => { await screen.fillSecurityForm(data); });
    const toast = await test.step('Save', async () => screen.save());
    validator.validateCreated(toast);
  });

  test('should create loan surety @smoke', async ({ page }) => {
    test.setTimeout(120_000);
    const rows = await ExcelHelper.readSheet<LoanSuretyData>(DATA_FILE, 'Surety');
    const data = rows[0];
    const screen    = new LoanMastersPage(page);
    const validator = new LoanMastersValidator();

    await test.step('Open create form', async () => { await screen.openCreateForm(); });
    await test.step('Fill surety form', async () => { await screen.fillSuretyForm(data); });
    const toast = await test.step('Save', async () => screen.save());
    validator.validateCreated(toast);
  });

});

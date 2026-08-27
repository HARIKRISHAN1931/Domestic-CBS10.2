import * as path from 'path';
import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { TermDepositPage } from '../src/TermDepositPage';
import { TermDepositValidator } from '../src/TermDepositBuilder';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

const DATA_FILE = path.resolve(__dirname, '../data/TermDepositContract.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'td', 'TERMDEPOSITCONTRACTD');

test.describe('Term Deposit Contract > Authorize', () => {

  test('should approve pending TD contract @sanity @regression', async ({ checkerAuthenticatedPage }) => {
    test.setTimeout(120_000);
    const rows = await ExcelHelper.readSheet<Record<string, string>>(DATA_FILE, 'Authorize');
    const row  = rows[0];
    if (!row?.customerCode) test.skip(true, 'No Authorize data in Excel');

    const screen    = new TermDepositPage(checkerAuthenticatedPage);
    const validator = new TermDepositValidator();

    await NAV(checkerAuthenticatedPage);
    await screen.switchToPendingTab();
    const toast = await screen.approve(row.customerCode);
    console.log(`Approve toast: ${toast}`);
    validator.validateApproved(toast);
  });

  test('should reject pending TD contract @regression', async ({ checkerAuthenticatedPage }) => {
    test.setTimeout(120_000);
    const rows = await ExcelHelper.readSheet<Record<string, string>>(DATA_FILE, 'Authorize');
    const row  = rows[1];
    if (!row?.customerCode) test.skip(true, 'No second Authorize row in Excel');

    const screen    = new TermDepositPage(checkerAuthenticatedPage);
    const validator = new TermDepositValidator();

    await NAV(checkerAuthenticatedPage);
    await screen.switchToPendingTab();
    const toast = await screen.reject(row.customerCode, 'Rejected by automation test');
    console.log(`Reject toast: ${toast}`);
    validator.validateRejected(toast);
  });

});

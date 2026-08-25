import * as path from 'path';
import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { AccountOpeningPage } from '../src/AccountOpeningPage';
import { AccountOpeningValidator } from '../src/AccountOpeningBuilder';
import { AccountOpeningRepository } from '../src/AccountOpeningRepository';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

const DATA_FILE = path.resolve(__dirname, '../data/CustomerAccountCreation.xlsx');
const NAV       = (page: any) => new MenuNavigation(page).navigate('Masters', 'AccountsManagement', 'PRDACNOMST');

test.describe('Customer Account Creation (PRDACNOMST) > Authorize', () => {

  test('should approve pending account @regression', async ({ authenticatedPage, checkerAuthenticatedPage }) => {
    test.setTimeout(120_000);
    const rows = await ExcelHelper.readSheet<Record<string, string>>(DATA_FILE, 'Authorize');
    const row  = rows[0];
    if (!row?.customerId) test.skip(true, 'No Authorize data in Excel');

    const screen    = new AccountOpeningPage(checkerAuthenticatedPage);
    const validator = new AccountOpeningValidator();

    await NAV(checkerAuthenticatedPage);
    await screen.switchToPendingTab();
    const toast = await screen.approve(row.customerId);
    console.log(`Approve toast: ${toast}`);
    validator.validateApproved(toast);
  });

  test('should reject pending account @regression', async ({ checkerAuthenticatedPage }) => {
    test.setTimeout(120_000);
    const rows = await ExcelHelper.readSheet<Record<string, string>>(DATA_FILE, 'Authorize');
    const row  = rows[1];
    if (!row?.customerId) test.skip(true, 'No second Authorize row in Excel');

    const screen    = new AccountOpeningPage(checkerAuthenticatedPage);
    const validator = new AccountOpeningValidator();

    await NAV(checkerAuthenticatedPage);
    await screen.switchToPendingTab();
    const toast = await screen.reject(row.customerId, 'Rejected by automation test');
    console.log(`Reject toast: ${toast}`);
    validator.validateRejected(toast);
  });

});

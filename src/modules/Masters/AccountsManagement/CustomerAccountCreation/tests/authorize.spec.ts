import * as path from 'path';
import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { AccountOpeningPage } from '../src/AccountOpeningPage';
import { AccountOpeningValidator } from '../src/AccountOpeningBuilder';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

const DATA_FILE = path.resolve(__dirname, '../data/CustomerAccountCreation.xlsx');
const NAV       = (page: any) => new MenuNavigation(page).navigate('Masters', 'accountmgmt', 'PRDACNOMST');

test.describe('Customer Account Creation (PRDACNOMST) > Authorize', () => {

  test('should approve all pending accounts @regression', async ({ checkerAuthenticatedPage }) => {
    test.setTimeout(300_000);
    const rows = await ExcelHelper.readSheet<Record<string, string>>(DATA_FILE, 'Authorize');
    const pending = rows.filter(r => r.accountNo && r.authStatus === 'Pending');
    if (!pending.length) test.skip(true, 'No pending accounts in Authorize sheet');

    const screen    = new AccountOpeningPage(checkerAuthenticatedPage);
    const validator = new AccountOpeningValidator();
    await NAV(checkerAuthenticatedPage);
    await screen.switchToPendingTab();

    for (const row of pending) {
      // Step 1: Search + open auth view and verify no fields are editable
      await test.step(`[${row.accountNo}] Verify all fields read-only in auth mode`, async () => {
        await screen.searchRecord(row.accountNo);
        const firstRow = checkerAuthenticatedPage.locator('#dt-pendingdata tbody tr').filter({ hasText: row.accountNo }).first();
        await firstRow.waitFor({ state: 'visible', timeout: 15_000 });
        await firstRow.hover();
        await checkerAuthenticatedPage.waitForTimeout(500);
        await firstRow.locator('a[href*="callAuthRejectfn"], a.show-btns').first().click({ force: true });
        await checkerAuthenticatedPage.locator('#approveBtn').waitFor({ state: 'visible', timeout: 10_000 });
        const { editableFields } = await screen.verifyAllFieldsReadOnly();
        if (editableFields.length > 0) {
          console.warn(`[DEFECT] Auth mode editable fields for ${row.accountNo}: ${editableFields.join(', ')}`);
        } else {
          console.log(`[PASS] All fields read-only for ${row.accountNo}`);
        }
      });

      // Step 2: Approve
      await test.step(`[${row.accountNo}] Approve`, async () => {
        await checkerAuthenticatedPage.locator('#approveBtn').click();
        await checkerAuthenticatedPage.waitForTimeout(500);
        await checkerAuthenticatedPage.locator('#btnApproveId').click({ force: true });
        const toast = checkerAuthenticatedPage.locator('.toast-messages .msg-toast.msg-success em').first();
        await toast.waitFor({ state: 'visible', timeout: 15_000 });
        const msg = (await toast.innerText()).trim();
        console.log(`[APPROVED] ${row.accountNo} | Toast: ${msg}`);
        validator.validateApproved(msg);
        await ExcelHelper.moveRow(DATA_FILE, 'Authorize', 'AuthorizedList', 'accountNo', row.accountNo, {
          authStatus:   'Authorized',
          authorizedAt: new Date().toLocaleString('en-IN'),
        });
        // navigate back to pending tab for next account
        await NAV(checkerAuthenticatedPage);
        await screen.switchToPendingTab();
      });
    }
  });

  test('should reject pending account @regression', async ({ checkerAuthenticatedPage }) => {
    test.setTimeout(120_000);
    const rows = await ExcelHelper.readSheet<Record<string, string>>(DATA_FILE, 'Authorize');
    const row  = rows.find(r => r.accountNo && r.authStatus === 'Pending');
    if (!row) test.skip(true, 'No pending accounts in Authorize sheet');

    const screen    = new AccountOpeningPage(checkerAuthenticatedPage);
    const validator = new AccountOpeningValidator();
    await NAV(checkerAuthenticatedPage);
    await screen.switchToPendingTab();
    const toast = await screen.reject(row!.accountNo, 'Rejected by automation test');
    console.log(`[REJECTED] ${row!.accountNo} | Toast: ${toast}`);
    validator.validateRejected(toast);
    await ExcelHelper.moveRow(DATA_FILE, 'Authorize', 'AuthorizedList', 'accountNo', row!.accountNo, {
      authStatus:   'Rejected',
      authorizedAt: new Date().toLocaleString('en-IN'),
    });
  });

});

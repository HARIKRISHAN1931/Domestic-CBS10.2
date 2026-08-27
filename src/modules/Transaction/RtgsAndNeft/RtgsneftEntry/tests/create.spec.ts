import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import { RtgsNeftEntryPage, RtgsNeftEntryData } from '../src/RtgsNeftEntryPage';
import { RtgsNeftEntryValidator } from '../src/RtgsNeftEntryBuilder';
import { Page } from '@playwright/test';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Transaction/RtgsAndNeft/RtgsneftEntry/data/RtgsneftEntry.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Transaction', 'RTGSTrxn', 'TRANSACTIONMST');

test.describe('RTGS/NEFT Entry — Create @sanity @regression', () => {

  test('should create NEFT transaction successfully', async ({ authenticatedPage }: { authenticatedPage: Page }) => {
    test.setTimeout(120_000);
    const rows      = await ExcelHelper.readSheet<RtgsNeftEntryData>(DATA_FILE, 'Create');
    const data      = rows[0];
    const screen    = new RtgsNeftEntryPage(authenticatedPage);
    const validator = new RtgsNeftEntryValidator();

    await test.step('Navigate to RTGS/NEFT Entry', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    await test.step('Fill form', () => screen.fillForm(data));
    const toast = await test.step('Save', () => screen.save());
    validator.validateCreated(toast);

    SharedDataStore.set('RtgsNeftEntry.searchKey', data.rtgsNeftAcctId ?? data.ordDesc1 ?? data.benDesc1 ?? '');

    await test.step('Verify in pending grid', async () => {
      await NAV(authenticatedPage);
      await (screen as any).grid.switchTab('pending');
      const searchKey = SharedDataStore.get<string>('RtgsNeftEntry.searchKey') ?? '';
      if (searchKey) {
        const row = authenticatedPage.locator('#dt-pendingdata tbody tr').filter({ hasText: searchKey });
        await expect(row.first()).toBeVisible({ timeout: 10_000 });
      }
    });
  });

  test('should create RTGS transaction successfully', async ({ authenticatedPage }: { authenticatedPage: Page }) => {
    test.setTimeout(120_000);
    const rows      = await ExcelHelper.readSheet<RtgsNeftEntryData>(DATA_FILE, 'Create');
    const data      = rows.length > 1 ? rows[1] : { ...rows[0], msgTrfType: '1', msgSType: 'R41', valueAmt_txt: '200000' };
    const screen    = new RtgsNeftEntryPage(authenticatedPage);
    const validator = new RtgsNeftEntryValidator();

    await test.step('Navigate to RTGS/NEFT Entry', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    await test.step('Fill RTGS form', () => screen.fillForm(data));
    const toast = await test.step('Save', () => screen.save());
    validator.validateCreated(toast);
  });

});

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

test.describe('RTGS/NEFT Entry — Authorize @regression', () => {

  test('should authorize RTGS/NEFT transaction', async ({ checkerAuthenticatedPage }: { checkerAuthenticatedPage: Page }) => {
    test.setTimeout(120_000);
    const rows      = await ExcelHelper.readSheet<RtgsNeftEntryData>(DATA_FILE, 'Auth');
    const data      = rows[0];
    const searchKey = SharedDataStore.get<string>('RtgsNeftEntry.searchKey') ?? data.searchKey!;
    const screen    = new RtgsNeftEntryPage(checkerAuthenticatedPage);
    const validator = new RtgsNeftEntryValidator();

    await test.step('Navigate', () => NAV(checkerAuthenticatedPage));
    const toast = await test.step(`Approve [${searchKey}]`, () => screen.approve(searchKey, data.tab as string ?? 'pending'));
    validator.validateApproved(toast);

    await test.step('Verify in authorized grid', async () => {
      await NAV(checkerAuthenticatedPage);
      await (screen as any).grid.switchTab('authorized');
      const row = checkerAuthenticatedPage.locator('#dt-authdata tbody tr').filter({ hasText: searchKey });
      await expect(row.first()).toBeVisible({ timeout: 10_000 });
    });
  });

});

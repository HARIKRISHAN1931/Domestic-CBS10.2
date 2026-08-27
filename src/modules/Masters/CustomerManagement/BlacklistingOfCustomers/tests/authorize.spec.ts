import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import { BlacklistingOfCustomersPage, BlacklistingOfCustomersData } from '../src/BlacklistingOfCustomersPage';
import { BlacklistingOfCustomersValidator } from '../src/BlacklistingOfCustomersBuilder';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Masters/CustomerManagement/BlacklistingOfCustomers/data/BlacklistingOfCustomers.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'customermgmt', 'BLACKLISTINGOFCUSTOMERS');

test.describe('Blacklisting Of Customers — Authorize @regression', () => {

  test('should authorize blacklist record', async ({ checkerAuthenticatedPage }) => {
    test.setTimeout(120_000);
    const rows      = await ExcelHelper.readSheet<BlacklistingOfCustomersData>(DATA_FILE, 'Auth');
    const data      = rows[0];
    const searchKey = SharedDataStore.get<string>('BlacklistingOfCustomers.searchKey') ?? data.searchKey!;
    const screen    = new BlacklistingOfCustomersPage(checkerAuthenticatedPage);
    const validator = new BlacklistingOfCustomersValidator();

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

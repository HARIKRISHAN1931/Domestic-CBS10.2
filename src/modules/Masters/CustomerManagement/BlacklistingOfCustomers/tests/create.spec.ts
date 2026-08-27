import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import { BlacklistingOfCustomersPage, BlacklistingOfCustomersData } from '../src/BlacklistingOfCustomersPage';
import { BlacklistingOfCustomersValidator } from '../src/BlacklistingOfCustomersBuilder';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Masters/CustomerManagement/BlacklistingOfCustomers/data/BlacklistingOfCustomers.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'customermgmt', 'BLACKLISTINGOFCUSTOMERS');

test.describe('Blacklisting Of Customers — Create @sanity @regression', () => {

  test('should blacklist customer successfully', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const rows      = await ExcelHelper.readSheet<BlacklistingOfCustomersData>(DATA_FILE, 'Create');
    const data      = rows[0];
    const screen    = new BlacklistingOfCustomersPage(authenticatedPage);
    const validator = new BlacklistingOfCustomersValidator();

    await test.step('Navigate to Blacklisting Of Customers', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    await test.step('Fill form', () => screen.fillForm(data));
    const toast = await test.step('Save', () => screen.save());
    validator.validateCreated(toast);

    SharedDataStore.set('BlacklistingOfCustomers.searchKey', data.custNo!);

    await test.step('Verify in pending grid', async () => {
      await NAV(authenticatedPage);
      await (screen as any).grid.switchTab('pending');
      const row = authenticatedPage.locator('#dt-pendingdata tbody tr').filter({ hasText: data.custNo! });
      await expect(row.first()).toBeVisible({ timeout: 10_000 });
    });
  });

});

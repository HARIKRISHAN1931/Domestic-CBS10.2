import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { BlacklistingOfCustomersPage, BlacklistingOfCustomersData } from '../src/BlacklistingOfCustomersPage';
import { BlacklistingOfCustomersValidator } from '../src/BlacklistingOfCustomersBuilder';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Masters/CustomerManagement/BlacklistingOfCustomers/data/BlacklistingOfCustomers.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'customermgmt', 'BLACKLISTINGOFCUSTOMERS');

test.describe('Blacklisting Of Customers — Update @regression', () => {

  test('should update blacklist record', async ({ authenticatedPage }) => {
    test.setTimeout(180_000);
    const rows      = await ExcelHelper.readSheet<BlacklistingOfCustomersData>(DATA_FILE, 'Update');
    const data      = rows[0];
    const screen    = new BlacklistingOfCustomersPage(authenticatedPage);
    const validator = new BlacklistingOfCustomersValidator();

    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Search and open edit form', async () => {
      await (screen as any).grid.searchAndEdit(data.searchKey!, (data.tab as any) ?? 'authorized');
    });
    await test.step('Fill updated fields', () => screen.fillForm(data));
    const toast = await test.step('Save', () => screen.save());
    validator.validateUpdated(toast);
  });

});

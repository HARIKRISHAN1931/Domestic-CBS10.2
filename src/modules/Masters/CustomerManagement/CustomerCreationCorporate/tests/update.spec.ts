import * as path from 'path';
import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import { CorporateCustomerPage, CorporateCustomerData, CorporateCustomerValidator } from '../src/index';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Customer/Corporate/CorporateCustomer/data/corporate-customer.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'customermgmt', 'CORPCUSTOMER');

test.describe('Corporate Customer — Update @regression', () => {

  test('should update corporate customer', async ({ authenticatedPage }) => {
    test.setTimeout(240_000);
    const rows      = await ExcelHelper.readSheet<CorporateCustomerData>(DATA_FILE, 'Update');
    const data      = rows[0];
    const searchKey = SharedDataStore.get<string>('CorporateCustomer.searchKey') ?? String(data.memberFName);
    const screen    = new CorporateCustomerPage(authenticatedPage);
    const validator = new CorporateCustomerValidator();

    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Switch to authorized tab', () => screen.switchToAuthorizedTab());
    await test.step('Search record', () => screen.searchAuthorizedRecord(searchKey));

    // Open edit — click the edit icon on the matching row
    await test.step('Open edit form', async () => {
      const row = authenticatedPage.locator('#dt-authdata tbody tr').filter({ hasText: searchKey }).first();
      await row.waitFor({ state: 'visible', timeout: 10_000 });
      await row.locator('a.edit-btn, a[title="Edit"], td a').first().click({ force: true });
      await authenticatedPage.waitForTimeout(2_000);
    });

    await test.step('Fill updated fields', () => screen.fillForm(data, 'full'));
    const toast = await test.step('Save', () => screen.save());
    validator.validateUpdated(toast);
  });

});

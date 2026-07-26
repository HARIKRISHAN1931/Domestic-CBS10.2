import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { CustomerCreationPage, CustomerData } from '../src/CustomerCreationPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Masters/CustomerManagement/CustomerCreationretail/data/customer-creation.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'customermgmt', 'CUSTOMER');

test.describe('Customer Creation — Update @regression', () => {

  test('should update customer', async ({ authenticatedPage }) => {
    test.setTimeout(240_000);
    const rows   = await ExcelHelper.readSheet<CustomerData>(DATA_FILE, 'Update');
    const data   = rows[0];
    const screen = new CustomerCreationPage(authenticatedPage);

    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Search and open edit form', () => screen.grid.searchAndEdit(data.searchKey!, (data.tab as any) || 'authorized'));
    await test.step('Tab 1 — Basic Details',      () => screen.fillBasicDetails(data));
    await test.step('Tab 2 — Contact Details',    () => screen.fillContactDetails(data));
    await test.step('Tab 3 — Additional Details', () => screen.fillAdditionalDetails(data));

    const toast = await test.step('Save', () => screen.save());
    expect(toast).toBeTruthy();
  });

});

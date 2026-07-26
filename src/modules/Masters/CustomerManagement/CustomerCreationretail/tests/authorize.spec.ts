import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { CustomerCreationPage, CustomerData } from '../src/CustomerCreationPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Masters/CustomerManagement/CustomerCreationretail/data/customer-creation.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'customermgmt', 'CUSTOMER');

test.describe('Customer Creation — Authorize @regression', () => {

  test('should authorize customer', async ({ checkerAuthenticatedPage }) => {
    const rows      = await ExcelHelper.readSheet<CustomerData>(DATA_FILE, 'Auth');
    const data      = rows[0];
    const searchKey = SharedDataStore.get<string>('CustomerCreation.searchKey') ?? data.searchKey!;
    const screen    = new CustomerCreationPage(checkerAuthenticatedPage);

    await test.step('Navigate', () => NAV(checkerAuthenticatedPage));
    const toast = await test.step(`Approve [${searchKey}]`, () => screen.approve(searchKey, data.tab as string));
    expect(toast).toBeTruthy();

    await test.step('Verify in Authorized tab', async () => {
      await NAV(checkerAuthenticatedPage);
      await (screen as any).grid.switchTab('authorized');
      const row = checkerAuthenticatedPage.locator('#dt-authdata tbody tr').filter({ hasText: searchKey });
      await expect(row.first()).toBeVisible({ timeout: 10_000 });
    });
  });

});

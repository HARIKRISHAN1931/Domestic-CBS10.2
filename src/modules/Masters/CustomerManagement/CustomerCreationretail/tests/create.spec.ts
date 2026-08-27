import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { CustomerCreationPage, CustomerData } from '../src/CustomerCreationPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Masters/CustomerManagement/CustomerCreationretail/data/customer-creation.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'customermgmt', 'CUSTOMER');

test.describe('Customer Creation Retail @sanity @regression', () => {

  test('should create customer successfully', async ({ authenticatedPage }) => {
    test.setTimeout(180_000);
    const rows   = await ExcelHelper.readSheet<CustomerData>(DATA_FILE, 'Create');
    const data   = rows[0];
    const screen = new CustomerCreationPage(authenticatedPage);

    await test.step('Navigate to Customer Creation', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    await test.step('Tab 1 — Basic Details',      () => screen.fillBasicDetails(data));
    await test.step('Tab 2 — Contact Details',    () => screen.fillContactDetails(data));
    await test.step('Tab 3 — Additional Details', () => screen.fillAdditionalDetails(data));
    await test.step('Tab 4 — Document Details',   () => screen.fillDocumentDetails(data));

    await test.step('Debug — inspect doc tab DOM', async () => {
      const btnIds = await authenticatedPage.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button, input[type="button"], a.btn'));
        return btns.map((b: any) => ({ id: b.id, text: b.innerText?.trim(), cls: b.className }));
      });
      console.log('BUTTONS ON PAGE:', JSON.stringify(btnIds, null, 2));
      const docGrid = await authenticatedPage.evaluate(() => {
        const tbl = document.querySelector('#docDetailsTable, #documentTable, table');
        return tbl ? tbl.innerHTML.substring(0, 500) : 'NO TABLE FOUND';
      });
      console.log('DOC GRID:', docGrid);
      const proofVal = await authenticatedPage.evaluate(() => (document.querySelector('#proofType') as any)?.value);
      const docTypeVal = await authenticatedPage.evaluate(() => (document.querySelector('#docType') as any)?.value);
      console.log('proofType value:', proofVal, '| docType value:', docTypeVal);
    });

    const toast = await test.step('Save', () => screen.save());
    expect(toast).toBeTruthy();

    const custNo = toast.match(/(\d{5,})/)?.[1] ?? `${data.memberFName} ${data.memberLName}`;
    SharedDataStore.set('CustomerCreation.searchKey', custNo);

    await test.step('Verify in Pending tab', async () => {
      await NAV(authenticatedPage);
      await (screen as any).grid.switchTab('pending');
      const row = authenticatedPage.locator('#dt-pendingdata tbody tr').filter({ hasText: data.memberFName });
      await expect(row.first()).toBeVisible({ timeout: 10_000 });
    });
  });

});

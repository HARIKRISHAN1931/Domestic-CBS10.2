import * as path from 'path';
import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import { CorporateCustomerPage, CorporateCustomerData, CorporateCustomerValidator } from '../src/index';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Masters/CustomerManagement/CustomerCreationCorporate/data/corporate-customer.data.xlsx');
const DOC_FILE  = path.join(process.cwd(), 'src/modules/Masters/CustomerManagement/CustomerCreationCorporate/data/test-doc.png');
const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'customermgmt', 'CORPCUSTOMER');

test.describe('Corporate Customer Creation @sanity @regression', () => {

  test('should create corporate customer successfully', async ({ authenticatedPage }) => {
    test.setTimeout(180_000);
    const rows      = await ExcelHelper.readSheet<CorporateCustomerData>(DATA_FILE, 'Create');
    const data      = { ...rows[0], docUpload: DOC_FILE };
    const screen    = new CorporateCustomerPage(authenticatedPage);
    const validator = new CorporateCustomerValidator();

    await test.step('Navigate to Corporate Customer', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    await test.step('Fill form', () => screen.fillForm(data, 'full'));
    const toast = await test.step('Save', () => screen.save());
    validator.validateCreated(toast);

    SharedDataStore.set('CorporateCustomer.searchKey', String(data.memberFName));

    await test.step('Verify in pending grid', async () => {
      await screen.switchToPendingTab();
      await screen.searchPendingRecord(String(data.memberFName));
      expect(
        await screen.isRecordInPendingGrid(String(data.memberFName)),
        `${data.memberFName} must appear in pending grid`
      ).toBe(true);
    });
  });

});

import * as path from 'path';
import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import { CorporateCustomerPage, CorporateCustomerData, CorporateCustomerValidator } from '../src/index';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Customer/Corporate/CorporateCustomer/data/corporate-customer.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'customermgmt', 'CORPCUSTOMER');

test.describe('Corporate Customer — Authorize @regression', () => {

  test('should authorize corporate customer', async ({ checkerAuthenticatedPage }) => {
    test.setTimeout(120_000);
    const rows      = await ExcelHelper.readSheet<CorporateCustomerData>(DATA_FILE, 'Auth');
    const data      = rows[0];
    const searchKey = SharedDataStore.get<string>('CorporateCustomer.searchKey') ?? String(data.memberFName);
    const screen    = new CorporateCustomerPage(checkerAuthenticatedPage);
    const validator = new CorporateCustomerValidator();

    await test.step('Navigate', () => NAV(checkerAuthenticatedPage));
    await test.step('Switch to pending', () => screen.switchToPendingTab());
    await test.step('Search pending record', () => screen.searchPendingRecord(searchKey));

    const toast = await test.step(`Approve [${searchKey}]`, () => screen.approve(searchKey));
    validator.validateApproved(toast);

    await test.step('Verify in authorized grid', async () => {
      await screen.switchToAuthorizedTab();
      await screen.searchAuthorizedRecord(searchKey);
      expect(
        await screen.isRecordInAuthorizedGrid(searchKey),
        `${searchKey} must appear in authorized grid`
      ).toBe(true);
    });
  });

});

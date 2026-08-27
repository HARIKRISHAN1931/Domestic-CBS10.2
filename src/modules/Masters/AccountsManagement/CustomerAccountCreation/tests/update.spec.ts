import * as path from 'path';
import { test } from '../../../../../framework/fixtures/fixtures';
import { AccountOpeningPage } from '../src/AccountOpeningPage';
import { AccountOpeningBuilder, AccountOpeningValidator } from '../src/AccountOpeningBuilder';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { AccountOpeningFormData } from '../src/AccountOpeningPage';

const DATA_FILE = path.resolve(__dirname, '../data/CustomerAccountCreation.xlsx');
const NAV       = (page: any) => new MenuNavigation(page).navigate('Masters', 'accountmgmt', 'PRDACNOMST');

test.describe('Customer Account Creation (PRDACNOMST) > Update', () => {

  test('should update account from Excel data @regression', async ({ authenticatedPage }) => {
    test.setTimeout(300_000);
    const rows = await ExcelHelper.readSheet<AccountOpeningFormData>(DATA_FILE, 'Update');
    for (const row of rows) {
      if (!row.customerNumber) continue;
      const screen    = new AccountOpeningPage(authenticatedPage);
      const validator = new AccountOpeningValidator();
      await NAV(authenticatedPage);
      const toast = await screen.update(row.customerNumber as string, row);
      console.log(`Update toast: ${toast}`);
      validator.validateUpdated(toast);
    }
  });

});

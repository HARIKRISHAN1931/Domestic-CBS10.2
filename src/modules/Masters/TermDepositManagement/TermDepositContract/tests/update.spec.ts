import * as path from 'path';
import { test } from '../../../../../framework/fixtures/fixtures';
import { TermDepositPage, TDContractData } from '../src/TermDepositPage';
import { TermDepositValidator } from '../src/TermDepositBuilder';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

const DATA_FILE = path.resolve(__dirname, '../data/TermDepositContract.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'td', 'TERMDEPOSITCONTRACTD');

test.describe('Term Deposit Contract > Update', () => {

  test('should update TD contract modeOfOprn @regression', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const rows = await ExcelHelper.readSheet<TDContractData>(DATA_FILE, 'Update');
    const row  = rows[0];
    if (!row?.customerCode) test.skip(true, 'No Update data in Excel');

    const screen    = new TermDepositPage(authenticatedPage);
    const validator = new TermDepositValidator();

    await NAV(authenticatedPage);
    const toast = await screen.update(row.customerCode, row);
    console.log(`Update toast: ${toast}`);
    validator.validateUpdated(toast);
  });

  test('should update all TD contracts from Excel @regression', async ({ authenticatedPage }) => {
    test.setTimeout(300_000);
    const rows = await ExcelHelper.readSheet<TDContractData>(DATA_FILE, 'Update');
    for (const row of rows) {
      if (!row.customerCode) continue;
      const screen    = new TermDepositPage(authenticatedPage);
      const validator = new TermDepositValidator();
      await NAV(authenticatedPage);
      const toast = await screen.update(row.customerCode, row);
      validator.validateUpdated(toast);
    }
  });

});

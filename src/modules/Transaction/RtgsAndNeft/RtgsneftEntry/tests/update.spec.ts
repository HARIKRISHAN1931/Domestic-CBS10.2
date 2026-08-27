import { test } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { RtgsNeftEntryPage, RtgsNeftEntryData } from '../src/RtgsNeftEntryPage';
import { RtgsNeftEntryValidator } from '../src/RtgsNeftEntryBuilder';
import { Page } from '@playwright/test';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Transaction/RtgsAndNeft/RtgsneftEntry/data/RtgsneftEntry.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Transaction', 'RTGSTrxn', 'TRANSACTIONMST');

test.describe('RTGS/NEFT Entry — Update @regression', () => {

  test('should update RTGS/NEFT transaction', async ({ authenticatedPage }: { authenticatedPage: Page }) => {
    test.setTimeout(180_000);
    const rows      = await ExcelHelper.readSheet<RtgsNeftEntryData>(DATA_FILE, 'Update');
    const data      = rows[0];
    const screen    = new RtgsNeftEntryPage(authenticatedPage);
    const validator = new RtgsNeftEntryValidator();

    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Search and open edit form', async () => {
      await (screen as any).grid.searchAndEdit(data.searchKey!, (data.tab as any) ?? 'pending');
    });
    await test.step('Fill updated fields', () => screen.fillForm(data));
    const toast = await test.step('Save', () => screen.save());
    validator.validateUpdated(toast);
  });

});

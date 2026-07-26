import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { CountryMasterPage, CountryMasterData } from '../src/CountryMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/CountryMaster/data/country-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'COUNTRYMST');

test.describe('Country Master > Update @regression', () => {
  test('should update country master', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<CountryMasterData>(DATA_FILE, 'Update');
    const data   = rows[0];
    const screen = new CountryMasterPage(authenticatedPage);

    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step(`Search in [${data.tab}] tab and update`, () => screen.update(data));
    expect(toast).toBeTruthy();
  });
});

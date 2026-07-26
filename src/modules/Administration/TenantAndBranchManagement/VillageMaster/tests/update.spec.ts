import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { VillageMasterPage, VillageMasterData } from '../src/VillageMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/VillageMaster/data/village-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'VILLAGEMASTER');

test.describe('Village Master > Update @regression', () => {
  test('should update village master', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<VillageMasterData>(DATA_FILE, 'Update');
    const data   = rows[0];
    const screen = new VillageMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Search, edit and save', () => screen.update(data));
    expect(toast).toBeTruthy();
  });
});

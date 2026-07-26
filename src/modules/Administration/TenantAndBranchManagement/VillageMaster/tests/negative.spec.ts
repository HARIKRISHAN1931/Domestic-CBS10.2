import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { VillageMasterPage, VillageMasterData } from '../src/VillageMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/VillageMaster/data/village-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'VILLAGEMASTER');

test.describe('Village Master > Negative @regression', () => {
  test('should reject village master', async ({ checkerAuthenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<VillageMasterData>(DATA_FILE, 'Negative');
    const data   = rows[0];
    const screen = new VillageMasterPage(checkerAuthenticatedPage);
    await test.step('Navigate', () => NAV(checkerAuthenticatedPage));
    const toast = await test.step('Reject', () => screen.reject(data.searchKey!, 'Rejected by automation'));
    expect(toast).toBeTruthy();
  });
});

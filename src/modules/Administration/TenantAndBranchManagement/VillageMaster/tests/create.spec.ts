import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { VillageMasterPage, VillageMasterData } from '../src/VillageMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/VillageMaster/data/village-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'VILLAGEMASTER');

test.describe('Village Master > Create @sanity @regression', () => {
  test('should create village master', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<VillageMasterData>(DATA_FILE, 'Create');
    const data   = rows[0];
    const screen = new VillageMasterPage(authenticatedPage);

    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    const toast = await test.step('Fill and save', () => screen.create(data));
    expect(toast).toBeTruthy();

    SharedDataStore.set('VillageMaster.searchKey', data.villageCode);

    await test.step('Verify record in Pending tab', async () => {
      await NAV(authenticatedPage);
      await (screen as any).grid.switchTab('pending');
      const row = authenticatedPage.locator('#dt-pendingdata tbody tr').filter({ hasText: data.villageCode! });
      await expect(row.first()).toBeVisible({ timeout: 10_000 });
    });
  });
});

import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { SubdivisionthanaPage, SubdivisionthanaData } from '../src/SubdivisionthanaPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/Subdivisionthana/data/subdivisionthana.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'AREAMASTER');

test.describe('Sub-Division/Thana > Create @sanity @regression', () => {
  test('should create sub-division/thana', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<SubdivisionthanaData>(DATA_FILE, 'Create');
    const data   = rows[0];
    const screen = new SubdivisionthanaPage(authenticatedPage);

    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    const toast = await test.step('Fill and save', () => screen.create(data));
    expect(toast).toBeTruthy();

    SharedDataStore.set('Subdivisionthana.searchKey', data.areaCd);

    await test.step('Verify record in Pending tab', async () => {
      await NAV(authenticatedPage);
      await (screen as any).grid.switchTab('pending');
      const row = authenticatedPage.locator('#dt-pendingdata tbody tr').filter({ hasText: data.areaCd! });
      await expect(row.first()).toBeVisible({ timeout: 10_000 });
    });
  });
});

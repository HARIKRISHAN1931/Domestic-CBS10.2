import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { SubdivisionthanaPage, SubdivisionthanaData } from '../src/SubdivisionthanaPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/Subdivisionthana/data/subdivisionthana.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'AREAMASTER');

test.describe('Sub-Division/Thana > Authorize @regression', () => {
  test('should authorize sub-division/thana', async ({ checkerAuthenticatedPage }) => {
    const rows      = await ExcelHelper.readSheet<SubdivisionthanaData>(DATA_FILE, 'Auth');
    const data      = rows[0];
    const searchKey = SharedDataStore.get<string>('Subdivisionthana.searchKey') ?? data.searchKey!;
    const screen    = new SubdivisionthanaPage(checkerAuthenticatedPage);

    await test.step('Navigate', () => NAV(checkerAuthenticatedPage));
    const toast = await test.step(`Approve [${searchKey}]`, () => screen.approve(searchKey, data.tab));
    expect(toast).toBeTruthy();

    await test.step('Verify in Authorized tab', async () => {
      await NAV(checkerAuthenticatedPage);
      await (screen as any).grid.switchTab('authorized');
      const row = checkerAuthenticatedPage.locator('#dt-authdata tbody tr').filter({ hasText: searchKey });
      await expect(row.first()).toBeVisible({ timeout: 10_000 });
    });
  });
});

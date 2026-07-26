import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { UrbanMasterPage, UrbanMasterData } from '../src/UrbanMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/UrbanMaster/data/urban-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'URBANMASTER');

test.describe('Urban Master > Authorize @regression', () => {
  test('should authorize urban master', async ({ checkerAuthenticatedPage }) => {
    const rows      = await ExcelHelper.readSheet<UrbanMasterData>(DATA_FILE, 'Auth');
    const data      = rows[0];
    const searchKey = SharedDataStore.get<string>('UrbanMaster.searchKey') ?? data.searchKey!;
    const screen    = new UrbanMasterPage(checkerAuthenticatedPage);

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

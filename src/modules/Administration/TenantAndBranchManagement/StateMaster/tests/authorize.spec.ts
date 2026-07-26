import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { StateMasterPage, StateMasterData } from '../src/StateMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/StateMaster/data/state-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'STATEMST');

test.describe('State Master > Authorize @regression', () => {
  test('should authorize state master', async ({ checkerAuthenticatedPage }) => {
    const rows      = await ExcelHelper.readSheet<StateMasterData>(DATA_FILE, 'Auth');
    const data      = rows[0];
    const searchKey = SharedDataStore.get<string>('StateMaster.searchKey') ?? data.searchKey!;
    const screen    = new StateMasterPage(checkerAuthenticatedPage);

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

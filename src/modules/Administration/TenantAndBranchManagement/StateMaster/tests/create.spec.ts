import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { StateMasterPage, StateMasterData } from '../src/StateMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/StateMaster/data/state-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'STATEMST');

test.describe('State Master > Create @smoke @regression', () => {
  test('should create state master', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<StateMasterData>(DATA_FILE, 'Create');
    const data   = rows[0];
    const screen = new StateMasterPage(authenticatedPage);

    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    const toast = await test.step('Fill and save', () => screen.create(data));
    expect(toast).toBeTruthy();

    SharedDataStore.set('StateMaster.searchKey', data.stateCode);

    await test.step('Verify record in Pending tab', async () => {
      await NAV(authenticatedPage);
      await (screen as any).grid.switchTab('pending');
      const row = authenticatedPage.locator('#dt-pendingdata tbody tr').filter({ hasText: data.stateCode! });
      await expect(row.first()).toBeVisible({ timeout: 10_000 });
    });
  });
});

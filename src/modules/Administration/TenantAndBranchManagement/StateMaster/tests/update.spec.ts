import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { StateMasterPage, StateMasterData } from '../src/StateMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/StateMaster/data/state-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'STATEMST');

test.describe('State Master > Update @regression', () => {
  test('should update state master', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<StateMasterData>(DATA_FILE, 'Update');
    const data   = rows[0];
    const screen = new StateMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Search, edit and save', () => screen.update(data));
    expect(toast).toBeTruthy();
  });
});

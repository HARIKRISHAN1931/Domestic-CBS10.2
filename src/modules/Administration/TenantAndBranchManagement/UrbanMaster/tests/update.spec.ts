import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { UrbanMasterPage, UrbanMasterData } from '../src/UrbanMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/UrbanMaster/data/urban-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'URBANMASTER');

test.describe('Urban Master > Update @regression', () => {
  test('should update urban master', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<UrbanMasterData>(DATA_FILE, 'Update');
    const data   = rows[0];
    const screen = new UrbanMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Search, edit and save', () => screen.update(data));
    expect(toast).toBeTruthy();
  });
});

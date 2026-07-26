import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { DistrictMasterPage, DistrictMasterData } from '../src/DistrictMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/DistrictMaster/data/district-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'DISTRICTMST');

test.describe('District Master > Update @regression', () => {
  test('should update district master', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<DistrictMasterData>(DATA_FILE, 'Update');
    const data   = rows[0];
    const screen = new DistrictMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Search, edit and save', () => screen.update(data));
    expect(toast).toBeTruthy();
  });
});

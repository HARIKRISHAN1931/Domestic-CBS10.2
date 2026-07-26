import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { DistrictMasterPage, DistrictMasterData } from '../src/DistrictMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/DistrictMaster/data/district-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'DISTRICTMST');

test.describe('District Master > Negative @regression', () => {
  test('should reject district master', async ({ checkerAuthenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<DistrictMasterData>(DATA_FILE, 'Negative');
    const data   = rows[0];
    const screen = new DistrictMasterPage(checkerAuthenticatedPage);
    await test.step('Navigate', () => NAV(checkerAuthenticatedPage));
    const toast = await test.step('Reject', () => screen.reject(data.searchKey!, 'Rejected by automation'));
    expect(toast).toBeTruthy();
  });
});

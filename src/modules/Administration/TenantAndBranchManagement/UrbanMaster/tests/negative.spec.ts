import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { UrbanMasterPage, UrbanMasterData } from '../src/UrbanMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/UrbanMaster/data/urban-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'URBANMASTER');

test.describe('Urban Master > Negative @regression', () => {
  test('should reject urban master', async ({ checkerAuthenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<UrbanMasterData>(DATA_FILE, 'Negative');
    const data   = rows[0];
    const screen = new UrbanMasterPage(checkerAuthenticatedPage);
    await test.step('Navigate', () => NAV(checkerAuthenticatedPage));
    const toast = await test.step('Reject', () => screen.reject(data.searchKey!, 'Rejected by automation'));
    expect(toast).toBeTruthy();
  });
});

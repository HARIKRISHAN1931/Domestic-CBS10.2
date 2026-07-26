import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { BlockmunicipalMasterPage, BlockmunicipalMasterData } from '../src/BlockmunicipalMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/BlockmunicipalMaster/data/blockmunicipal-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'MUNICIPALITYBLOCKMASTER');

test.describe('Block/Municipal Master > Negative @regression', () => {
  test('should reject block/municipal master', async ({ checkerAuthenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<BlockmunicipalMasterData>(DATA_FILE, 'Negative');
    const data   = rows[0];
    const screen = new BlockmunicipalMasterPage(checkerAuthenticatedPage);
    await test.step('Navigate', () => NAV(checkerAuthenticatedPage));
    const toast = await test.step('Reject', () => screen.reject(data.searchKey!, 'Rejected by automation'));
    expect(toast).toBeTruthy();
  });
});

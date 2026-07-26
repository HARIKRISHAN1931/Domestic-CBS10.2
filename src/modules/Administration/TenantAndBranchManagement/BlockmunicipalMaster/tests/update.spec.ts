import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { BlockmunicipalMasterPage, BlockmunicipalMasterData } from '../src/BlockmunicipalMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/BlockmunicipalMaster/data/blockmunicipal-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'MUNICIPALITYBLOCKMASTER');

test.describe('Block/Municipal Master > Update @regression', () => {
  test('should update block/municipal master', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<BlockmunicipalMasterData>(DATA_FILE, 'Update');
    const data   = rows[0];
    const screen = new BlockmunicipalMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Search, edit and save', () => screen.update(data));
    expect(toast).toBeTruthy();
  });
});

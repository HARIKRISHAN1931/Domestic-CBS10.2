import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { SubdivisionthanaPage, SubdivisionthanaData } from '../src/SubdivisionthanaPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/Subdivisionthana/data/subdivisionthana.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'AREAMASTER');

test.describe('Sub-Division/Thana > Update @regression', () => {
  test('should update sub-division/thana', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<SubdivisionthanaData>(DATA_FILE, 'Update');
    const data   = rows[0];
    const screen = new SubdivisionthanaPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Search, edit and save', () => screen.update(data));
    expect(toast).toBeTruthy();
  });
});

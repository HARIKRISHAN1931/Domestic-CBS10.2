import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { SubdivisionthanaPage, SubdivisionthanaData } from '../src/SubdivisionthanaPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/Subdivisionthana/data/subdivisionthana.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'AREAMASTER');

test.describe('Sub-Division/Thana > Negative @regression', () => {
  test('should reject sub-division/thana', async ({ checkerAuthenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<SubdivisionthanaData>(DATA_FILE, 'Negative');
    const data   = rows[0];
    const screen = new SubdivisionthanaPage(checkerAuthenticatedPage);
    await test.step('Navigate', () => NAV(checkerAuthenticatedPage));
    const toast = await test.step('Reject', () => screen.reject(data.searchKey!, 'Rejected by automation'));
    expect(toast).toBeTruthy();
  });
});

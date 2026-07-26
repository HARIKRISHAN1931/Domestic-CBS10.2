import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { BranchManagementPage, BranchManagementData } from '../src/BranchManagementPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/BranchManagement/data/branch-management.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'BRANCHMGMT');

test.describe('Branch Management > Negative @regression', () => {
  test('should reject branch management', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<BranchManagementData>(DATA_FILE, 'Negative');
    const data   = rows[0];
    const screen = new BranchManagementPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Reject', () => screen.reject(data.branchCode!, 'Rejected by automation'));
    expect(toast).toBeTruthy();
  });
});

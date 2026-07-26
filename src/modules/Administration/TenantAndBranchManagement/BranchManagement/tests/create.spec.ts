import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { BranchManagementPage, BranchManagementData } from '../src/BranchManagementPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/BranchManagement/data/branch-management.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'BRANCHMGMT');

test.describe('Branch Management > Create @smoke @regression', () => {
  test('should create branch management', async ({ authenticatedPage }) => {
    const [rows] = await Promise.all([ExcelHelper.readSheet<BranchManagementData>(DATA_FILE, 'Create')]);
    const data   = rows[0];
    const screen = new BranchManagementPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    const toast = await test.step('Fill and save', () => screen.create(data));
    expect(toast).toBeTruthy();
  });
});

import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { BranchToBranchDataMappingPage, BranchToBranchDataMappingData } from '../src/BranchToBranchDataMappingPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/BranchToBranchDataMapping/data/branch-to-branch-data-mapping.data.xlsx');

test.describe('Branch To Branch Data Mapping > Create @smoke @regression', () => {

  test('should create branch to branch data mapping', async ({ authenticatedPage }) => {
    const rows = await ExcelHelper.readSheet<BranchToBranchDataMappingData>(DATA_FILE, 'Create');
    const data = rows[0];
    const screen = new BranchToBranchDataMappingPage(authenticatedPage);
    const menu   = new MenuNavigation(authenticatedPage);

    await test.step('Navigate to Branch To Branch Data Mapping', () => menu.navigate('Administration', 'setupAdm', 'BRTOBRMAP'));
    await test.step('Open create form', () => screen.openCreateForm());
    const toast = await test.step('Fill and save', () => screen.create(data));
    expect(toast).toBeTruthy();
  });

});

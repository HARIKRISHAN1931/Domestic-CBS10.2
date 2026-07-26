import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { BranchToBranchDataMappingPage, BranchToBranchDataMappingData } from '../src/BranchToBranchDataMappingPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/BranchToBranchDataMapping/data/branch-to-branch-data-mapping.data.xlsx');

test.describe('Branch To Branch Data Mapping > Update @regression', () => {

  test('should update branch to branch data mapping', async ({ authenticatedPage }) => {
    const rows = await ExcelHelper.readSheet<BranchToBranchDataMappingData>(DATA_FILE, 'Update');
    const data = rows[0];
    const screen = new BranchToBranchDataMappingPage(authenticatedPage);
    const menu   = new MenuNavigation(authenticatedPage);

    await test.step('Navigate to Branch To Branch Data Mapping', () => menu.navigate('Administration', 'setupAdm', 'BRTOBRMAP'));
    const toast = await test.step('Search, edit and save', () => screen.update(data.fromBranch!, data));
    expect(toast).toBeTruthy();
  });

});

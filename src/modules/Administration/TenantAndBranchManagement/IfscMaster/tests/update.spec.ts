import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { IfscMasterPage, IfscMasterData } from '../src/IfscMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/IfscMaster/data/ifsc-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'IFSCMST');

test.describe('IFSC Master > Update @regression', () => {
  test('should update ifsc master', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<IfscMasterData>(DATA_FILE, 'Update');
    const data   = rows[0];
    const screen = new IfscMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Search, edit and save', () => screen.update(data.ifscCd!, { bankName: data.bankName }));
    expect(toast).toBeTruthy();
  });
});

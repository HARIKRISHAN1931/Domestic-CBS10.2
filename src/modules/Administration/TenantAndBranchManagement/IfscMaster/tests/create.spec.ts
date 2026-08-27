import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { IfscMasterPage, IfscMasterData } from '../src/IfscMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/IfscMaster/data/ifsc-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'IFSCMST');

test.describe('IFSC Master > Create @sanity @regression', () => {
  test('should create ifsc master', async ({ authenticatedPage }) => {
    const [rows] = await Promise.all([ExcelHelper.readSheet<IfscMasterData>(DATA_FILE, 'Create')]);
    const data   = rows[0];
    const screen = new IfscMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    const toast = await test.step('Fill and save', () => screen.create(data));
    expect(toast).toBeTruthy();
  });
});

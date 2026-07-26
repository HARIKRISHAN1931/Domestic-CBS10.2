import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { TenantMasterPage, TenantMasterData } from '../src/TenantMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/TenantMaster/data/tenant-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'TENANTMST');

test.describe('Tenant Master > Authorize @regression', () => {
  test('should authorize tenant master', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<TenantMasterData>(DATA_FILE, 'Authorize');
    const data   = rows[0];
    const screen = new TenantMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Approve', () => screen.approve(data.tenantId!));
    expect(toast).toBeTruthy();
  });
});

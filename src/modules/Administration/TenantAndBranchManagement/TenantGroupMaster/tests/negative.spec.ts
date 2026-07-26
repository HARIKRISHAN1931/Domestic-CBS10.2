import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { TenantGroupMasterPage, TenantGroupMasterData } from '../src/TenantGroupMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/TenantGroupMaster/data/tenant-group-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'TENANTGROUPMST');

test.describe('Tenant Group Master > Negative @regression', () => {
  test('should reject tenant group master', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<TenantGroupMasterData>(DATA_FILE, 'Negative');
    const data   = rows[0];
    const screen = new TenantGroupMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Reject', () => screen.reject(data.institutionId!, 'Rejected by automation'));
    expect(toast).toBeTruthy();
  });
});

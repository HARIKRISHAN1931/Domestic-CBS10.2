import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { TenantMasterPage, TenantMasterData } from '../src/TenantMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/TenantMaster/data/tenant-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'TENANTMST');

test.describe('Tenant Master > Negative @regression', () => {
  test('should reject tenant master', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<TenantMasterData>(DATA_FILE, 'Negative');
    const data   = rows[0];
    const screen = new TenantMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Reject', () => screen.reject(data.tenantId!, 'Rejected by automation'));
    expect(toast).toBeTruthy();
  });
});

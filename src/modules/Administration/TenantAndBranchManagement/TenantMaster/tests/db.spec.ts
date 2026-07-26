import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { TenantMasterData } from '../src/TenantMasterPage';
import { TenantMasterRepository } from '../src/TenantMasterRepository';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/TenantMaster/data/tenant-master.data.xlsx');

test.describe('Tenant Master > Database @database @regression', () => {
  test('should exist in DB after create', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<TenantMasterData>(DATA_FILE, 'Database');
    const repo = new TenantMasterRepository(db);
    const row  = await repo.findByCode(rows[0].tenantId!);
    expect(row, `Tenant Master must exist in DB`).not.toBeNull();
  });
});

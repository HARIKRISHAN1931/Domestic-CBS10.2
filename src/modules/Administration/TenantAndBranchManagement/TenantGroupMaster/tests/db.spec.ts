import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { TenantGroupMasterData } from '../src/TenantGroupMasterPage';
import { TenantGroupMasterRepository } from '../src/TenantGroupMasterRepository';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/TenantGroupMaster/data/tenant-group-master.data.xlsx');

test.describe('Tenant Group Master > Database @database @regression', () => {
  test('should exist in DB after create', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<TenantGroupMasterData>(DATA_FILE, 'Database');
    const repo = new TenantGroupMasterRepository(db);
    const row  = await repo.findByCode(rows[0].institutionId!);
    expect(row, `Tenant Group Master must exist in DB`).not.toBeNull();
  });
});

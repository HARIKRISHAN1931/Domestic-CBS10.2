import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { BranchManagementData } from '../src/BranchManagementPage';
import { BranchManagementRepository } from '../src/BranchManagementRepository';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/BranchManagement/data/branch-management.data.xlsx');

test.describe('Branch Management > Database @database @regression', () => {
  test('should exist in DB after create', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<BranchManagementData>(DATA_FILE, 'Database');
    const repo = new BranchManagementRepository(db);
    const row  = await repo.findByCode(rows[0].branchCode!);
    expect(row, `Branch Management must exist in DB`).not.toBeNull();
  });
});

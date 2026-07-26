import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { BranchToBranchDataMappingData } from '../src/BranchToBranchDataMappingPage';
import { BranchToBranchDataMappingRepository } from '../src/BranchToBranchDataMappingRepository';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/BranchToBranchDataMapping/data/branch-to-branch-data-mapping.data.xlsx');

test.describe('Branch To Branch Data Mapping > Database @database @regression', () => {

  test('should exist in DB after create', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<BranchToBranchDataMappingData>(DATA_FILE, 'Database');
    const data = rows[0];
    const repo = new BranchToBranchDataMappingRepository(db);

    const row = await repo.findByCode(data.fromBranch!);
    expect(row, `Branch To Branch Data Mapping ${data.fromBranch} must exist in DB`).not.toBeNull();
  });

});

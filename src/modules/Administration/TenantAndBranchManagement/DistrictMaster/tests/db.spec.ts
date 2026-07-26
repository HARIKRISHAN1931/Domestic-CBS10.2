import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { DistrictMasterData } from '../src/DistrictMasterPage';
import { DistrictMasterRepository } from '../src/DistrictMasterRepository';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/DistrictMaster/data/district-master.data.xlsx');

test.describe('District Master > Database @database @regression', () => {
  test('should exist in DB after create', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<DistrictMasterData>(DATA_FILE, 'Database');
    const repo = new DistrictMasterRepository(db);
    const row  = await repo.findByCode(rows[0].districtCode!);
    expect(row, `District Master must exist in DB`).not.toBeNull();
  });
});

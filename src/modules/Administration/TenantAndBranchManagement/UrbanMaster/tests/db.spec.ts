import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { UrbanMasterData } from '../src/UrbanMasterPage';
import { UrbanMasterRepository } from '../src/UrbanMasterRepository';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/UrbanMaster/data/urban-master.data.xlsx');

test.describe('Urban Master > Database @database @regression', () => {
  test('should exist in DB after create', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<UrbanMasterData>(DATA_FILE, 'Database');
    const repo = new UrbanMasterRepository(db);
    const row  = await repo.findByCode(rows[0].urbanCode!);
    expect(row, `Urban Master must exist in DB`).not.toBeNull();
  });
});

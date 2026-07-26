import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { VillageMasterData } from '../src/VillageMasterPage';
import { VillageMasterRepository } from '../src/VillageMasterRepository';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/VillageMaster/data/village-master.data.xlsx');

test.describe('Village Master > Database @database @regression', () => {
  test('should exist in DB after create', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<VillageMasterData>(DATA_FILE, 'Database');
    const repo = new VillageMasterRepository(db);
    const row  = await repo.findByCode(rows[0].villageCode!);
    expect(row, `Village Master must exist in DB`).not.toBeNull();
  });
});

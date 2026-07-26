import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { StateMasterData } from '../src/StateMasterPage';
import { StateMasterRepository } from '../src/StateMasterRepository';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/StateMaster/data/state-master.data.xlsx');

test.describe('State Master > Database @database @regression', () => {
  test('should exist in DB after create', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<StateMasterData>(DATA_FILE, 'Database');
    const repo = new StateMasterRepository(db);
    const row  = await repo.findByCode(rows[0].stateCode!);
    expect(row, `State Master must exist in DB`).not.toBeNull();
  });
});

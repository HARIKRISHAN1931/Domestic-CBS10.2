import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { IfscMasterData } from '../src/IfscMasterPage';
import { IfscMasterRepository } from '../src/IfscMasterRepository';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/IfscMaster/data/ifsc-master.data.xlsx');

test.describe('IFSC Master > Database @database @regression', () => {
  test('should exist in DB after create', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<IfscMasterData>(DATA_FILE, 'Database');
    const repo = new IfscMasterRepository(db);
    const row  = await repo.findByCode(rows[0].ifscCd!);
    expect(row, `IFSC Master must exist in DB`).not.toBeNull();
  });
});

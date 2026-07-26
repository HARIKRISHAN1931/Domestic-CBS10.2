import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { BlockmunicipalMasterData } from '../src/BlockmunicipalMasterPage';
import { BlockmunicipalMasterRepository } from '../src/BlockmunicipalMasterRepository';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/BlockmunicipalMaster/data/blockmunicipal-master.data.xlsx');

test.describe('Block/Municipal Master > Database @database @regression', () => {
  test('should exist in DB after create', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<BlockmunicipalMasterData>(DATA_FILE, 'Database');
    const repo = new BlockmunicipalMasterRepository(db);
    const row  = await repo.findByCode(rows[0].blockCode!);
    expect(row, `Block/Municipal Master must exist in DB`).not.toBeNull();
  });
});

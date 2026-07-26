import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { SubdivisionthanaData } from '../src/SubdivisionthanaPage';
import { SubdivisionthanaRepository } from '../src/SubdivisionthanaRepository';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/Subdivisionthana/data/subdivisionthana.data.xlsx');

test.describe('Sub-Division/Thana > Database @database @regression', () => {
  test('should exist in DB after create', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<SubdivisionthanaData>(DATA_FILE, 'Database');
    const repo = new SubdivisionthanaRepository(db);
    const row  = await repo.findByCode(rows[0].areaCd!);
    expect(row, `Sub-Division/Thana must exist in DB`).not.toBeNull();
  });
});

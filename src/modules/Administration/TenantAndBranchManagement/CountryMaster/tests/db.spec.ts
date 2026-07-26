import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { CountryMasterData } from '../src/CountryMasterPage';
import { CountryMasterRepository } from '../src/CountryMasterRepository';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/CountryMaster/data/country-master.data.xlsx');

test.describe('Country Master > Database @database @regression', () => {
  test('should exist in DB after create', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<CountryMasterData>(DATA_FILE, 'Database');
    const repo = new CountryMasterRepository(db);
    const row  = await repo.findByCode(rows[0].countryCode!);
    expect(row, `Country Master must exist in DB`).not.toBeNull();
  });
});

import { test } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import { RtgsNeftEntryRepository } from '../src/RtgsNeftEntryRepository';
import { RtgsNeftEntryValidator } from '../src/RtgsNeftEntryBuilder';
import { DatabaseConnectionManager } from '../../../../../framework/database/DatabaseConnectionManager';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Transaction/RtgsAndNeft/RtgsneftEntry/data/RtgsneftEntry.xlsx');

test.describe('RTGS/NEFT Entry — DB Validation @database @regression', () => {

  test('should have unauthorized record in D946020 after create', async ({ db }: { db: DatabaseConnectionManager }) => {
    const rows      = await ExcelHelper.readSheet(DATA_FILE, 'Database');
    const data      = rows[0] as any;
    const searchKey = SharedDataStore.get<string>('RtgsNeftEntry.searchKey') ?? String(data.setNo ?? data.scrollNo ?? '');
    const repo      = new RtgsNeftEntryRepository(db);
    const validator = new RtgsNeftEntryValidator();

    const row = await test.step(`Query D946020 for setNo [${searchKey}]`, () => repo.findBySetNo(searchKey));
    validator.validateDbRecord(row, searchKey);
  });

  test('should have authorized record in D946020 after approve', async ({ db }: { db: DatabaseConnectionManager }) => {
    const rows      = await ExcelHelper.readSheet(DATA_FILE, 'Database');
    const data      = rows[0] as any;
    const searchKey = SharedDataStore.get<string>('RtgsNeftEntry.searchKey') ?? String(data.setNo ?? data.scrollNo ?? '');
    const repo      = new RtgsNeftEntryRepository(db);
    const validator = new RtgsNeftEntryValidator();

    const row = await test.step(`Query D946020 for authorized setNo [${searchKey}]`, () => repo.findBySetNo(searchKey));
    validator.validateDbAuthorized(row, searchKey);
  });

});

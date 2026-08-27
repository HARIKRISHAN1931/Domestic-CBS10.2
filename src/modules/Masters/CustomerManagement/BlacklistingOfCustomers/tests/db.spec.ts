import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import { BlacklistingOfCustomersRepository } from '../src/BlacklistingOfCustomersRepository';
import { BlacklistingOfCustomersValidator } from '../src/BlacklistingOfCustomersBuilder';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Masters/CustomerManagement/BlacklistingOfCustomers/data/BlacklistingOfCustomers.xlsx');

test.describe('Blacklisting Of Customers — DB Validation @database @regression', () => {

  test('should have unauthorized record after create', async ({ db }) => {
    const rows      = await ExcelHelper.readSheet(DATA_FILE, 'Database');
    const data      = rows[0] as any;
    const custNo    = SharedDataStore.get<string>('BlacklistingOfCustomers.searchKey') ?? String(data.custNo);
    const repo      = new BlacklistingOfCustomersRepository(db);
    const validator = new BlacklistingOfCustomersValidator();

    const row = await test.step(`Query custBlacklistMaster for custNo [${custNo}]`, () => repo.findByCustNo(custNo));
    validator.validateDbRecord(row, custNo);
  });

  test('should have authorized record after approve', async ({ db }) => {
    const rows      = await ExcelHelper.readSheet(DATA_FILE, 'Database');
    const data      = rows[0] as any;
    const custNo    = SharedDataStore.get<string>('BlacklistingOfCustomers.searchKey') ?? String(data.custNo);
    const repo      = new BlacklistingOfCustomersRepository(db);
    const validator = new BlacklistingOfCustomersValidator();

    const row = await test.step(`Query custBlacklistMaster for authorized custNo [${custNo}]`, () => repo.findByCustNo(custNo));
    validator.validateDbAuthorized(row, custNo);
  });

});

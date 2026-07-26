import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { CustomerCreationRepository } from '../src/CustomerCreationRepository';
import { CustomerCreationValidator } from '../src/CustomerCreationValidator';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Masters/CustomerManagement/CustomerCreationretail/data/customer-creation.data.xlsx');

test.describe('Customer Creation — DB Validation @database @regression', () => {

  test('should have unauthorized record after create', async ({ db }) => {
    const rows      = await ExcelHelper.readSheet(DATA_FILE, 'Database');
    const data      = rows[0] as any;
    const custNo    = SharedDataStore.get<string>('CustomerCreation.searchKey') ?? data.custNo;
    const repo      = new CustomerCreationRepository(db);
    const validator = new CustomerCreationValidator();

    const row = await test.step(`Query D009011 for custNo [${custNo}]`, () => repo.findByCustomerNumber(custNo));
    validator.validateDbRecord(row, custNo);
  });

  test('should have authorized record after approve', async ({ db }) => {
    const rows      = await ExcelHelper.readSheet(DATA_FILE, 'Database');
    const data      = rows[0] as any;
    const custNo    = SharedDataStore.get<string>('CustomerCreation.searchKey') ?? data.custNo;
    const repo      = new CustomerCreationRepository(db);
    const validator = new CustomerCreationValidator();

    const row = await test.step(`Query D009011 for authorized custNo [${custNo}]`, () => repo.findByCustomerNumber(custNo));
    validator.validateDbAuthorized(row, custNo);
  });

});

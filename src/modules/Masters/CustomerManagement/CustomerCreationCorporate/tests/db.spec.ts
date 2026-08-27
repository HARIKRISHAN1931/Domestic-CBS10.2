import * as path from 'path';
import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import { CorporateCustomerRepository } from '../src/index';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Customer/Corporate/CorporateCustomer/data/corporate-customer.data.xlsx');

test.describe('Corporate Customer — DB Validation @database @regression', () => {

  test('should have unauthorized record after create', async ({ db }) => {
    const rows   = await ExcelHelper.readSheet(DATA_FILE, 'Database');
    const data   = rows[0] as any;
    const name   = SharedDataStore.get<string>('CorporateCustomer.searchKey') ?? String(data.memberFName);
    const repo   = new CorporateCustomerRepository(db);

    const row = await test.step(`Query memberMaster for [${name}]`, () => repo.findByName(name));
    expect(row, `Corporate customer ${name} must exist in memberMaster`).not.toBeNull();
    expect(row!.authStatus, 'authStatus must be U after create').toBe('U');
    expect(row!.isActive, 'isActive must be 1').toBe(1);
  });

  test('should have authorized record after approve', async ({ db }) => {
    const rows   = await ExcelHelper.readSheet(DATA_FILE, 'Database');
    const data   = rows[0] as any;
    const name   = SharedDataStore.get<string>('CorporateCustomer.searchKey') ?? String(data.memberFName);
    const repo   = new CorporateCustomerRepository(db);

    const row = await test.step(`Query memberMaster for authorized [${name}]`, () => repo.findByName(name));
    expect(row, `Corporate customer ${name} must exist in memberMaster`).not.toBeNull();
    expect(row!.authStatus, 'authStatus must be A after authorize').toBe('A');
  });

});

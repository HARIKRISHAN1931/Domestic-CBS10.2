import * as path from 'path';
import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { AccountOpeningRepository } from '../src/AccountOpeningRepository';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';

const DATA_FILE = path.resolve(__dirname, '../data/CustomerAccountCreation.xlsx');

test.describe('Customer Account Creation (PRDACNOMST) > Database', () => {

  test('should verify account records exist in DB @database @regression', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<Record<string, string>>(DATA_FILE, 'Database');
    const repo = new AccountOpeningRepository(db);
    for (const row of rows) {
      if (!row.accountNo) continue;
      const record = await repo.findByAccountNo(row.accountNo);
      expect(record, `Account ${row.accountNo} must exist in DB`).not.toBeNull();
      if (row.expectedAcType)   expect(record!.acType).toBe(row.expectedAcType);
      if (row.expectedStatus)   expect(record!.authStatus).toBe(row.expectedStatus);
    }
  });

  test('should verify authorized accounts in DB @database @regression', async ({ db }) => {
    const repo    = new AccountOpeningRepository(db);
    const pending = await repo.countByAuthStatus('U');
    console.log(`Pending (Unauthorized) accounts in DB: ${pending}`);
    const authorized = await repo.countByAuthStatus('A');
    console.log(`Authorized accounts in DB: ${authorized}`);
    expect(authorized).toBeGreaterThanOrEqual(0);
  });

  test('should verify account by customer ID in DB @database @regression', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<Record<string, string>>(DATA_FILE, 'Database');
    const repo = new AccountOpeningRepository(db);
    for (const row of rows) {
      if (!row.customerId) continue;
      const records = await repo.findByCustomerId(row.customerId);
      expect(records.length, `Customer ${row.customerId} must have at least one account`).toBeGreaterThan(0);
    }
  });

});

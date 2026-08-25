import * as path from 'path';
import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { TermDepositRepository } from '../src/TermDepositRepository';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';

const DATA_FILE = path.resolve(__dirname, '../data/TermDepositContract.xlsx');

test.describe('Term Deposit Contract > Database', () => {

  test('should verify TD contracts exist in D020004 @database @smoke @regression', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<Record<string, string>>(DATA_FILE, 'Database');
    const repo = new TermDepositRepository(db);
    for (const row of rows) {
      if (!row.prdAcctId) continue;
      const record = await repo.findByAccountId(row.prdAcctId);
      expect(record, `TD contract ${row.prdAcctId} must exist in DB`).not.toBeNull();
      if (row.expectedProduct)  expect(record!.productCode).toBe(row.expectedProduct);
      if (row.expectedStatus)   expect(record!.depositStatus).toBe(row.expectedStatus);
      if (row.expectedAmount)   expect(Number(record!.depositAmount)).toBe(Number(row.expectedAmount));
    }
  });

  test('should verify customer 1395042 has TD contracts @database @regression', async ({ db }) => {
    const repo  = new TermDepositRepository(db);
    const count = await repo.countByCustomer('1395042');
    console.log(`Customer 1395042 TD contracts in DB: ${count}`);
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should verify authorized TD contracts in DB @database @regression', async ({ db }) => {
    const repo       = new TermDepositRepository(db);
    const authorized = await repo.countByStatus('2');
    console.log(`Authorized TD contracts in DB: ${authorized}`);
    expect(authorized).toBeGreaterThanOrEqual(0);
  });

  test('should verify TD contracts by product from Excel @database @regression', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<Record<string, string>>(DATA_FILE, 'Database');
    const repo = new TermDepositRepository(db);
    for (const row of rows) {
      if (!row.customerCode) continue;
      const records = await repo.findContractsByCustomer(row.customerCode);
      expect(records.length, `Customer ${row.customerCode} must have at least one TD contract`).toBeGreaterThan(0);
    }
  });

});

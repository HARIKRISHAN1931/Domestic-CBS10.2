import { test, expect } from '../../../framework/fixtures/fixtures';
import { RTGSEntryPage } from './RTGSEntryPage';
import { RTGSEntryBuilder } from './RTGSEntryBuilder';
import { RTGSEntryRepository } from './RTGSEntryRepository';
import { RTGSEntryValidator } from './RTGSEntryValidator';
import { ExcelHelper } from '../../../common/helpers/ExcelHelper';
import { Page } from '@playwright/test';
import * as path from 'path';

const DATA_FILE = path.resolve(__dirname, 'rtgs-entry.data.xlsx');

test.describe('RTGS Entry - Create', () => {
  test('should submit RTGS transaction @smoke @regression', async ({ page, db }: { page: Page; db: import('../../../framework/database/DatabaseConnectionManager').DatabaseConnectionManager }) => {
    const rtgsPage = new RTGSEntryPage(page);
    const validator = new RTGSEntryValidator(rtgsPage, new RTGSEntryRepository(db));
    await rtgsPage.navigate();
    const data = new RTGSEntryBuilder().withDebitAccount('ACC001234567').withAmount(500000).build();
    await rtgsPage.fillForm(data);
    await rtgsPage.submit();
    await validator.verifyTransactionRefGenerated();
  });

  test('should submit RTGS from Excel data @regression', async ({ page, db }: { page: Page; db: import('../../../framework/database/DatabaseConnectionManager').DatabaseConnectionManager }) => {
    const rtgsPage = new RTGSEntryPage(page);
    const validator = new RTGSEntryValidator(rtgsPage, new RTGSEntryRepository(db));
    await rtgsPage.navigate();
    const rows = await ExcelHelper.readSheet<Record<string, string>>(DATA_FILE, 'Create');
    const row = rows[0];
    const data = new RTGSEntryBuilder().withDebitAccount(row['debitAccountNumber']).withAmount(Number(row['amount'])).withRemarks(row['remarks']).build();
    await rtgsPage.fillForm(data);
    await rtgsPage.submit();
    await validator.verifyTransactionRefGenerated();
  });
});

test.describe('RTGS Entry - Negative', () => {
  test('should reject RTGS below minimum amount @regression', async ({ page }: { page: Page }) => {
    const rtgsPage = new RTGSEntryPage(page);
    await rtgsPage.navigate();
    const data = new RTGSEntryBuilder().withDebitAccount('ACC001234567').withAmount(100000).build();
    await rtgsPage.fillForm(data);
    await rtgsPage.submit();
    await expect(page.getByTestId('error-amount')).toBeVisible();
  });

  test('should reject invalid IFSC code @regression', async ({ page }: { page: Page }) => {
    const rtgsPage = new RTGSEntryPage(page);
    await rtgsPage.navigate();
    const data = new RTGSEntryBuilder().withDebitAccount('ACC001234567').withBeneficiary('Test User', '12345678901234', 'INVALID').build();
    await rtgsPage.fillForm(data);
    await rtgsPage.submit();
    await expect(page.getByTestId('error-beneficiaryIFSC')).toBeVisible();
  });
});

test.describe('RTGS Entry - Database', () => {
  test('should verify RTGS transaction in database @database @regression', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<Record<string, string>>(DATA_FILE, 'Database');
    const repo = new RTGSEntryRepository(db);
    for (const row of rows) {
      const record = await repo.findByTransactionRef(row['transactionRef']);
      if (record) {
        expect(record.amount).toBe(Number(row['expectedAmount']));
        expect(record.status).toBe(row['expectedStatus']);
      }
    }
  });
});

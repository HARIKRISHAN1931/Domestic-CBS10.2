import { test, expect } from '../../../framework/fixtures/fixtures';
import { IMPSEntryPage } from './IMPSEntryPage';
import { IMPSEntryBuilder } from './IMPSEntryBuilder';
import { IMPSEntryRepository } from './IMPSEntryRepository';
import { IMPSEntryValidator } from './IMPSEntryValidator';
import { ExcelHelper } from '../../../common/helpers/ExcelHelper';
import { Page } from '@playwright/test';
import * as path from 'path';

const DATA_FILE = path.resolve(__dirname, 'imps-entry.data.xlsx');

test.describe('IMPS Entry - Create', () => {
  test('should submit IMPS transaction @smoke @regression', async ({ page, db }: { page: Page; db: import('../../../framework/database/DatabaseConnectionManager').DatabaseConnectionManager }) => {
    const impsPage = new IMPSEntryPage(page);
    const validator = new IMPSEntryValidator(impsPage, new IMPSEntryRepository(db));
    await impsPage.navigate();
    const data = new IMPSEntryBuilder().withDebitAccount('ACC001234567').withAmount(10000).build();
    await impsPage.fillForm(data);
    await impsPage.submit();
    await validator.verifyTransactionRefGenerated();
  });

  test('should submit IMPS from Excel data @regression', async ({ page, db }: { page: Page; db: import('../../../framework/database/DatabaseConnectionManager').DatabaseConnectionManager }) => {
    const impsPage = new IMPSEntryPage(page);
    const validator = new IMPSEntryValidator(impsPage, new IMPSEntryRepository(db));
    await impsPage.navigate();
    const rows = await ExcelHelper.readSheet<Record<string, string>>(DATA_FILE, 'Create');
    const row = rows[0];
    const data = new IMPSEntryBuilder()
      .withDebitAccount(row['debitAccountNumber'])
      .withBeneficiaryMobile(row['beneficiaryMobile'])
      .withBeneficiaryMMID(row['beneficiaryMMID'])
      .withAmount(Number(row['amount']))
      .build();
    await impsPage.fillForm(data);
    await impsPage.submit();
    await validator.verifyTransactionRefGenerated();
  });
});

test.describe('IMPS Entry - Negative', () => {
  test('should show error when amount exceeds limit @regression', async ({ page }: { page: Page }) => {
    const impsPage = new IMPSEntryPage(page);
    await impsPage.navigate();
    const data = new IMPSEntryBuilder().withDebitAccount('ACC001234567').withAmount(300000).build();
    await impsPage.fillForm(data);
    await impsPage.submit();
    await expect(page.getByTestId('error-amount')).toBeVisible();
  });
});

test.describe('IMPS Entry - Database', () => {
  test('should verify IMPS transaction in database @database @regression', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<Record<string, string>>(DATA_FILE, 'Database');
    const repo = new IMPSEntryRepository(db);
    for (const row of rows) {
      const record = await repo.findByTransactionRef(row['transactionRef']);
      if (record) {
        expect(record.amount).toBe(Number(row['expectedAmount']));
        expect(record.status).toBe(row['expectedStatus']);
      }
    }
  });
});

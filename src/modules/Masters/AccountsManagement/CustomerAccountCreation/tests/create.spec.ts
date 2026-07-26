import { test, expect } from '../../../../framework/fixtures/fixtures';
import { AccountOpeningPage } from './AccountOpeningPage';
import { AccountOpeningBuilder } from './AccountOpeningBuilder';
import { AccountOpeningRepository } from './AccountOpeningRepository';
import { AccountOpeningValidator } from './AccountOpeningValidator';
import { ExcelHelper } from '../../../../common/helpers/ExcelHelper';
import { AccountType } from '../../../../common/enums/domain.enums';
import { Page } from '@playwright/test';
import * as path from 'path';

const DATA_FILE = path.resolve(__dirname, 'account-opening.data.xlsx');

test.describe('Account Opening - Create', () => {
  let accountPage: AccountOpeningPage;
  let createdAccountNumber: string;

  test.beforeEach(async ({ page }: { page: Page }) => {
    accountPage = new AccountOpeningPage(page);
    await accountPage.navigate();
  });

  test.afterEach(async ({ db }) => {
    if (createdAccountNumber) await new AccountOpeningRepository(db).deleteTestAccount(createdAccountNumber);
  });

  test('should open savings account @smoke @regression', async ({ db }) => {
    const repo = new AccountOpeningRepository(db);
    const validator = new AccountOpeningValidator(accountPage, repo);
    const data = new AccountOpeningBuilder().withCustomerId('CUST001').withAccountType(AccountType.Savings).withInitialDeposit(10000).build();
    await accountPage.fillForm(data);
    await accountPage.save();
    createdAccountNumber = await validator.verifyAccountNumberGenerated();
    await validator.verifyAccountInDatabase(createdAccountNumber, AccountType.Savings);
  });

  test('should open current account @regression', async ({ db }) => {
    const repo = new AccountOpeningRepository(db);
    const validator = new AccountOpeningValidator(accountPage, repo);
    const data = new AccountOpeningBuilder().withCustomerId('CUST001').withAccountType(AccountType.Current).withInitialDeposit(25000).build();
    await accountPage.fillForm(data);
    await accountPage.save();
    createdAccountNumber = await validator.verifyAccountNumberGenerated();
    await validator.verifyAccountInDatabase(createdAccountNumber, AccountType.Current);
  });

  test('should open account from Excel data @regression', async ({ db }) => {
    const repo = new AccountOpeningRepository(db);
    const validator = new AccountOpeningValidator(accountPage, repo);
    const rows = await ExcelHelper.readSheet<Record<string, string>>(DATA_FILE, 'Create');
    const row = rows[0];
    const data = new AccountOpeningBuilder()
      .withCustomerId(row['customerId'])
      .withAccountType(row['accountType'] as AccountType)
      .withInitialDeposit(Number(row['initialDeposit']))
      .build();
    await accountPage.fillForm(data);
    await accountPage.save();
    createdAccountNumber = await validator.verifyAccountNumberGenerated();
    await validator.verifyAccountInDatabase(createdAccountNumber, row['accountType']);
  });
});

test.describe('Account Opening - Authorize', () => {
  test('should authorize account @regression', async ({ page, db }: { page: Page; db: import('../../../../framework/database/DatabaseConnectionManager').DatabaseConnectionManager }) => {
    const ap = new AccountOpeningPage(page);
    const repo = new AccountOpeningRepository(db);
    const validator = new AccountOpeningValidator(ap, repo);
    const rows = await ExcelHelper.readSheet<Record<string, string>>(DATA_FILE, 'Authorize');
    const row = rows[0];
    await ap.navigate();
    await ap.authorize();
    await validator.verifyAuthorized(row['accountNumber']);
  });
});

test.describe('Account Opening - Negative', () => {
  test('should show error for invalid customer ID @regression', async ({ page }: { page: Page }) => {
    const ap = new AccountOpeningPage(page);
    await ap.navigate();
    const data = new AccountOpeningBuilder().withCustomerId('INVALID999').withAccountType(AccountType.Savings).build();
    await ap.fillForm(data);
    await ap.save();
    await expect(page.getByTestId('error-customerId')).toBeVisible();
  });

  test('should show error for zero initial deposit @regression', async ({ page }: { page: Page }) => {
    const ap = new AccountOpeningPage(page);
    await ap.navigate();
    const data = new AccountOpeningBuilder().withCustomerId('CUST001').withInitialDeposit(0).build();
    await ap.fillForm(data);
    await ap.save();
    await expect(page.getByTestId('error-initialDeposit')).toBeVisible();
  });
});

test.describe('Account Opening - Database', () => {
  test('should verify account record in database @database @regression', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<Record<string, string>>(DATA_FILE, 'Database');
    const repo = new AccountOpeningRepository(db);
    for (const row of rows) {
      const record = await repo.findByAccountNumber(row['accountNumber']);
      if (record) {
        expect(record.accountType).toBe(row['expectedType']);
        expect(record.status).toBe(row['expectedStatus']);
      }
    }
  });
});

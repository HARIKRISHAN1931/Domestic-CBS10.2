import { test, expect } from '../../../framework/fixtures/fixtures';
import { LoanCreationPage } from './LoanCreationPage';
import { LoanCreationBuilder } from './LoanCreationBuilder';
import { LoanCreationRepository } from './LoanCreationRepository';
import { LoanCreationValidator } from './LoanCreationValidator';
import { ExcelHelper } from '../../../common/helpers/ExcelHelper';
import { Page } from '@playwright/test';
import * as path from 'path';

const DATA_FILE = path.resolve(__dirname, 'loan-creation.data.xlsx');

test.describe('Loan Creation - Create', () => {
  let loanPage: LoanCreationPage;
  let createdLoanId: string;

  test.beforeEach(async ({ page }: { page: Page }) => {
    loanPage = new LoanCreationPage(page);
    await loanPage.navigate();
  });

  test.afterEach(async ({ db }) => {
    if (createdLoanId) await new LoanCreationRepository(db).deleteTestLoan(createdLoanId);
  });

  test('should create home loan @smoke @regression', async ({ db }) => {
    const repo = new LoanCreationRepository(db);
    const validator = new LoanCreationValidator(loanPage, repo);
    const data = new LoanCreationBuilder().withCustomerId('CUST001').withLoanType('HOME_LOAN').withLoanAmount(5000000).withTenure(240).build();
    await loanPage.fillForm(data);
    await loanPage.save();
    createdLoanId = await validator.verifyLoanIdGenerated();
    await validator.verifyLoanInDatabase(createdLoanId, 5000000);
  });

  test('should create loan from Excel data @regression', async ({ db }) => {
    const repo = new LoanCreationRepository(db);
    const validator = new LoanCreationValidator(loanPage, repo);
    const rows = await ExcelHelper.readSheet<Record<string, string>>(DATA_FILE, 'Create');
    const row = rows[0];
    const data = new LoanCreationBuilder()
      .withCustomerId(row['customerId'])
      .withLoanType(row['loanType'])
      .withLoanAmount(Number(row['loanAmount']))
      .withTenure(Number(row['tenureMonths']))
      .withPurpose(row['purpose'])
      .build();
    await loanPage.fillForm(data);
    await loanPage.save();
    createdLoanId = await validator.verifyLoanIdGenerated();
  });
});

test.describe('Loan Creation - Negative', () => {
  test('should show error for zero loan amount @regression', async ({ page }: { page: Page }) => {
    const loanPage = new LoanCreationPage(page);
    await loanPage.navigate();
    const data = new LoanCreationBuilder().withCustomerId('CUST001').withLoanAmount(0).build();
    await loanPage.fillForm(data);
    await loanPage.save();
    await expect(page.getByTestId('error-loanAmount')).toBeVisible();
  });
});

test.describe('Loan Creation - Database', () => {
  test('should verify loan record in database @database @regression', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<Record<string, string>>(DATA_FILE, 'Database');
    const repo = new LoanCreationRepository(db);
    for (const row of rows) {
      const record = await repo.findByLoanId(row['loanId']);
      if (record) {
        expect(record.loanAmount).toBe(Number(row['expectedAmount']));
        expect(record.status).toBe(row['expectedStatus']);
      }
    }
  });
});

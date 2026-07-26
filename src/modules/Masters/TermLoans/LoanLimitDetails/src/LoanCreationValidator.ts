import { expect } from '@playwright/test';
import { LoanCreationPage } from './LoanCreationPage';
import { LoanCreationRepository } from './LoanCreationRepository';

export class LoanCreationValidator {
  constructor(
    private readonly page: LoanCreationPage,
    private readonly repo: LoanCreationRepository,
  ) {}

  async verifyLoanIdGenerated(): Promise<string> {
    const loanId = await this.page.getLoanId();
    expect(loanId).toBeTruthy();
    return loanId;
  }

  async verifyLoanInDatabase(loanId: string, expectedAmount: number): Promise<void> {
    const record = await this.repo.findByLoanId(loanId);
    expect(record).not.toBeNull();
    expect(record?.loanAmount).toBe(expectedAmount);
  }

  async verifyFieldError(fieldName: string): Promise<void> {
    await expect(this.page.getByTestId(`error-${fieldName}`)).toBeVisible();
  }
}

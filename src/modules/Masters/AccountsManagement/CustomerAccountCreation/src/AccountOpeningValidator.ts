import { expect } from '@playwright/test';
import { AccountOpeningPage } from './AccountOpeningPage';
import { AccountOpeningRepository } from './AccountOpeningRepository';

export class AccountOpeningValidator {
  constructor(
    private readonly page: AccountOpeningPage,
    private readonly repo: AccountOpeningRepository,
  ) {}

  async verifyAccountNumberGenerated(): Promise<string> {
    const accountNumber = await this.page.getAccountNumber();
    expect(accountNumber).toBeTruthy();
    return accountNumber;
  }

  async verifyAccountInDatabase(accountNumber: string, expectedType: string): Promise<void> {
    const record = await this.repo.findByAccountNumber(accountNumber);
    expect(record).not.toBeNull();
    expect(record?.accountType).toBe(expectedType);
  }

  async verifyAuthorized(accountNumber: string): Promise<void> {
    const record = await this.repo.findByAccountNumber(accountNumber);
    expect(record?.status).toBe('AUTHORIZED');
  }

  async verifyFieldError(fieldName: string): Promise<void> {
    await expect(this.page.getByTestId(`error-${fieldName}`)).toBeVisible();
  }
}

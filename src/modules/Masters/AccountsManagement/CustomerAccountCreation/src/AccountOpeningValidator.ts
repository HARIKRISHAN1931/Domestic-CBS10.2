import { expect } from '@playwright/test';
import { AccountOpeningPage } from './AccountOpeningPage';
import { AccountOpeningRepository } from './AccountOpeningRepository';

export class AccountOpeningValidator {
  constructor(
    private readonly page: AccountOpeningPage,
    private readonly repo: AccountOpeningRepository,
  ) {}

  async verifyPendingInGrid(customerId: string): Promise<void> {
    await this.page.switchToPendingTab();
    expect(
      await this.page.isRecordInPendingGrid(customerId),
      `${customerId} must appear in pending grid`
    ).toBe(true);
  }

  async verifyInDatabase(accountNo: string): Promise<void> {
    const record = await this.repo.findByAccountNo(accountNo);
    expect(record, `Account ${accountNo} must exist in DB`).not.toBeNull();
  }

  async verifyAuthorized(accountNo: string): Promise<void> {
    const record = await this.repo.findAuthorized(accountNo);
    expect(record, `Account ${accountNo} must be authorized in DB`).not.toBeNull();
    expect(record?.authStatus).toBe('A');
  }

  async verifyFieldError(fieldId: string): Promise<void> {
    const errorDiv = this.page.page.locator(`.control-error[id*="${fieldId}"], #${fieldId}-error`).first();
    await expect(errorDiv).toBeVisible({ timeout: 5_000 });
  }
}

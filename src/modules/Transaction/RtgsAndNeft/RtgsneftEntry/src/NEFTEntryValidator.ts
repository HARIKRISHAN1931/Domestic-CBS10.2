import { expect } from '@playwright/test';
import { NEFTEntryPage } from './NEFTEntryPage';
import { NEFTEntryRepository } from './NEFTEntryRepository';

export class NEFTEntryValidator {
  constructor(
    private readonly page: NEFTEntryPage,
    private readonly repo: NEFTEntryRepository,
  ) {}

  async verifyTransactionRefGenerated(): Promise<string> {
    const ref = await this.page.getTransactionReference();
    expect(ref).toBeTruthy();
    return ref;
  }

  async verifyTransactionInDatabase(transactionRef: string, expectedAmount: number): Promise<void> {
    const record = await this.repo.findByTransactionRef(transactionRef);
    expect(record).not.toBeNull();
    expect(record?.amount).toBe(expectedAmount);
  }

  async verifyFieldError(fieldName: string): Promise<void> {
    await expect(this.page.getByTestId(`error-${fieldName}`)).toBeVisible();
  }
}

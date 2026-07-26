import { expect } from '@playwright/test';
import { IMPSEntryPage } from './IMPSEntryPage';
import { IMPSEntryRepository } from './IMPSEntryRepository';

export class IMPSEntryValidator {
  constructor(
    private readonly page: IMPSEntryPage,
    private readonly repo: IMPSEntryRepository,
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

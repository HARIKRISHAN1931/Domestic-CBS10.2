import { expect } from '@playwright/test';
import { CustomerModificationPage } from './CustomerModificationPage';
import { CustomerModificationRepository } from './CustomerModificationRepository';

export class CustomerModificationValidator {
  constructor(
    private readonly page: CustomerModificationPage,
    private readonly repo: CustomerModificationRepository,
  ) {}

  async verifyUpdateSuccess(): Promise<void> {
    await expect(this.page.successMessage).toBeVisible();
  }

  async verifyMobileUpdatedInDatabase(customerId: string, expectedMobile: string): Promise<void> {
    const record = await this.repo.findByCustomerId(customerId);
    expect(record).not.toBeNull();
    expect(record?.mobileNumber).toBe(expectedMobile);
  }

  async verifyFieldError(fieldName: string): Promise<void> {
    await expect(this.page.getByTestId(`error-${fieldName}`)).toBeVisible();
  }
}

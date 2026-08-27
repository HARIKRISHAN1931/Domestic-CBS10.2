import { expect } from '@playwright/test';
import { CustomerDbRow } from './CustomerCreationRepository';

export class CustomerModificationValidator {
  validateUpdated(toast: string): void {
    expect(toast, 'Update success toast must be present').toBeTruthy();
  }

  validateDbRecord(row: CustomerDbRow | null, custNo: string): void {
    expect(row, `Customer ${custNo} must exist in D009011 after update`).not.toBeNull();
    expect(row!.isActive, 'isActive must be 1').toBe(1);
  }

  validateMobile(row: { mobileNo1: string } | null, expected: string): void {
    expect(row, 'Mobile record must exist in D010055').not.toBeNull();
    expect(row!.mobileNo1, `Mobile must be updated to ${expected}`).toBe(expected);
  }
}

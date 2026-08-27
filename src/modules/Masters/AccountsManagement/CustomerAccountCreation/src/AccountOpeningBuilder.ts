import { expect } from '@playwright/test';
import { AccountOpeningFormData } from './AccountOpeningPage';
import { AccountOpeningDbRow } from './AccountOpeningRepository';

export class AccountOpeningBuilder {
  from(row: Record<string, unknown>): AccountOpeningFormData {
    return row as AccountOpeningFormData;
  }
}

export class AccountOpeningValidator {
  validateCreated(toast: string): void {
    expect(toast, 'Success toast must appear after create').toBeTruthy();
  }

  validateUpdated(toast: string): void {
    expect(toast, 'Success toast must appear after update').toBeTruthy();
  }

  validateApproved(toast: string): void {
    expect(toast, 'Success toast must appear after approve').toBeTruthy();
  }

  validateRejected(toast: string): void {
    expect(toast, 'Success toast must appear after reject').toBeTruthy();
  }

  validateDbRecord(row: AccountOpeningDbRow | null, label: string): void {
    expect(row, `Account for ${label} must exist in DB`).not.toBeNull();
  }

  validateDbPending(row: AccountOpeningDbRow | null, accountNo: string): void {
    expect(row, `Account ${accountNo} must exist in DB after create`).not.toBeNull();
    expect(['U', 'P'], 'authStatus must be U or P after create').toContain(row!.authStatus);
  }

  validateDbAuthorized(row: AccountOpeningDbRow | null, accountNo: string): void {
    expect(row, `Account ${accountNo} must exist in DB after authorize`).not.toBeNull();
    expect(row!.authStatus, 'authStatus must be A after authorize').toBe('A');
  }
}

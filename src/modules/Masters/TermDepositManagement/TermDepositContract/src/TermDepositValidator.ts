import { expect } from '@playwright/test';
import { TdContractDbRow } from './TermDepositRepository';

export class TermDepositValidator {
  validateCreated(toast: string): void {
    expect(toast, 'TD contract success toast must appear').toBeTruthy();
  }

  validateDbRecord(row: TdContractDbRow | null, tdAcctId: string): void {
    expect(row, `TD contract ${tdAcctId} must exist in D020004`).not.toBeNull();
    expect(row!.isActive, 'isActive must be 1').toBe(1);
  }

  validateDbAuthorized(row: TdContractDbRow | null, tdAcctId: string): void {
    expect(row, `TD contract ${tdAcctId} must exist in D020004`).not.toBeNull();
    expect(row!.authStatus, 'authStatus must be A after authorize').toBe('A');
  }
}

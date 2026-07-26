import { expect } from '@playwright/test';
import { CustomerDbRow, CustomerAddressDbRow } from './CustomerCreationRepository';

export class CustomerCreationValidator {
  validateCreated(result: { success: boolean; customerNumber: string }): void {
    expect(result.success, 'Customer creation must succeed').toBe(true);
    expect(result.customerNumber, 'Customer number must be returned').toBeTruthy();
  }

  validateDbRecord(row: CustomerDbRow | null, custNo: string): void {
    expect(row, `Customer ${custNo} must exist in D009011`).not.toBeNull();
    expect(row!.authStatus, 'authStatus must be U (unauthorized) after create').toBe('U');
    expect(row!.isActive, 'isActive must be 1').toBe(1);
  }

  validateDbAuthorized(row: CustomerDbRow | null, custNo: string): void {
    expect(row, `Customer ${custNo} must exist in D009011`).not.toBeNull();
    expect(row!.authStatus, 'authStatus must be A after authorize').toBe('A');
  }

  validateAddress(row: CustomerAddressDbRow | null, custNo: string): void {
    expect(row, `Address for customer ${custNo} must exist in D010055`).not.toBeNull();
  }
}

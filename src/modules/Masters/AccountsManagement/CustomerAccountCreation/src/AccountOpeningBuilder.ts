import { expect } from '@playwright/test';
import { AccountOpeningFormData } from './AccountOpeningPage';
import { AccountOpeningDbRow } from './AccountOpeningRepository';

// ── All module/product/scheme combinations captured from live CBS (customer 1395042) ──
// Each entry = one account to create
export const ALL_MODULE_COMBINATIONS: AccountOpeningFormData[] = [
  // Module 11
  { moduleCode: '11', productCode: '1',     schemeCode: '1'    },
  { moduleCode: '11', productCode: '66',    schemeCode: '66'   },
  { moduleCode: '11', productCode: '90',    schemeCode: '01'   },
  { moduleCode: '11', productCode: '97',    schemeCode: '12'   },
  // Module 12
  { moduleCode: '12', productCode: '11',    schemeCode: '63'   },
  { moduleCode: '12', productCode: '121',   schemeCode: '11'   },
  { moduleCode: '12', productCode: '1001',  schemeCode: '1001' },
  { moduleCode: '12', productCode: '1818',  schemeCode: '1818' },
  // Module 13
  { moduleCode: '13', productCode: '1300',  schemeCode: '01'   },
  { moduleCode: '13', productCode: '23121', schemeCode: '01'   },
  { moduleCode: '13', productCode: '23131', schemeCode: '01'   },
  { moduleCode: '13', productCode: '23133', schemeCode: '11'   },
  // Module 14
  { moduleCode: '14', productCode: '15103', schemeCode: '01'   },
  { moduleCode: '14', productCode: '15104', schemeCode: '04'   },
  // Module 30
  { moduleCode: '30', productCode: '23101', schemeCode: '01'   },
  { moduleCode: '30', productCode: '23123', schemeCode: '01'   },
  { moduleCode: '30', productCode: '23151', schemeCode: '01'   },
  { moduleCode: '30', productCode: '23155', schemeCode: '01'   },
  // Module 47
  { moduleCode: '47', productCode: '47',    schemeCode: '99'   },
  { moduleCode: '47', productCode: '4747',  schemeCode: '01'   },
  { moduleCode: '47', productCode: '47001', schemeCode: '01'   },
  { moduleCode: '47', productCode: '55555', schemeCode: '01'   },
  // Module 99
  { moduleCode: '99', productCode: '991',   schemeCode: '01'   },
  { moduleCode: '99', productCode: '992',   schemeCode: '01'   },
  { moduleCode: '99', productCode: '11101', schemeCode: '01'   },
  { moduleCode: '99', productCode: '11133', schemeCode: '01'   },
];

export class AccountOpeningBuilder {
  private base: AccountOpeningFormData = {
    customerNumber: '1395042',
    nomineeYN:      'N',
  };

  forCombination(combo: AccountOpeningFormData): AccountOpeningFormData {
    return { ...this.base, ...combo };
  }

  buildAll(): AccountOpeningFormData[] {
    return ALL_MODULE_COMBINATIONS.map(c => this.forCombination(c));
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

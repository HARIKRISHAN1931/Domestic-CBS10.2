import { expect } from '@playwright/test';
import { AccountOpeningFormData } from './AccountOpeningPage';
import { AccountOpeningDbRow } from './AccountOpeningRepository';

const RUN_SUFFIX = Date.now().toString().slice(-6);

export class AccountOpeningBuilder {
  private data: AccountOpeningFormData = {
    // ── Defaults — update with captured values from live CBS PRDACNOMST screen ──
    customerId:      'CUST001',          // existing customer ID in CBS
    acType:          'SAVINGS',          // Select2 — exact option text (capture from live app)
    branchCode:      '101',              // F2 lookup — branch code
    openDate:        '01-01-2025',
    operMode:        '1',               // 1=Single, 2=Joint, etc.
    nomineeName:     `Nominee${RUN_SUFFIX}`,
    nomineeRelation: '1',               // native select value
    nomineeDob:      '01-01-1990',
    nomineeAddr:     '123 Test Street',
    remark:          `Auto test ${RUN_SUFFIX}`,
  };

  withCustomerId(v: string):      this { this.data.customerId      = v; return this; }
  withAcType(v: string):          this { this.data.acType          = v; return this; }
  withBranchCode(v: string):      this { this.data.branchCode      = v; return this; }
  withOpenDate(v: string):        this { this.data.openDate        = v; return this; }
  withMinBal(v: string):          this { this.data.minBal          = v; return this; }
  withOperMode(v: string):        this { this.data.operMode        = v; return this; }
  withNomineeName(v: string):     this { this.data.nomineeName     = v; return this; }
  withNomineeRelation(v: string): this { this.data.nomineeRelation = v; return this; }
  withNomineeDob(v: string):      this { this.data.nomineeDob      = v; return this; }
  withNomineeAddr(v: string):     this { this.data.nomineeAddr     = v; return this; }
  withRemark(v: string):          this { this.data.remark          = v; return this; }

  build(): AccountOpeningFormData { return { ...this.data }; }

  buildMandatoryOnly(): AccountOpeningFormData {
    return {
      customerId: 'CUST001',
      acType:     'SAVINGS',
      branchCode: '101',
      openDate:   '01-01-2025',
      operMode:   '1',
    };
  }

  buildJointAccount(): AccountOpeningFormData {
    return {
      ...this.data,
      operMode: '2',   // Joint
      remark:   `Joint account test ${RUN_SUFFIX}`,
    };
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

  validateDeleted(toast: string): void {
    expect(toast, 'Success toast must appear after delete').toBeTruthy();
  }

  validateDbRecord(row: AccountOpeningDbRow | null, customerId: string): void {
    expect(row, `Account for customer ${customerId} must exist in DB`).not.toBeNull();
  }

  validateDbPending(row: AccountOpeningDbRow | null, accountNo: string): void {
    expect(row, `Account ${accountNo} must exist in DB after create`).not.toBeNull();
    expect(['U', 'P'], 'authStatus must be U or P after create').toContain(row!.authStatus);
  }

  validateDbAuthorized(row: AccountOpeningDbRow | null, accountNo: string): void {
    expect(row, `Account ${accountNo} must exist in DB after authorize`).not.toBeNull();
    expect(row!.authStatus, 'authStatus must be A after authorize').toBe('A');
  }

  validateDbActive(row: AccountOpeningDbRow | null, accountNo: string): void {
    expect(row, `Account ${accountNo} must be active in DB`).not.toBeNull();
    expect(row!.isActive, 'isActive must be 1').toBe(1);
  }
}

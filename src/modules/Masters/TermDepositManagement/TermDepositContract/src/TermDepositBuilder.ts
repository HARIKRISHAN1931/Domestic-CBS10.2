import { expect } from '@playwright/test';
import { TDContractData } from './TermDepositPage';
import { TDContractDbRow } from './TermDepositRepository';

// ── Captured from live CBS (customer 1395042) ─────────────────────────────────
// Products available: 15530, 0808, 15430, 15330, 15509, 15409, 200, 202, 9090,
//                     1101, 567, 77777, 15502, 15402, 15501, 15302, 15401, 15301,
//                     50, 948, 15416, 15701
// All schemes return '01-GENERAL' for most products

export class TermDepositBuilder {
  private data: TDContractData = {
    customerCode:  '1395042',
    productCode:   '15501',       // FIXED DEPOSIT INDIVIDUAL
    schemeCode:    '01',          // GENERAL
    depositAmount: '10000',
    depositMonths: '12',
    modeOfOprn:    '1',           // EITHER OR SURVIVOR
    sourceOfFund:  '1',           // CHEQUE THROUGH TRANSACTION
    instrType:     '99',          // VOUCHER
    matNoticeYn:   'N',
    autoRenewYn:   'N',
    nomineeYn:     'N',
    sIDetailsYn:   'N',
    intPayOutInstrYn: 'N',
    matInstrYn:    'N',
  };

  withCustomer(v: string):       this { this.data.customerCode  = v; return this; }
  withProduct(v: string):        this { this.data.productCode   = v; return this; }
  withScheme(v: string):         this { this.data.schemeCode    = v; return this; }
  withAmount(v: string):         this { this.data.depositAmount = v; return this; }
  withMonths(v: string):         this { this.data.depositMonths = v; return this; }
  withDays(v: string):           this { this.data.depositDays   = v; return this; }
  withModeOfOprn(v: string):     this { this.data.modeOfOprn   = v; return this; }
  withSourceOfFund(v: string):   this { this.data.sourceOfFund  = v; return this; }
  withInstrType(v: string):      this { this.data.instrType     = v; return this; }
  withAutoRenew(v: 'Y' | 'N'):   this { this.data.autoRenewYn  = v; return this; }
  withNominee(v: 'Y' | 'N'):     this { this.data.nomineeYn    = v; return this; }
  withMatNotice(v: 'Y' | 'N'):   this { this.data.matNoticeYn  = v; return this; }
  withSpclInstr(v: string):      this { this.data.spclInstr     = v; return this; }

  build(): TDContractData { return { ...this.data }; }

  // Sanity — minimal mandatory fields only
  buildSanity(): TDContractData {
    return {
      customerCode:  '1395042',
      productCode:   '15501',
      schemeCode:    '01',
      depositAmount: '10000',
      depositMonths: '12',
      modeOfOprn:    '1',
      sourceOfFund:  '1',
      instrType:     '99',
      matNoticeYn:   'N',
      autoRenewYn:   'N',
      nomineeYn:     'N',
      sIDetailsYn:   'N',
      intPayOutInstrYn: 'N',
      matInstrYn:    'N',
    };
  }

  // Regression — with nominee
  buildWithNominee(): TDContractData {
    return {
      ...this.data,
      nomineeYn:        'Y',
      holderType:       '1',
      holderSalutation: '1',
      holderFName:      'Test',
      holderLName:      'Nominee',
      holderDOB:        '01-01-1990',
      holderRelWithCust: '7',   // FATHER
    };
  }

  // Regression — RD product
  buildRD(): TDContractData {
    return {
      ...this.data,
      productCode:   '15301',   // RECURING DEPOSIT INDIVIDUAL
      schemeCode:    '01',
      depositAmount: '1000',
      depositMonths: '24',
    };
  }

  // Regression — with auto renew
  buildAutoRenew(): TDContractData {
    return {
      ...this.data,
      productCode:  '15401',   // FIXED DEPOSIT INDIVIDUAL
      schemeCode:   '01',
      autoRenewYn:  'Y',
    };
  }
}

export class TermDepositValidator {
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

  validateDbRecord(row: TDContractDbRow | null, accountId: string): void {
    expect(row, `TD contract ${accountId} must exist in DB`).not.toBeNull();
  }

  validateDbPending(row: TDContractDbRow | null, accountId: string): void {
    expect(row, `TD contract ${accountId} must exist in DB after create`).not.toBeNull();
    expect(['U', 'P', '1'], 'depositStatus must be pending after create').toContain(row!.depositStatus);
  }

  validateDbAuthorized(row: TDContractDbRow | null, accountId: string): void {
    expect(row, `TD contract ${accountId} must be authorized in DB`).not.toBeNull();
    expect(row!.depositStatus, 'depositStatus must be 2 (AUTHORIZED) after authorize').toBe('2');
  }

  validateDbAmount(row: TDContractDbRow | null, expectedAmount: number): void {
    expect(row).not.toBeNull();
    expect(Number(row!.depositAmount), `depositAmount must be ${expectedAmount}`).toBe(expectedAmount);
  }
}

import { expect } from '@playwright/test';
import { LoanCollateralData, LoanSecurityData, LoanSuretyData } from './LoanMastersPage';
import { LoanLimitDbRow } from './LoanMastersRepository';

export class LoanCollateralBuilder {
  private data: LoanCollateralData = { memberCode: '' };
  withMember(v: string):     this { this.data.memberCode       = v; return this; }
  withType(v: string):       this { this.data.collateralType   = v; return this; }
  withSubType(v: string):    this { this.data.collateralSubType = v; return this; }
  withTag(v: string):        this { this.data.tag              = v; return this; }
  build(): LoanCollateralData { return { ...this.data }; }
}

export class LoanSecurityBuilder {
  private data: LoanSecurityData = { custId: '' };
  withCustomer(v: string):   this { this.data.custId        = v; return this; }
  withSecType(v: string):    this { this.data.securityType  = v; return this; }
  withTag(v: string):        this { this.data.tag           = v; return this; }
  build(): LoanSecurityData { return { ...this.data }; }
}

export class LoanSuretyBuilder {
  private data: LoanSuretyData = {
    accountNumber: '', customerNumber: '', customerpinCode: '',
    employerName: '', employerAddress1: '', employerpinCode: '',
  };
  withAccount(v: string):    this { this.data.accountNumber  = v; return this; }
  withCustomer(v: string):   this { this.data.customerNumber = v; return this; }
  withTag(v: string):        this { this.data.tag            = v; return this; }
  build(): LoanSuretyData { return { ...this.data }; }
}

export class LoanMastersValidator {
  validateCreated(toast: string): void {
    expect(toast, 'Loan master success toast must appear').toBeTruthy();
  }

  validateLoanLimit(row: LoanLimitDbRow | null, accountNumber: string): void {
    expect(row, `Loan limit for ${accountNumber} must exist in D030042`).not.toBeNull();
    expect(row!.authStatus, 'authStatus must be A').toBe('A');
  }
}

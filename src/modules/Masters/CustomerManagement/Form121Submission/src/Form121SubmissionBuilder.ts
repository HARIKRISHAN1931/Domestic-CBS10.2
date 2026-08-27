import { expect } from '@playwright/test';
import { Form121SubmissionData } from './Form121SubmissionPage';
import { Form121DbRow } from './Form121SubmissionRepository';

export class Form121SubmissionBuilder {
  private data: Form121SubmissionData = {
    memberCode:               '',      // Must be set to a valid authorized customer ID
    form121YN:                'Y',
    tdsYN:                    'N',
    submitDate:               '01-04-2024',
    form121FilledOtherBankYN: 'N',
    aggrIncome:               '50000',
    estIncome:                '50000',
    estimatedIncome:          '50000',
  };

  withMemberCode(v: string):               this { this.data.memberCode = v; return this; }
  withForm121YN(v: 'Y' | 'N'):             this { this.data.form121YN = v; return this; }
  withTdsYN(v: 'Y' | 'N'):                 this { this.data.tdsYN = v; return this; }
  withTDSReason(v: string):                this { this.data.TDSReason = v; return this; }
  withSubmitDate(v: string):               this { this.data.submitDate = v; return this; }
  withOtherBankYN(v: 'Y' | 'N'):          this { this.data.form121FilledOtherBankYN = v; return this; }
  withNoOf15GH(v: string):                 this { this.data.NoOf15GH = v; return this; }
  withAmtOf15GH(v: string):               this { this.data.amtOf15GHOthBnk = v; return this; }
  withAggrIncome(v: string):               this { this.data.aggrIncome = v; return this; }
  withEstIncome(v: string):                this { this.data.estIncome = v; this.data.estimatedIncome = v; return this; }

  build(): Form121SubmissionData { return { ...this.data }; }
}

export class Form121SubmissionValidator {
  validateCreated(toast: string): void {
    expect(toast, 'Success toast must appear after Form 121 create').toBeTruthy();
  }
  validateApproved(toast: string): void {
    expect(toast, 'Success toast must appear after Form 121 authorize').toBeTruthy();
  }
  validateUpdated(toast: string): void {
    expect(toast, 'Success toast must appear after Form 121 update').toBeTruthy();
  }
  validateDbRecord(row: Form121DbRow | null, memberCode: string): void {
    expect(row, `Form 121 record for memberCode ${memberCode} must exist in D020220`).not.toBeNull();
    expect(row!.authStatus, 'authStatus must be U after create').toBe('U');
  }
  validateDbAuthorized(row: Form121DbRow | null, memberCode: string): void {
    expect(row, `Form 121 record for memberCode ${memberCode} must exist in D020220`).not.toBeNull();
    expect(row!.authStatus, 'authStatus must be A after authorize').toBe('A');
  }
}

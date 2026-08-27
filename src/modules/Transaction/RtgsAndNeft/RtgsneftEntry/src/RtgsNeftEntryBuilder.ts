import { expect } from '@playwright/test';
import { RtgsNeftEntryData } from './RtgsNeftEntryPage';
import { StringHelper } from '../../../../../common/helpers/DataHelpers';

export class RtgsNeftEntryBuilder {
  private data: RtgsNeftEntryData = {
    msgTrfType:    '2',                          // 2=NEFT (default; override for RTGS)
    msgSType:      'N06',                        // N06=NEFT REQUEST OUTWARD
    msgDate:       '',                           // filled from Excel / today
    tBatchCd:      'TR',                         // TR=TRANSFER TRANSACTIONS
    ordIFSCCd:     'KKBK0000261',               // sample ordering IFSC
    ordDesc2:      'Automation Ordering Customer',
    mobileEmail:   '1',
    mobileNo:      StringHelper.generateMobile(),
    insType:       '99',                         // 99=VOUCHER
    valueAmt_txt:  '10000',
    benIFSCCd:     'SBIN0001234',               // sample beneficiary IFSC
    benDesc1:      StringHelper.randomNumeric(14),
    benDesc2:      'Automation Beneficiary',
    fldNo:         '7023',                       // 7023=PAYMENT DETAILS
    fld1:          'Automation test payment',
  };

  withType(msgTrfType: string, msgSType: string): this {
    this.data.msgTrfType = msgTrfType;
    this.data.msgSType   = msgSType;
    return this;
  }
  withDate(v: string):           this { this.data.msgDate       = v;  return this; }
  withBatch(v: string):          this { this.data.tBatchCd      = v;  return this; }
  withOrdIFSC(v: string):        this { this.data.ordIFSCCd     = v;  return this; }
  withOrdAccount(v: string):     this { this.data.ordAcctId     = v;  return this; }
  withOrdName(v: string):        this { this.data.ordDesc2      = v;  return this; }
  withAmount(v: string):         this { this.data.valueAmt_txt  = v;  return this; }
  withBenIFSC(v: string):        this { this.data.benIFSCCd     = v;  return this; }
  withBenAccount(v: string):     this { this.data.benDesc1      = v;  return this; }
  withBenName(v: string):        this { this.data.benDesc2      = v;  return this; }
  withMobile(v: string):         this { this.data.mobileNo      = v;  return this; }
  withRemarks(v: string):        this { this.data.fld1          = v;  return this; }

  buildNeft(): RtgsNeftEntryData {
    return { ...this.data, msgTrfType: '2', msgSType: 'N06' };
  }
  buildRtgs(): RtgsNeftEntryData {
    return { ...this.data, msgTrfType: '1', msgSType: 'R41', valueAmt_txt: this.data.valueAmt_txt ?? '200000' };
  }
  build(): RtgsNeftEntryData { return { ...this.data }; }
}

export class RtgsNeftEntryValidator {
  validateCreated(toast: string): void {
    expect(toast, 'Success toast must appear after RTGS/NEFT create').toBeTruthy();
  }
  validateApproved(toast: string): void {
    expect(toast, 'Success toast must appear after RTGS/NEFT authorize').toBeTruthy();
  }
  validateUpdated(toast: string): void {
    expect(toast, 'Success toast must appear after RTGS/NEFT update').toBeTruthy();
  }
  validateDbRecord(row: RtgsNeftDbRow | null, searchKey: string): void {
    expect(row,  `RTGS/NEFT record [${searchKey}] must exist in DB`).not.toBeNull();
    expect(row!.authStatus, 'authStatus must be U after create').toBe('U');
  }
  validateDbAuthorized(row: RtgsNeftDbRow | null, searchKey: string): void {
    expect(row,  `RTGS/NEFT record [${searchKey}] must exist in DB`).not.toBeNull();
    expect(row!.authStatus, 'authStatus must be A after authorize').toBe('A');
  }
}

export interface RtgsNeftDbRow {
  setNo:      string;
  scrollNo:   string;
  authStatus: string;
  isActive:   number;
  msgTrfType: string;
  valueAmt:   number;
}

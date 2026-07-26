import { faker } from '@faker-js/faker';
import { StringHelper, NumberHelper } from '../../../common/helpers/DataHelpers';
import { IMPSFormData } from './IMPSEntryPage';

export class IMPSEntryBuilder {
  private data: IMPSFormData = {
    debitAccountNumber: '',
    beneficiaryMobile: StringHelper.generateMobile(),
    beneficiaryMMID: StringHelper.randomNumeric(7),
    amount: NumberHelper.randomBetween(1, 200000),
    remarks: 'IMPS Automation Test',
  };

  withDebitAccount(v: string): this { this.data.debitAccountNumber = v; return this; }
  withBeneficiaryMobile(v: string): this { this.data.beneficiaryMobile = v; return this; }
  withBeneficiaryMMID(v: string): this { this.data.beneficiaryMMID = v; return this; }
  withAmount(v: number): this { this.data.amount = v; return this; }
  withRemarks(v: string): this { this.data.remarks = v; return this; }

  build(): IMPSFormData { return { ...this.data }; }
}

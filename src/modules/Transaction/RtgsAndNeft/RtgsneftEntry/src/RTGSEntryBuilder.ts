import { faker } from '@faker-js/faker';
import { StringHelper, NumberHelper } from '../../../common/helpers/DataHelpers';
import { RTGSFormData } from './RTGSEntryPage';

export class RTGSEntryBuilder {
  private data: RTGSFormData = {
    debitAccountNumber: '',
    beneficiaryName: faker.person.fullName(),
    beneficiaryAccountNumber: StringHelper.randomNumeric(14),
    beneficiaryIFSC: StringHelper.generateIFSC(),
    amount: NumberHelper.randomBetween(200000, 10000000),
    remarks: 'Automation Test Transfer',
  };

  withDebitAccount(v: string): this { this.data.debitAccountNumber = v; return this; }
  withBeneficiary(name: string, accountNumber: string, ifsc: string): this {
    this.data.beneficiaryName = name;
    this.data.beneficiaryAccountNumber = accountNumber;
    this.data.beneficiaryIFSC = ifsc;
    return this;
  }
  withAmount(v: number): this { this.data.amount = v; return this; }
  withRemarks(v: string): this { this.data.remarks = v; return this; }

  build(): RTGSFormData { return { ...this.data }; }
}

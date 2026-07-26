import { AccountType } from '../../../../common/enums/domain.enums';
import { AccountOpeningFormData } from './AccountOpeningPage';

export class AccountOpeningBuilder {
  private data: AccountOpeningFormData = {
    customerId: '',
    accountType: AccountType.Savings,
    branchCode: '001',
    initialDeposit: 10000,
  };

  withCustomerId(v: string): this { this.data.customerId = v; return this; }
  withAccountType(v: AccountType): this { this.data.accountType = v; return this; }
  withBranchCode(v: string): this { this.data.branchCode = v; return this; }
  withInitialDeposit(v: number): this { this.data.initialDeposit = v; return this; }
  withNominee(name: string, relation: string): this {
    this.data.nomineeName = name;
    this.data.nomineeRelation = relation;
    return this;
  }

  build(): AccountOpeningFormData { return { ...this.data }; }
}

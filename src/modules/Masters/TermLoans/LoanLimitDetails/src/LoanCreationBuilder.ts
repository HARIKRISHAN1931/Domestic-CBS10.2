import { NumberHelper } from '../../../common/helpers/DataHelpers';
import { LoanCreationFormData } from './LoanCreationPage';

export class LoanCreationBuilder {
  private data: LoanCreationFormData = {
    customerId: '',
    loanType: 'HOME_LOAN',
    loanAmount: NumberHelper.randomBetween(100000, 5000000),
    tenureMonths: 120,
    purpose: 'Home Purchase',
  };

  withCustomerId(v: string): this { this.data.customerId = v; return this; }
  withLoanType(v: string): this { this.data.loanType = v; return this; }
  withLoanAmount(v: number): this { this.data.loanAmount = v; return this; }
  withTenure(v: number): this { this.data.tenureMonths = v; return this; }
  withPurpose(v: string): this { this.data.purpose = v; return this; }

  build(): LoanCreationFormData { return { ...this.data }; }
}

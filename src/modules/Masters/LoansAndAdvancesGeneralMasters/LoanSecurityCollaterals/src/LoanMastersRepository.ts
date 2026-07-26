import { BaseRepository } from '../../../framework/base/BaseRepository';

export interface LoanLimitDbRow {
  prdAcctId:         string;
  loanAmount:        number;
  noOfInstallments:  number;
  frequency:         string;
  loanPaymentMethod: string;
  typeInterestRate:  number;
  authStatus:        string;
}

export interface LoanTransactionDbRow {
  prdAcctId:    string;
  srNo:         number;
  activityCode: string;
  amt:          number;
  narration:    string;
  trnDate:      string;
  authStatus:   string;
}

export class LoanMastersRepository extends BaseRepository {
  async findLoanLimitByAccount(accountNumber: string): Promise<LoanLimitDbRow | null> {
    return this.queryOne<LoanLimitDbRow>(
      `SELECT prdAcctId, loanAmount, noOfInstallments, frequency, loanPaymentMethod, typeInterestRate, authStatus
       FROM D030042 WHERE prdAcctId = @accountNumber AND authStatus = 'A' AND isActive = 1`,
      { accountNumber }
    );
  }

  async findLoanTransactionBySrNo(accountNumber: string, srNo: string): Promise<LoanTransactionDbRow | null> {
    return this.queryOne<LoanTransactionDbRow>(
      `SELECT prdAcctId, srNo, activityCode, amt, narration, trnDate, authStatus
       FROM D620005 WHERE prdAcctId = @accountNumber AND srNo = @srNo AND authStatus = 'A' AND isActive = 1`,
      { accountNumber, srNo }
    );
  }
}

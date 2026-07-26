import { BaseRepository } from '../../../framework/base/BaseRepository';

export interface TdContractDbRow {
  prdAcctId:     string;
  custNo:        number;
  depositAmt:    number;
  depositTerm:   number;
  termUnit:      string;
  repaymentMode: string;
  maturityAmt:   number;
  maturityDate:  string;
  authStatus:    string;
  isActive:      number;
  productCode:   string;
  schemeCode:    string;
  intRate:       number;
}

export interface TdInterestPayoutDbRow {
  prdAcctId:       string;
  srNo:            number;
  interestFreq:    string;
  paymentMode:     string;
  creditAcNo:      string;
  instrAmt:        number;
  instrPercentage: number;
  authStatus:      string;
  isActive:        number;
}

export interface TdMaturityDisposalDbRow {
  prdAcctId:       string;
  srNo:            number;
  rollOverType:    string;
  autoRollOver:    string;
  paymentMode:     string;
  creditAcNo:      string;
  instrAmt:        number;
  instrPercentage: number;
  authStatus:      string;
  isActive:        number;
}

export class TermDepositRepository extends BaseRepository {
  async findContractByAcct(tdAcctId: string): Promise<TdContractDbRow | null> {
    return this.queryOne<TdContractDbRow>(
      `SELECT prdAcctId, custNo, depositAmt, depositTerm, termUnit, repaymentMode,
              maturityAmt, maturityDate, authStatus, isActive, productCode, schemeCode, intRate
       FROM D020004 WHERE prdAcctId = @tdAcctId AND isActive = 1`,
      { tdAcctId }
    );
  }

  async findContractsByCustomer(customerCode: string): Promise<TdContractDbRow[]> {
    return this.query<TdContractDbRow>(
      `SELECT TOP 5 prdAcctId, custNo, depositAmt, depositTerm, termUnit, repaymentMode,
              maturityAmt, maturityDate, authStatus, isActive
       FROM D020004 WHERE custNo = @customerCode AND isActive = 1 ORDER BY prdAcctId DESC`,
      { customerCode }
    );
  }

  async findInterestPayout(tdAcctId: string): Promise<TdInterestPayoutDbRow | null> {
    return this.queryOne<TdInterestPayoutDbRow>(
      `SELECT TOP 1 prdAcctId, srNo, interestFreq, paymentMode, creditAcNo,
              instrAmt, instrPercentage, authStatus, isActive
       FROM D020006 WHERE prdAcctId = @tdAcctId AND isActive = 1`,
      { tdAcctId }
    );
  }

  async findMaturityDisposal(tdAcctId: string): Promise<TdMaturityDisposalDbRow | null> {
    return this.queryOne<TdMaturityDisposalDbRow>(
      `SELECT TOP 1 prdAcctId, srNo, rollOverType, autoRollOver, paymentMode, creditAcNo,
              instrAmt, instrPercentage, authStatus, isActive
       FROM D020007 WHERE prdAcctId = @tdAcctId AND isActive = 1`,
      { tdAcctId }
    );
  }
}

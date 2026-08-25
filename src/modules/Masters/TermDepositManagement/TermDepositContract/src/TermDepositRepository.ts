import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface TDContractDbRow {
  prdAcctId:     string;
  customerId:    string;
  productCode:   string;
  schemeCode:    string;
  depositAmount: number;
  depositMonths: number;
  depositDays:   number;
  openDate:      string;
  maturityDate:  string;
  depositStatus: string;   // 1=NOT AUTHORIZED 2=AUTHORIZED 3=FUNDS RECEIVED 4=MATURED 6=CLOSED 98=CANCELLED
  authStatus:    string;   // U=Unauthorized A=Authorized R=Rejected
  isActive:      number;
  branchCode:    string;
  applRate:      number;
  matAmount:     number;
}

export class TermDepositRepository extends BaseRepository {

  async findByAccountId(prdAcctId: string): Promise<TDContractDbRow | null> {
    return this.queryOne<TDContractDbRow>(
      `SELECT prdAcctId, customerId, productCode, schemeCode, depositAmount,
              depositMonths, depositDays, openDate, maturityDate, depositStatus,
              authStatus, isActive, branchCode, applRate, matAmount
         FROM D020004
        WHERE prdAcctId = @prdAcctId`,
      { prdAcctId }
    );
  }

  async findContractsByCustomer(customerId: string): Promise<TDContractDbRow[]> {
    return this.query<TDContractDbRow>(
      `SELECT prdAcctId, customerId, productCode, schemeCode, depositAmount,
              depositMonths, depositDays, openDate, maturityDate, depositStatus,
              authStatus, isActive, branchCode, applRate, matAmount
         FROM D020004
        WHERE customerId = @customerId AND isActive = 1
        ORDER BY openDate DESC`,
      { customerId }
    );
  }

  async findPending(): Promise<TDContractDbRow[]> {
    return this.query<TDContractDbRow>(
      `SELECT prdAcctId, customerId, productCode, schemeCode, depositAmount,
              depositMonths, depositDays, openDate, maturityDate, depositStatus,
              authStatus, isActive, branchCode, applRate, matAmount
         FROM D020004
        WHERE authStatus IN ('U','P') AND isActive = 1`
    );
  }

  async findAuthorized(prdAcctId: string): Promise<TDContractDbRow | null> {
    return this.queryOne<TDContractDbRow>(
      `SELECT prdAcctId, customerId, productCode, schemeCode, depositAmount,
              depositMonths, depositDays, openDate, maturityDate, depositStatus,
              authStatus, isActive, branchCode, applRate, matAmount
         FROM D020004
        WHERE prdAcctId = @prdAcctId AND authStatus = 'A' AND isActive = 1`,
      { prdAcctId }
    );
  }

  async findByProduct(productCode: string): Promise<TDContractDbRow[]> {
    return this.query<TDContractDbRow>(
      `SELECT prdAcctId, customerId, productCode, schemeCode, depositAmount,
              depositMonths, depositDays, openDate, maturityDate, depositStatus,
              authStatus, isActive, branchCode, applRate, matAmount
         FROM D020004
        WHERE productCode = @productCode AND isActive = 1`,
      { productCode }
    );
  }

  async countByCustomer(customerId: string): Promise<number> {
    const row = await this.queryOne<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM D020004 WHERE customerId = @customerId AND isActive = 1`,
      { customerId }
    );
    return row?.cnt ?? 0;
  }

  async countByStatus(depositStatus: string): Promise<number> {
    const row = await this.queryOne<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM D020004 WHERE depositStatus = @depositStatus AND isActive = 1`,
      { depositStatus }
    );
    return row?.cnt ?? 0;
  }
}

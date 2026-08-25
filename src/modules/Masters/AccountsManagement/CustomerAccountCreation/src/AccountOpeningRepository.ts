import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface AccountOpeningDbRow {
  accountNo:   string;
  customerId:  string;
  acType:      string;
  branchCode:  string;
  openDate:    string;
  authStatus:  string;   // U=Unauthorized P=Pending A=Authorized R=Rejected
  isActive:    number;   // 1=active 0=inactive
  operMode:    string;
  balance:     number;
}

export class AccountOpeningRepository extends BaseRepository {

  async findByAccountNo(accountNo: string): Promise<AccountOpeningDbRow | null> {
    return this.queryOne<AccountOpeningDbRow>(
      `SELECT accountNo, customerId, acType, branchCode, openDate,
              authStatus, isActive, operMode, balance
         FROM PRDACNOMST
        WHERE accountNo = @accountNo`,
      { accountNo }
    );
  }

  async findByCustomerId(customerId: string): Promise<AccountOpeningDbRow[]> {
    return this.query<AccountOpeningDbRow>(
      `SELECT accountNo, customerId, acType, branchCode, openDate,
              authStatus, isActive, operMode, balance
         FROM PRDACNOMST
        WHERE customerId = @customerId AND isActive = 1`,
      { customerId }
    );
  }

  async findPending(): Promise<AccountOpeningDbRow[]> {
    return this.query<AccountOpeningDbRow>(
      `SELECT accountNo, customerId, acType, branchCode, openDate,
              authStatus, isActive, operMode, balance
         FROM PRDACNOMST
        WHERE authStatus IN ('U','P') AND isActive = 1`
    );
  }

  async findAuthorized(accountNo: string): Promise<AccountOpeningDbRow | null> {
    return this.queryOne<AccountOpeningDbRow>(
      `SELECT accountNo, customerId, acType, branchCode, openDate,
              authStatus, isActive, operMode, balance
         FROM PRDACNOMST
        WHERE accountNo = @accountNo AND authStatus = 'A' AND isActive = 1`,
      { accountNo }
    );
  }

  async findByAcType(acType: string): Promise<AccountOpeningDbRow[]> {
    return this.query<AccountOpeningDbRow>(
      `SELECT accountNo, customerId, acType, branchCode, openDate,
              authStatus, isActive, operMode, balance
         FROM PRDACNOMST
        WHERE acType = @acType AND isActive = 1`,
      { acType }
    );
  }

  async countByAuthStatus(authStatus: string): Promise<number> {
    const row = await this.queryOne<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM PRDACNOMST WHERE authStatus = @authStatus AND isActive = 1`,
      { authStatus }
    );
    return row?.cnt ?? 0;
  }
}

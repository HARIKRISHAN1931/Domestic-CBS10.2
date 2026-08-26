import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface AccountOpeningDbRow {
  accountNo:   string;
  customerId:  string;
  moduleCode:  string;
  productCode: string;
  schemeCode:  string;
  branchCode:  string;
  openDate:    string;
  authStatus:  string;   // U=Unauthorized P=Pending A=Authorized R=Rejected
  isActive:    number;
  operMode:    string;
}

export class AccountOpeningRepository extends BaseRepository {

  async findByAccountNo(accountNo: string): Promise<AccountOpeningDbRow | null> {
    return this.queryOne<AccountOpeningDbRow>(
      `SELECT accountNo, customerId, moduleCode, productCode, schemeCode,
              branchCode, openDate, authStatus, isActive, operMode
         FROM PRDACNOMST
        WHERE accountNo = @accountNo`,
      { accountNo }
    );
  }

  async findByCustomerId(customerId: string): Promise<AccountOpeningDbRow[]> {
    return this.query<AccountOpeningDbRow>(
      `SELECT accountNo, customerId, moduleCode, productCode, schemeCode,
              branchCode, openDate, authStatus, isActive, operMode
         FROM PRDACNOMST
        WHERE customerId = @customerId AND isActive = 1`,
      { customerId }
    );
  }

  async findByModuleProduct(moduleCode: string, productCode: string): Promise<AccountOpeningDbRow[]> {
    return this.query<AccountOpeningDbRow>(
      `SELECT accountNo, customerId, moduleCode, productCode, schemeCode,
              branchCode, openDate, authStatus, isActive, operMode
         FROM PRDACNOMST
        WHERE moduleCode = @moduleCode AND productCode = @productCode AND isActive = 1`,
      { moduleCode, productCode }
    );
  }

  async findPending(): Promise<AccountOpeningDbRow[]> {
    return this.query<AccountOpeningDbRow>(
      `SELECT accountNo, customerId, moduleCode, productCode, schemeCode,
              branchCode, openDate, authStatus, isActive, operMode
         FROM PRDACNOMST
        WHERE authStatus IN ('U','P') AND isActive = 1`
    );
  }

  async findAuthorized(accountNo: string): Promise<AccountOpeningDbRow | null> {
    return this.queryOne<AccountOpeningDbRow>(
      `SELECT accountNo, customerId, moduleCode, productCode, schemeCode,
              branchCode, openDate, authStatus, isActive, operMode
         FROM PRDACNOMST
        WHERE accountNo = @accountNo AND authStatus = 'A' AND isActive = 1`,
      { accountNo }
    );
  }

  async countByCustomer(customerId: string): Promise<number> {
    const row = await this.queryOne<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM PRDACNOMST WHERE customerId = @customerId AND isActive = 1`,
      { customerId }
    );
    return row?.cnt ?? 0;
  }
}

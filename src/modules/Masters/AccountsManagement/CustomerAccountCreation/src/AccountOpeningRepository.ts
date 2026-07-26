import { BaseRepository } from '../../../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../../../framework/database/DatabaseConnectionManager';

interface AccountRecord {
  accountNumber: string;
  customerId: string;
  accountType: string;
  branchCode: string;
  balance: number;
  status: string;
}

export class AccountOpeningRepository extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findByAccountNumber(accountNumber: string): Promise<AccountRecord | null> {
    return this.queryOne<AccountRecord>(
      'SELECT AccountNumber, CustomerId, AccountType, BranchCode, Balance, Status FROM CBS_ACCOUNTS WHERE AccountNumber = @accountNumber',
      { accountNumber },
    );
  }

  async findByCustomerId(customerId: string): Promise<AccountRecord[]> {
    return this.query<AccountRecord>(
      'SELECT AccountNumber, CustomerId, AccountType, BranchCode, Balance, Status FROM CBS_ACCOUNTS WHERE CustomerId = @customerId',
      { customerId },
    );
  }

  async deleteTestAccount(accountNumber: string): Promise<void> {
    await this.execute(
      'DELETE FROM CBS_ACCOUNTS WHERE AccountNumber = @accountNumber AND CreatedBy = @createdBy',
      { accountNumber, createdBy: 'AUTOMATION' },
    );
  }
}

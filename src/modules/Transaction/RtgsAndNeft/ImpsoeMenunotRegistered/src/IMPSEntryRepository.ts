import { BaseRepository } from '../../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';

interface IMPSRecord {
  transactionRef: string;
  debitAccountNumber: string;
  amount: number;
  status: string;
}

export class IMPSEntryRepository extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findByTransactionRef(transactionRef: string): Promise<IMPSRecord | null> {
    return this.queryOne<IMPSRecord>(
      'SELECT TransactionRef, DebitAccountNumber, Amount, Status FROM CBS_IMPS_TRANSACTIONS WHERE TransactionRef = @transactionRef',
      { transactionRef },
    );
  }

  async deleteTestTransaction(transactionRef: string): Promise<void> {
    await this.execute(
      'DELETE FROM CBS_IMPS_TRANSACTIONS WHERE TransactionRef = @transactionRef AND CreatedBy = @createdBy',
      { transactionRef, createdBy: 'AUTOMATION' },
    );
  }
}

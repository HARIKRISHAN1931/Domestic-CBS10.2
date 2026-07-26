import { BaseRepository } from '../../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';

interface NEFTRecord {
  transactionRef: string;
  debitAccountNumber: string;
  amount: number;
  status: string;
}

export class NEFTEntryRepository extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findByTransactionRef(transactionRef: string): Promise<NEFTRecord | null> {
    return this.queryOne<NEFTRecord>(
      'SELECT TransactionRef, DebitAccountNumber, Amount, Status FROM CBS_NEFT_TRANSACTIONS WHERE TransactionRef = @transactionRef',
      { transactionRef },
    );
  }

  async deleteTestTransaction(transactionRef: string): Promise<void> {
    await this.execute(
      'DELETE FROM CBS_NEFT_TRANSACTIONS WHERE TransactionRef = @transactionRef AND CreatedBy = @createdBy',
      { transactionRef, createdBy: 'AUTOMATION' },
    );
  }
}

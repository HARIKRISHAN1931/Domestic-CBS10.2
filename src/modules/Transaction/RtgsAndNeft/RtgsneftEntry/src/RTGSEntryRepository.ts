import { BaseRepository } from '../../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';

interface RTGSRecord {
  transactionRef: string;
  debitAccountNumber: string;
  amount: number;
  status: string;
  beneficiaryIFSC: string;
}

export class RTGSEntryRepository extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findByTransactionRef(transactionRef: string): Promise<RTGSRecord | null> {
    return this.queryOne<RTGSRecord>(
      'SELECT TransactionRef, DebitAccountNumber, Amount, Status, BeneficiaryIFSC FROM CBS_RTGS_TRANSACTIONS WHERE TransactionRef = @transactionRef',
      { transactionRef },
    );
  }

  async deleteTestTransaction(transactionRef: string): Promise<void> {
    await this.execute(
      'DELETE FROM CBS_RTGS_TRANSACTIONS WHERE TransactionRef = @transactionRef AND CreatedBy = @createdBy',
      { transactionRef, createdBy: 'AUTOMATION' },
    );
  }
}

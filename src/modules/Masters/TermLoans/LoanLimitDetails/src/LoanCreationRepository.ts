import { BaseRepository } from '../../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';

interface LoanRecord {
  loanId: string;
  customerId: string;
  loanAmount: number;
  tenureMonths: number;
  status: string;
}

export class LoanCreationRepository extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findByLoanId(loanId: string): Promise<LoanRecord | null> {
    return this.queryOne<LoanRecord>(
      'SELECT LoanId, CustomerId, LoanAmount, TenureMonths, Status FROM CBS_LOANS WHERE LoanId = @loanId',
      { loanId },
    );
  }

  async deleteTestLoan(loanId: string): Promise<void> {
    await this.execute(
      'DELETE FROM CBS_LOANS WHERE LoanId = @loanId AND CreatedBy = @createdBy',
      { loanId, createdBy: 'AUTOMATION' },
    );
  }
}

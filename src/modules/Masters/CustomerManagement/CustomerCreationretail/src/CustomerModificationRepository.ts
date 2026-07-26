import { BaseRepository } from '../../../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../../../framework/database/DatabaseConnectionManager';

interface CustomerRecord {
  customerId: string;
  mobileNumber: string;
  email: string;
  status: string;
}

export class CustomerModificationRepository extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findByCustomerId(customerId: string): Promise<CustomerRecord | null> {
    return this.queryOne<CustomerRecord>(
      'SELECT CustomerId, MobileNumber, Email, Status FROM CBS_CUSTOMERS WHERE CustomerId = @customerId',
      { customerId },
    );
  }
}

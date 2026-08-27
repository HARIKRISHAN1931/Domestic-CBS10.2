import { BaseRepository } from '../../../../../framework/base/BaseRepository';
import { CustomerDbRow } from './CustomerCreationRepository';

export class CustomerModificationRepository extends BaseRepository {
  async findByCustomerNumber(custNo: string): Promise<CustomerDbRow | null> {
    return this.queryOne<CustomerDbRow>(
      `SELECT custNo, custName, authStatus, isActive FROM D009011 WHERE custNo = @custNo AND isActive = 1`,
      { custNo }
    );
  }

  async findMobile(custNo: string): Promise<{ mobileNo1: string } | null> {
    return this.queryOne<{ mobileNo1: string }>(
      `SELECT mobileNo1 FROM D010055 WHERE custNo = @custNo AND isActive = 1`,
      { custNo }
    );
  }

  async findEmail(custNo: string): Promise<{ emailId: string } | null> {
    return this.queryOne<{ emailId: string }>(
      `SELECT emailId FROM D010055 WHERE custNo = @custNo AND isActive = 1`,
      { custNo }
    );
  }
}

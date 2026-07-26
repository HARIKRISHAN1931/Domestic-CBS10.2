import { BaseRepository } from '../../../../framework/base/BaseRepository';

export interface CustomerDbRow {
  custNo:     number;
  custName:   string;
  authStatus: string;
  isActive:   number;
}

export interface CustomerAddressDbRow {
  custNo:      number;
  address1:    string;
  countryCode: string;
  stateCode:   string;
  pinCode:     string;
  authStatus:  string;
}

export interface CustomerDocDbRow {
  custNo:     number;
  docType:    string;
  docNo:      string;
  authStatus: string;
}

export class CustomerCreationRepository extends BaseRepository {
  async findByCustomerNumber(custNo: string): Promise<CustomerDbRow | null> {
    return this.queryOne<CustomerDbRow>(
      `SELECT custNo, custName, authStatus, isActive FROM D009011 WHERE custNo = @custNo AND isActive = 1`,
      { custNo }
    );
  }

  async findAddress(custNo: string): Promise<CustomerAddressDbRow | null> {
    return this.queryOne<CustomerAddressDbRow>(
      `SELECT custNo, address1, countryCode, stateCode, pinCode, authStatus FROM D010055 WHERE custNo = @custNo AND isActive = 1`,
      { custNo }
    );
  }

  async findDocuments(custNo: string): Promise<CustomerDocDbRow[]> {
    return this.query<CustomerDocDbRow>(
      `SELECT custNo, docType, docNo, authStatus FROM D009193 WHERE custNo = @custNo AND isActive = 1`,
      { custNo }
    );
  }

  async deleteTestCustomer(custNo: string): Promise<void> {
    await this.execute(`DELETE FROM D009011 WHERE custNo = @custNo AND authStatus = 'U'`, { custNo });
  }
}

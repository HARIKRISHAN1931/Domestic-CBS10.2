import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface CorporateCustomerDbRow {
  memberId:       string;
  memberFName:    string;
  authStatus:     string;
  isActive:       number;
  mobileNo1:      string;
  emailId:        string;
  pan:            string;
  customerBranch: string;
}

export class CorporateCustomerRepository extends BaseRepository {
  async findByName(name: string): Promise<CorporateCustomerDbRow | null> {
    return this.queryOne<CorporateCustomerDbRow>(
      `SELECT TOP 1 memberId, memberFName, authStatus, isActive, mobileNo1, emailId, pan, customerBranch
       FROM memberMaster WHERE memberFName = @name AND customerType = '2' ORDER BY createdDate DESC`,
      { name }
    );
  }

  async findByMobile(mobile: string): Promise<CorporateCustomerDbRow | null> {
    return this.queryOne<CorporateCustomerDbRow>(
      `SELECT TOP 1 memberId, memberFName, authStatus, isActive, mobileNo1, emailId, pan, customerBranch
       FROM memberMaster WHERE mobileNo1 = @mobile AND customerType = '2'`,
      { mobile }
    );
  }

  async findById(memberId: string): Promise<CorporateCustomerDbRow | null> {
    return this.queryOne<CorporateCustomerDbRow>(
      `SELECT memberId, memberFName, authStatus, isActive, mobileNo1, emailId, pan, customerBranch
       FROM memberMaster WHERE memberId = @memberId`,
      { memberId }
    );
  }
}

import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface UserMasterDbRow {
  loginId:    string;
  userName:   string;
  empId:      string;
  emailId:    string;
  authStatus: string;   // U=Unauthorized P=Pending A=Authorized R=Rejected
  isActive:   number;   // 1=active 0=inactive
  userType:   string;   // INTERNAL/EXTERNAL/WEBUSER
  branchCode: string;
  roleCode:   string;
  dept:       string;
  gender:     string;
}

export class UserMasterRepository extends BaseRepository {

  async findById(loginId: string): Promise<UserMasterDbRow | null> {
    return this.queryOne<UserMasterDbRow>(
      `SELECT loginId, userName, empId, emailId, authStatus, isActive,
              userType, branchCode, roleCode, dept, gender
         FROM USERMASTER
        WHERE loginId = @loginId`,
      { loginId }
    );
  }

  async findByEmail(emailId: string): Promise<UserMasterDbRow | null> {
    return this.queryOne<UserMasterDbRow>(
      `SELECT loginId, userName, empId, emailId, authStatus, isActive,
              userType, branchCode, roleCode, dept, gender
         FROM USERMASTER
        WHERE emailId = @emailId AND isActive = 1`,
      { emailId }
    );
  }

  async findPending(): Promise<UserMasterDbRow[]> {
    return this.query<UserMasterDbRow>(
      `SELECT loginId, userName, empId, emailId, authStatus, isActive,
              userType, branchCode, roleCode, dept, gender
         FROM USERMASTER
        WHERE authStatus IN ('U','P') AND isActive = 1`
    );
  }

  async findAuthorized(loginId: string): Promise<UserMasterDbRow | null> {
    return this.queryOne<UserMasterDbRow>(
      `SELECT loginId, userName, empId, emailId, authStatus, isActive,
              userType, branchCode, roleCode, dept, gender
         FROM USERMASTER
        WHERE loginId = @loginId AND authStatus = 'A' AND isActive = 1`,
      { loginId }
    );
  }

  async findByUserType(userType: string): Promise<UserMasterDbRow[]> {
    return this.query<UserMasterDbRow>(
      `SELECT loginId, userName, empId, emailId, authStatus, isActive,
              userType, branchCode, roleCode, dept, gender
         FROM USERMASTER
        WHERE userType = @userType AND isActive = 1`,
      { userType }
    );
  }

  async countByAuthStatus(authStatus: string): Promise<number> {
    const row = await this.queryOne<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM USERMASTER WHERE authStatus = @authStatus AND isActive = 1`,
      { authStatus }
    );
    return row?.cnt ?? 0;
  }
}

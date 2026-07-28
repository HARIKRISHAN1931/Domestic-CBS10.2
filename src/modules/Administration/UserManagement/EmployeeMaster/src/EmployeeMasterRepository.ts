import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface EmployeeMasterDbRow {
  empId:      string;
  empName:    string;
  empFName:   string;
  empLName:   string;
  authStatus: string;   // U=Unauthorized P=Pending A=Authorized R=Rejected
  isActive:   number;   // 1=active 0=inactive
  joinDate:   string;
  dept:       string;
  empStatus:  string;   // 1=Active 2=Suspended 3=Retired 4=Transferred
  gender:     string;   // 1=FEMALE 2=MALE 3=TRANSGENDER
  mobile:     string;
  email:      string;
}

export class EmployeeMasterRepository extends BaseRepository {

  async findById(empId: string): Promise<EmployeeMasterDbRow | null> {
    return this.queryOne<EmployeeMasterDbRow>(
      `SELECT empId, empName, empFName, empLName, authStatus, isActive,
              joinDate, dept, empStatus, gender, mobile, email
         FROM EMPLOYEEMASTER
        WHERE empId = @empId`,
      { empId }
    );
  }

  async findByName(empName: string): Promise<EmployeeMasterDbRow | null> {
    return this.queryOne<EmployeeMasterDbRow>(
      `SELECT empId, empName, empFName, empLName, authStatus, isActive,
              joinDate, dept, empStatus, gender, mobile, email
         FROM EMPLOYEEMASTER
        WHERE empName LIKE @empName AND isActive = 1`,
      { empName: `%${empName}%` }
    );
  }

  async findPending(): Promise<EmployeeMasterDbRow[]> {
    return this.query<EmployeeMasterDbRow>(
      `SELECT empId, empName, empFName, empLName, authStatus, isActive,
              joinDate, dept, empStatus, gender, mobile, email
         FROM EMPLOYEEMASTER
        WHERE authStatus IN ('U','P') AND isActive = 1`
    );
  }

  async findAuthorized(empId: string): Promise<EmployeeMasterDbRow | null> {
    return this.queryOne<EmployeeMasterDbRow>(
      `SELECT empId, empName, empFName, empLName, authStatus, isActive,
              joinDate, dept, empStatus, gender, mobile, email
         FROM EMPLOYEEMASTER
        WHERE empId = @empId AND authStatus = 'A' AND isActive = 1`,
      { empId }
    );
  }

  async findByStatus(empStatus: string): Promise<EmployeeMasterDbRow[]> {
    return this.query<EmployeeMasterDbRow>(
      `SELECT empId, empName, empFName, empLName, authStatus, isActive,
              joinDate, dept, empStatus, gender, mobile, email
         FROM EMPLOYEEMASTER
        WHERE empStatus = @empStatus AND isActive = 1`,
      { empStatus }
    );
  }

  async findByDept(dept: string): Promise<EmployeeMasterDbRow[]> {
    return this.query<EmployeeMasterDbRow>(
      `SELECT empId, empName, empFName, empLName, authStatus, isActive,
              joinDate, dept, empStatus, gender, mobile, email
         FROM EMPLOYEEMASTER
        WHERE dept LIKE @dept AND isActive = 1`,
      { dept: `%${dept}%` }
    );
  }

  async countByAuthStatus(authStatus: string): Promise<number> {
    const row = await this.queryOne<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM EMPLOYEEMASTER WHERE authStatus = @authStatus AND isActive = 1`,
      { authStatus }
    );
    return row?.cnt ?? 0;
  }

  async findByEmail(email: string): Promise<EmployeeMasterDbRow | null> {
    return this.queryOne<EmployeeMasterDbRow>(
      `SELECT empId, empName, empFName, empLName, authStatus, isActive,
              joinDate, dept, empStatus, gender, mobile, email
         FROM EMPLOYEEMASTER
        WHERE email = @email AND isActive = 1`,
      { email }
    );
  }
}

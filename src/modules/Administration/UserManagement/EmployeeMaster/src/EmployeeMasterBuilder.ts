import { expect } from '@playwright/test';
import { EmployeeMasterData } from './EmployeeMasterPage';
import { EmployeeMasterDbRow } from './EmployeeMasterRepository';

// Per-run unique suffix — prevents duplicate Employee ID on repeated runs
const RUN_SUFFIX = Date.now().toString().slice(-6);

// ── Salutation → Gender mapping (mirrors application logic) ──────────────────
// MR(1)=MALE  MRS(2)=FEMALE  MISS(3)=FEMALE  THE(6)=MALE  KUMARI(7)=FEMALE
// MAST(8)=MALE  SHRI(9)=MALE  SMT(10)=FEMALE  MX(11)=TRANSGENDER
export const SALUTATION_GENDER_MAP: Record<string, string> = {
  '1': '2',   // MR → MALE
  '2': '1',   // MRS → FEMALE
  '3': '1',   // MISS → FEMALE
  '6': '2',   // THE → MALE
  '7': '1',   // KUMARI → FEMALE
  '8': '2',   // MAST → MALE
  '9': '2',   // SHRI → MALE
  '10': '1',  // SMT → FEMALE
  '11': '3',  // MX → TRANSGENDER
};

export class EmployeeMasterBuilder {
  private data: EmployeeMasterData = {
    // ── Captured from live CBS app 2026-07-28 ──────────────────────────────────
    empId:          `EMP${RUN_SUFFIX}`,
    userSalutation: '1',              // MR → gender auto-set MALE(2) by app
    empFName:       'Test',
    empMName:       'T',
    empLName:       'Employee',
    designation:    '1 -BANK BRANCH MANAGER', // Select2 — exact option text (captured)
    joinDate:       '01-01-2025',
    birthDate:      '01-01-1999',
    // gender intentionally omitted — auto-fetched from salutation
    employmentType: '1',              // Permanent
    bloodGroup:     '1',              // A+
    education:      '4',              // POST GRADUATE
    religion:       '1',              // HINDU
    caste:          '1',              // value=1 (captured)
    subCaste:       '1',              // value=1 (captured)
    status:         '1',              // Active
    retireDate:     '31-01-2059',
    postBr:         '101',             // F2 lookup — search by branch code
    repoMngr:       'demo1',           // F2 lookup — search by user ID
    dept:           '10-ADMINISTRATION', // Select2 — exact option text
    maritalStatus:  '1-UNMARRIED',        // Select2 — exact option text
    idProof:        '1',              // AADHAR
    idNumber:       `9857${RUN_SUFFIX}8797`,
    issueDate:      '13-07-2016',
    docIssuedBy:    '8',              // UIDAI
    idProofName:    'Test Employee',
    addrIdType:     '1',              // AADHAR
    addrIdNo:       `9857${RUN_SUFFIX}8797`,
    address1:       '123 Main Street',
    address2:       'Near Park',
    address3:       'Hyderabad',
    country:        'IND',
    state:          '19-WEST BENGAL',    // Select2 — exact option text (captured)
    city:           '306',            // value=306 (captured — numeric)
    postalCode:     '505001',
    email:          `test.emp${RUN_SUFFIX}@bank.com`,
    mobile:         '9876543210',
    // Upload Document & Address Proof — dummy white PNG
    docUpload:      require('path').resolve(__dirname, '../data/test-doc.png'),
    docUpload1:     require('path').resolve(__dirname, '../data/test-doc.png'),
  };

  // ── Fluent setters ────────────────────────────────────────────────────────────
  withEmpId(v: string):           this { this.data.empId           = v; return this; }
  withSalutation(v: string):      this { this.data.userSalutation  = v; return this; }
  withFirstName(v: string):       this { this.data.empFName        = v; return this; }
  withMiddleName(v: string):      this { this.data.empMName        = v; return this; }
  withLastName(v: string):        this { this.data.empLName        = v; return this; }
  withDesignation(v: string):     this { this.data.designation     = v; return this; }
  withJoinDate(v: string):        this { this.data.joinDate        = v; return this; }
  withBirthDate(v: string):       this { this.data.birthDate       = v; return this; }
  withEmploymentType(v: string):  this { this.data.employmentType  = v; return this; }
  withBloodGroup(v: string):      this { this.data.bloodGroup      = v; return this; }
  withEducation(v: string):       this { this.data.education       = v; return this; }
  withReligion(v: string):        this { this.data.religion        = v; return this; }
  withCaste(v: string):           this { this.data.caste           = v; return this; }
  withSubCaste(v: string):        this { this.data.subCaste        = v; return this; }
  withStatus(v: string):          this { this.data.status          = v; return this; }
  withRetireDate(v: string):      this { this.data.retireDate      = v; return this; }
  withRemark(v: string):          this { this.data.remark          = v; return this; }
  withPostBr(v: string):          this { this.data.postBr          = v; return this; }
  withDept(v: string):            this { this.data.dept            = v; return this; }
  withRepoMngr(v: string):        this { this.data.repoMngr        = v; return this; }
  withMaritalStatus(v: string):   this { this.data.maritalStatus   = v; return this; }
  withSpouseName(v: string):      this { this.data.empSpouseName   = v; return this; }
  withIdProof(v: string):         this { this.data.idProof         = v; return this; }
  withIdNumber(v: string):        this { this.data.idNumber        = v; return this; }
  withAddress1(v: string):        this { this.data.address1        = v; return this; }
  withAddress2(v: string):        this { this.data.address2        = v; return this; }
  withAddress3(v: string):        this { this.data.address3        = v; return this; }
  withPostalCode(v: string):      this { this.data.postalCode      = v; return this; }
  withEmail(v: string):           this { this.data.email           = v; return this; }
  withMobile(v: string):          this { this.data.mobile          = v; return this; }
  withOfficeTelephone(v: string): this { this.data.officeTelephone = v; return this; }

  build(): EmployeeMasterData { return { ...this.data }; }

  /** Only the 3 mandatory fields — used for negative/boundary tests */
  buildMandatoryOnly(): EmployeeMasterData {
    return { empId: this.data.empId, empFName: this.data.empFName, joinDate: this.data.joinDate };
  }

  /** Female employee — salutation MRS, app will auto-set gender to FEMALE */
  buildFemale(): EmployeeMasterData {
    return {
      ...this.data,
      empId:          `EMPF${RUN_SUFFIX}`,
      userSalutation: '2',   // MRS → FEMALE
      empFName:       'Priya',
      empLName:       'Sharma',
      email:          `priya.emp${RUN_SUFFIX}@bank.com`,
    };
  }

  /** Retainer employee */
  buildRetainer(): EmployeeMasterData {
    return {
      ...this.data,
      empId:          `EMPR${RUN_SUFFIX}`,
      employmentType: '2',   // Retainer
      email:          `retainer.emp${RUN_SUFFIX}@bank.com`,
    };
  }

  /** Married employee — includes spouse name */
  buildMarried(): EmployeeMasterData {
    return {
      ...this.data,
      empId:          `EMPM${RUN_SUFFIX}`,
      maritalStatus:  'MARRIED',
      empSpouseName:  'Spouse Name',
      email:          `married.emp${RUN_SUFFIX}@bank.com`,
    };
  }

  /** Retired employee — includes retirement date */
  buildRetired(): EmployeeMasterData {
    return {
      ...this.data,
      empId:          `EMPRET${RUN_SUFFIX}`,
      status:         '3',   // Retired
      retireDate:     '01-01-2024',
      email:          `retired.emp${RUN_SUFFIX}@bank.com`,
    };
  }
}

export class EmployeeMasterValidator {
  validateCreated(toast: string): void {
    expect(toast, 'Success toast must appear after create').toBeTruthy();
  }

  validateUpdated(toast: string): void {
    expect(toast, 'Success toast must appear after update').toBeTruthy();
  }

  validateApproved(toast: string): void {
    expect(toast, 'Success toast must appear after approve').toBeTruthy();
  }

  validateRejected(toast: string): void {
    expect(toast, 'Success toast must appear after reject').toBeTruthy();
  }

  validateDeleted(toast: string): void {
    expect(toast, 'Success toast must appear after delete').toBeTruthy();
  }

  validateDbRecord(row: EmployeeMasterDbRow | null, empId: string): void {
    expect(row,  `Employee ${empId} must exist in DB`).not.toBeNull();
  }

  validateDbPending(row: EmployeeMasterDbRow | null, empId: string): void {
    expect(row,  `Employee ${empId} must exist in DB after create`).not.toBeNull();
    expect(['U', 'P'], `authStatus must be U or P after create`).toContain(row!.authStatus);
  }

  validateDbAuthorized(row: EmployeeMasterDbRow | null, empId: string): void {
    expect(row,  `Employee ${empId} must exist in DB after authorize`).not.toBeNull();
    expect(row!.authStatus, 'authStatus must be A after authorize').toBe('A');
  }

  validateDbActive(row: EmployeeMasterDbRow | null, empId: string): void {
    expect(row,  `Employee ${empId} must be active in DB`).not.toBeNull();
    expect(row!.isActive, 'isActive must be 1').toBe(1);
  }

  validateDbDept(row: EmployeeMasterDbRow | null, expectedDept: string): void {
    expect(row).not.toBeNull();
    expect(row!.dept, `dept must be ${expectedDept}`).toContain(expectedDept);
  }

  validateDbStatus(row: EmployeeMasterDbRow | null, expectedStatus: string): void {
    expect(row).not.toBeNull();
    expect(row!.empStatus, `empStatus must be ${expectedStatus}`).toBe(expectedStatus);
  }
}

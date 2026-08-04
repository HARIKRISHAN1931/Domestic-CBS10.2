import { expect } from '@playwright/test';
import { UserMasterData } from './UserMasterPage';
import { UserMasterDbRow } from './UserMasterRepository';

const RUN_SUFFIX = Date.now().toString().slice(-6);

export class UserMasterBuilder {
  private data: UserMasterData = {
    loginId:            `USR${RUN_SUFFIX}`,       // unique per run, maxlen=10
    employeeId:         '4567',                    // NABAGOPAL SAI DIPTI SAI — available in CBS QA
    roleCode:           '1',                       // Infraadmin — first role in CBS
    userBaseBranchCode: '101',                     // BURDWAN MAIN BRANCH
    userSalutation:     '1',                       // MR → gender auto MALE
    userFName:          'Test',
    userMName:          'T',
    userLName:          'User',
    userDisplayName:    `TST${RUN_SUFFIX}`,
    userTypeCode:       'INTERNAL',
    preferLang:         '1',                       // English
    mobileNo1:          `9${RUN_SUFFIX}`,
    emailId:            `test.usr${RUN_SUFFIX}@bank.com`,
    hnwCategory:        '3',                       // NORMAL
    mulBranchAcccess:   'N',
    allowConcurrentLogin: 'N',
    forcePwdChg:        'Y',
    docUpload:          require('path').resolve(__dirname, '../data/test-doc.png'),
  };

  withLoginId(v: string):            this { this.data.loginId            = v; return this; }
  withEmployeeId(v: string):         this { this.data.employeeId         = v; return this; }
  withRoleCode(v: string):           this { this.data.roleCode           = v; return this; }
  withBranchCode(v: string):         this { this.data.userBaseBranchCode = v; return this; }
  withSalutation(v: string):         this { this.data.userSalutation     = v; return this; }
  withFirstName(v: string):          this { this.data.userFName          = v; return this; }
  withMiddleName(v: string):         this { this.data.userMName          = v; return this; }
  withLastName(v: string):           this { this.data.userLName          = v; return this; }
  withDisplayName(v: string):        this { this.data.userDisplayName    = v; return this; }
  withUserType(v: string):           this { this.data.userTypeCode       = v; return this; }
  withEmail(v: string):              this { this.data.emailId            = v; return this; }
  withMobile(v: string):             this { this.data.mobileNo1          = v; return this; }
  withHnwCategory(v: string):        this { this.data.hnwCategory        = v; return this; }
  withMultiBranch(v: string):        this { this.data.mulBranchAcccess   = v; return this; }
  withConcurrentLogin(v: string):    this { this.data.allowConcurrentLogin = v; return this; }
  withForcePwdChg(v: string):        this { this.data.forcePwdChg        = v; return this; }

  build(): UserMasterData { return { ...this.data }; }

  /** All CBS-mandatory fields only */
  buildMandatoryOnly(): UserMasterData {
    return {
      loginId:            `USM1${RUN_SUFFIX}`,
      employeeId:         this.data.employeeId,
      roleCode:           this.data.roleCode,
      userBaseBranchCode: this.data.userBaseBranchCode,
      userSalutation:     '1',
      userFName:          'Mandatory',
      userLName:          'User',
      userDisplayName:    `MND${RUN_SUFFIX}`,
      userTypeCode:       'INTERNAL',
      preferLang:         '1',
      emailId:            `mand.usr${RUN_SUFFIX}@bank.com`,
      hnwCategory:        '3',
      forcePwdChg:        'Y',
      docUpload:          this.data.docUpload,
    };
  }

  /** Female user — salutation MRS, gender auto FEMALE */
  buildFemale(): UserMasterData {
    return {
      ...this.data,
      loginId:        `USRF${RUN_SUFFIX}`,
      userSalutation: '2',   // MRS → FEMALE
      userFName:      'Priya',
      userLName:      'Sharma',
      userDisplayName: `PRY${RUN_SUFFIX}`,
      emailId:        `priya.usr${RUN_SUFFIX}@bank.com`,
      mobileNo1:      `8${RUN_SUFFIX}`,
    };
  }

  /** External user */
  buildExternal(): UserMasterData {
    return {
      ...this.data,
      loginId:        `USRE${RUN_SUFFIX}`,
      userTypeCode:   'EXTERNAL',
      userDisplayName: `EXT${RUN_SUFFIX}`,
      emailId:        `ext.usr${RUN_SUFFIX}@bank.com`,
      mobileNo1:      `7${RUN_SUFFIX}`,
    };
  }

  /** VIP user */
  buildVip(): UserMasterData {
    return {
      ...this.data,
      loginId:        `USRV${RUN_SUFFIX}`,
      hnwCategory:    '1',   // VIP
      userDisplayName: `VIP${RUN_SUFFIX}`,
      emailId:        `vip.usr${RUN_SUFFIX}@bank.com`,
      mobileNo1:      `6${RUN_SUFFIX}`,
    };
  }
}

export class UserMasterValidator {
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

  validateDbRecord(row: UserMasterDbRow | null, loginId: string): void {
    expect(row, `User ${loginId} must exist in DB`).not.toBeNull();
  }

  validateDbPending(row: UserMasterDbRow | null, loginId: string): void {
    expect(row, `User ${loginId} must exist in DB after create`).not.toBeNull();
    expect(['U', 'P'], 'authStatus must be U or P after create').toContain(row!.authStatus);
  }

  validateDbAuthorized(row: UserMasterDbRow | null, loginId: string): void {
    expect(row, `User ${loginId} must exist in DB after authorize`).not.toBeNull();
    expect(row!.authStatus, 'authStatus must be A after authorize').toBe('A');
  }
}

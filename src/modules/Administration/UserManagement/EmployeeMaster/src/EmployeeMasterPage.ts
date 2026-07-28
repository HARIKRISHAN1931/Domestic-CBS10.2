import { Locator, expect } from '@playwright/test';
import { BasePage } from '../../../../../framework/base/BasePage';

// ═════════════════════════════════════════════════════════════════════════════
// SCREEN INVENTORY — Employee Master (EMPLOYEEMST)
// Menu : Administration > User Management > Employee Master
// URL  : /addEmployee?type=-1
// Type : Master Screen — CRUD + Authorize
// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — Personal Information
//  01 Employee ID          #empId              text        MANDATORY
//  02 Salutation           #userSalutation     NATIVE sel  1=MR 2=MRS 3=MISS 6=THE 7=KUMARI 8=MAST 9=SHRI 10=SMT 11=MX
//  03 First Name           #empFName           text        MANDATORY
//  04 Middle Name          #empMName           text
//  05 Last Name            #empLName           text
//  06 Designation          #designation        SELECT2     label-based
//  07 Date of Joining      #joinDate           datepicker  MANDATORY  dd-MM-yyyy
//  08 Date of Birth        #birthDate          datepicker  dd-MM-yyyy
//  09 Gender               #gender             NATIVE sel  AUTO — driven by salutation, never set manually
//                                                          1=FEMALE 2=MALE 3=TRANSGENDER
//  10 Employment Type      #employmentType     NATIVE sel  SLOW — poll until enabled
//                                                          1=Permanent 2=Retainer 3=Contract
//  11 Blood Group          #bloodGroup         NATIVE sel  1=A+ 2=B+ 3=A- 4=B- 5=O+ 6=O- 7=AB+ 8=AB- 9=Z
//  12 Education            #education          NATIVE sel  1=SSC 2=HSC 3=GRADUATE 4=POST GRADUATE 5=LTI 7=OTHERS
//  13 Religion             #religion           NATIVE sel  1=HINDU 2=MUSLIM 3=Christian 4=Sikh 5=Buddhist 6=Jain
//  14 Caste                #caste              NATIVE sel  DEPENDENT on religion — empty until religion selected
//  15 Sub Caste            #subCaste           NATIVE sel  DEPENDENT on caste — empty until caste selected
//  16 Status               #status             NATIVE sel  1=Active 2=Suspended 3=Retired 4=Transferred
//  17 Retirement Date      #retireDate         datepicker  dd-MM-yyyy
//  18 Remark               #remark             text
//  19 Posting Branch       #postBr             F2-LOOKUP   press F2 → search popup → type branch code → Search → click result
//  20 Department           #dept               SELECT2     label-based
//  21 Reporting Manager    #repoMngr           F2-LOOKUP   press F2 → search popup → type user → Search → click result
//  22 Marital Status       #maritalStatus      SELECT2     label-based
//  23 Spouse Name          #empSpouseName      text        visible when married
//
// SECTION 2 — ID Proof
//  24 ID Proof Type        #idProof            NATIVE sel  1=AADHAR 2=Voters 3=PAN 4=PASSPORT 5=DRIVING 6=NPR 10=NAREGA
//  25 ID Number            #idNumber           text
//  26 Issue Date           #issueDate          datepicker  dd-MM-yyyy
//  27 Issued By            #docIssuedBy        NATIVE sel  1=SOCIAL SECURITY 2=INCOME TAX 3=ELECTION COMM
//                                                          4=PLANNING COMM 5=US DEPT 6=NPCI 7=SPDCL 8=UIDAI
//  28 Name as in Document  #idProofName        text
//
// SECTION 3 — Address
//  29 Address ID Type      #addrIdType         NATIVE sel  1=AADHAR 2=Voters 3=PAN 4=PASSPORT 11=ELECTRICITY BILL
//  30 Address ID Number    #addrIdNo           text
//  31 Address Line 1       #address1           text
//  32 Address Line 2       #address2           text
//  33 Address Line 3       #address3           text
//  34 Country              #country            NATIVE sel  IND=India
//  35 State                #state              SELECT2     DEPENDENT on country
//  36 City                 #city               NATIVE sel  DEPENDENT on state
//  37 Postal Code          #postalCode         text        NO Tab — triggers pincode lookup
//
// SECTION 4 — Contact
//  38 Email                #email              text
//  39 ISD Office Tel       #isdOffTelephone    NATIVE sel  +91
//  40 Office Telephone     #officeTelephone    text
//  41 ISD Mobile           #isdMobile          NATIVE sel  +91
//  42 Mobile               #mobile             text
//
// BUTTONS (List Page)
//  B1 Add/Create           #btnAddEmp
//  B3 Edit                 a.button.edit
//  B4 Delete               a.button.delete
//  B5 Quick View           a.button.secondary
//
// BUTTONS (Create/Edit Page)
//  B2 Save                 a.button.sm.btn-save   hidden — force click
//
// BUTTONS (Auth Modal)
//  B6 Approve radio        #idApprove
//  B7 Reject radio         #idReject
//  B8 Confirm Approve      #btnApproveId
//  B9 Confirm Reject       #btnRejectId
//
// GRIDS
//  G1 Pending data         #dt-pendingdata    tab: #PendingList
//  G2 Authorized data      #dt-authdata       tab: #AuthorizedList
// ═════════════════════════════════════════════════════════════════════════════

export interface EmployeeMasterData extends Record<string, unknown> {
  // Section 1 — Personal Information
  empId?:           string;  // MANDATORY, unique
  userSalutation?:  string;  // "1"=MR "2"=MRS "3"=MISS "6"=THE "7"=KUMARI "8"=MAST "9"=SHRI "10"=SMT "11"=MX
  empFName?:        string;  // MANDATORY
  empMName?:        string;
  empLName?:        string;
  designation?:     string;  // SELECT2 label e.g. "BANK BRANCH MANAGER"
  joinDate?:        string;  // dd-MM-yyyy MANDATORY
  birthDate?:       string;  // dd-MM-yyyy
  // gender — AUTO from salutation, never set manually
  employmentType?:  string;  // "1"=Permanent "2"=Retainer "3"=Contract
  bloodGroup?:      string;  // "1"=A+ "2"=B+ "3"=A- "4"=B- "5"=O+ "6"=O- "7"=AB+ "8"=AB- "9"=Z
  education?:       string;  // "1"=SSC "2"=HSC "3"=GRADUATE "4"=POST GRADUATE "5"=LTI "7"=OTHERS
  religion?:        string;  // "1"=HINDU "2"=MUSLIM "3"=Christian "4"=Sikh "5"=Buddhist "6"=Jain
  caste?:           string;  // DEPENDENT on religion — use label value
  subCaste?:        string;  // DEPENDENT on caste — use label value
  status?:          string;  // "1"=Active "2"=Suspended "3"=Retired "4"=Transferred
  retireDate?:      string;  // dd-MM-yyyy
  remark?:          string;
  postBr?:          string;
  dept?:            string;  // SELECT2 label e.g. "INFORMATION TECHNOLOGY"
  repoMngr?:        string;
  maritalStatus?:   string;  // SELECT2 label e.g. "UNMARRIED"
  empSpouseName?:   string;  // visible when married
  // Section 2 — ID Proof
  idProof?:         string;  // "1"=AADHAR "2"=Voters "3"=PAN "4"=PASSPORT "5"=DRIVING "6"=NPR "10"=NAREGA
  idNumber?:        string;
  issueDate?:       string;  // dd-MM-yyyy
  docIssuedBy?:     string;  // "1"=SOCIAL SECURITY "2"=INCOME TAX "3"=ELECTION COMM "4"=PLANNING COMM "5"=US DEPT "6"=NPCI "7"=SPDCL "8"=UIDAI
  idProofName?:     string;
  // Section 3 — Address
  addrIdType?:      string;  // "1"=AADHAR "2"=Voters "3"=PAN "4"=PASSPORT "11"=ELECTRICITY BILL
  addrIdNo?:        string;
  address1?:        string;
  address2?:        string;
  address3?:        string;
  country?:         string;  // "IND"=India
  state?:           string;  // SELECT2 label — dependent on country
  city?:            string;  // NATIVE sel — dependent on state
  postalCode?:      string;  // NO Tab — triggers pincode lookup
  // Section 4 — Contact
  email?:           string;
  isdOffTelephone?: string;  // "+91"
  officeTelephone?: string;
  isdMobile?:       string;  // "+91"
  mobile?:          string;
  docUpload?:       string;  // path to image file for Upload Document
  docUpload1?:      string;  // path to image file for Upload Address Proof
}

export class EmployeeMasterPage extends BasePage {
  readonly pageTitle = 'Employee Master';
  readonly menuCode  = 'EMPLOYEEMST';
  readonly listUrl   = '/employeeList';
  readonly createUrl = '/addEmployee';

  // ── Locator helpers ──────────────────────────────────────────────────────────
  private f   = (id: string): Locator => this.page.locator(`#${id}`).first();
  private inp = async (id: string, val: string): Promise<void> => { await this.fill(this.f(id), val); };

  /**
   * Native <select> — waits for visible, then polls until enabled, then selects.
   * Uses separate timeouts: 10s to become visible, then up to `enabledTimeout` to become enabled.
   */
  private sel = async (id: string, val: string, enabledTimeout = 8_000): Promise<void> => {
    if (!val) return;
    const loc = this.f(id);
    // Step 1: wait for element to be visible (separate 10s budget)
    const visible = await loc.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true).catch(() => false);
    if (!visible) return;
    // Step 2: poll until enabled (own budget)
    const deadline = Date.now() + enabledTimeout;
    while (Date.now() < deadline) {
      const disabled = await loc.isDisabled().catch(() => true);
      if (!disabled) break;
      await this.page.waitForTimeout(300);
    }
    // Step 3: select by value, fallback to label, fallback to index-based text match
    const v = val.trim();
    const byVal   = await loc.selectOption(v).then(() => true).catch(() => false);
    if (byVal) return;
    const byLabel = await loc.selectOption({ label: v }).then(() => true).catch(() => false);
    if (byLabel) return;
    // Last resort: find option whose text contains val and select by its value
    const optVal = await loc.locator(`option`).filter({ hasText: v }).first().getAttribute('value').catch(() => null);
    if (optVal !== null) await loc.selectOption(optVal).catch(() => {});
  };

  /**
   * F2 Lookup field — clicks the <a id="{fieldId}F2"> button, waits for #add-popnew modal,
   * fills the visible search input, clicks the visible Search button, selects first result.
   * postBr  → #BranchMasterSearchBox  + #branchMasterSearchBtn
   * repoMngr → #EmployeeMasterSearchBox + #employeeMasterSearchBtn
   */
  private f2Lookup = async (fieldId: string, searchTerm: string): Promise<void> => {
    if (!searchTerm) return;
    await this.page.locator(`#${fieldId}F2`).first().click();
    const popup = this.page.locator('#add-popnew');
    await popup.waitFor({ state: 'visible', timeout: 10_000 });
    await this.page.waitForTimeout(300);
    // Fill the visible search input inside the popup
    await popup.locator('input:visible').first().fill(searchTerm);
    // Click the visible Search button
    await popup.locator('button:visible').filter({ hasText: /search/i }).first().click();
    await this.page.waitForTimeout(800);
    // Click first result row
    await popup.locator('table tbody tr:visible').first().click();
    await this.page.waitForTimeout(200);
  };
  private sel2 = async (id: string, label: string): Promise<void> => {
    if (!label) return;
    const container = this.page.locator(`#select2-${id}-container`).first();
    if (!await container.isVisible({ timeout: 3_000 }).catch(() => false)) return;
    await container.click({ force: true });
    const searchBox = this.page.locator('.select2-search__field').last();
    if (await searchBox.isVisible({ timeout: 1_500 }).catch(() => false)) {
      await searchBox.fill(label);
      await this.page.waitForTimeout(300);
    }
    // Click option — use keyboard Enter to avoid any href navigation
    const option = this.page.locator('.select2-results__option')
      .filter({ hasText: label }).first();
    const optVisible = await option.isVisible({ timeout: 2_000 }).catch(() => false);
    if (optVisible) {
      await option.click({ force: true }).catch(() => {});
    } else {
      // Fallback: press Enter to select highlighted option
      await this.page.keyboard.press('Enter');
    }
    await this.page.waitForTimeout(100);
    const stillOpen = await this.page.locator('.select2-dropdown').isVisible().catch(() => false);
    if (stillOpen) await this.page.keyboard.press('Escape');
  };

  // ── List page ────────────────────────────────────────────────────────────────
  async openCreateForm(): Promise<void> {
    const btn = this.page.locator('#btnAddEmp');
    await btn.waitFor({ state: 'visible', timeout: 15_000 });
    await btn.click({ force: true });
    await this.f('empId').waitFor({ state: 'visible', timeout: 30_000 });
  }

  async searchRecord(searchText: string): Promise<void> {
    const box = this.page.locator('#searchBox, input[type="search"]').first();
    await box.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await box.fill(searchText, { force: true }).catch(() =>
      box.evaluate((el: HTMLInputElement, v) => { el.value = v; el.dispatchEvent(new Event('input')); }, searchText)
    );
    await this.page.waitForTimeout(800);
  }

  async clickEdit(): Promise<void> {
    await this.page.locator('a.button.edit').first().click();
    await this.f('empId').waitFor({ state: 'visible', timeout: 15_000 });
  }

  async clickDelete(): Promise<string> {
    await this.page.locator('a.button.delete').first().click();
    const confirm = this.page.locator('#confirmDelete, #btnConfirmDelete, .swal2-confirm').first();
    if (await confirm.isVisible({ timeout: 3_000 }).catch(() => false)) await confirm.click();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 10_000 });
    return (await toast.innerText()).trim();
  }

  async clickQuickView(): Promise<void> {
    await this.page.locator('a.button.secondary').first().click();
    await this.page.waitForTimeout(500);
  }

  // ── Form fill ────────────────────────────────────────────────────────────────
  async fillForm(data: EmployeeMasterData): Promise<void> {
    // ── Section 1 — Personal Information ──────────────────────────────────────
    if (data.empId !== undefined) {
      await this.inp('empId', data.empId!);
      await this.f('empId').press('Tab');
      await this.page.waitForTimeout(300);
    }

    // Salutation — app auto-sets #gender on change
    if (data.userSalutation !== undefined) {
      await this.sel('userSalutation', data.userSalutation!);
      await this.page.waitForTimeout(300);
    }

    if (data.empFName       !== undefined) await this.inp('empFName',  data.empFName!);
    if (data.empMName       !== undefined) await this.inp('empMName',  data.empMName!);
    if (data.empLName       !== undefined) await this.inp('empLName',  data.empLName!);
    if (data.designation    !== undefined) await this.sel2('designation', data.designation!);

    if (data.joinDate       !== undefined) { await this.inp('joinDate',  data.joinDate!);  await this.f('joinDate').press('Tab'); }
    if (data.birthDate      !== undefined) { await this.inp('birthDate', data.birthDate!); await this.f('birthDate').press('Tab'); }

    // gender is intentionally NOT set — auto-fetched from salutation by the application

    // #employmentType is disabled until empId AJAX completes — 30s enabled-timeout
    if (data.employmentType !== undefined) await this.sel('employmentType', data.employmentType!, 30_000);
    if (data.bloodGroup     !== undefined) await this.sel('bloodGroup',     data.bloodGroup!);
    if (data.education      !== undefined) await this.sel('education',      data.education!);

    if (data.religion       !== undefined) {
      await this.sel('religion', data.religion!);
      await this.page.waitForTimeout(200);
    }
    if (data.caste          !== undefined) {
      await this.sel('caste', data.caste!);
      await this.page.waitForTimeout(200);
    }
    if (data.subCaste       !== undefined) await this.sel('subCaste', data.subCaste!);

    if (data.status         !== undefined) await this.sel('status',     data.status!);
    if (data.retireDate     !== undefined) await this.inp('retireDate', data.retireDate!);
    if (data.remark         !== undefined) await this.inp('remark',     data.remark!);
    if (data.postBr     !== undefined) await this.f2Lookup('postBr',   data.postBr!);
    if (data.dept          !== undefined) await this.sel2('dept',          data.dept!);
    if (data.repoMngr      !== undefined) await this.f2Lookup('repoMngr', data.repoMngr!);
    if (data.maritalStatus !== undefined) await this.sel2('maritalStatus', data.maritalStatus!);
    if (data.empSpouseName  !== undefined) await this.inp('empSpouseName',  data.empSpouseName!);

    // ── Section 2 — ID Proof ──────────────────────────────────────────────────
    if (data.idProof        !== undefined) await this.sel('idProof',     data.idProof!);
    if (data.idNumber       !== undefined) await this.inp('idNumber',    data.idNumber!);
    if (data.issueDate      !== undefined) { await this.inp('issueDate', data.issueDate!); await this.f('issueDate').press('Tab'); }
    if (data.docIssuedBy    !== undefined) await this.sel('docIssuedBy', data.docIssuedBy!);
    if (data.idProofName    !== undefined) await this.inp('idProofName', data.idProofName!);

    // ── Section 3 — Address ───────────────────────────────────────────────────
    if (data.addrIdType     !== undefined) await this.sel('addrIdType', data.addrIdType!);
    if (data.addrIdNo       !== undefined) await this.inp('addrIdNo',   data.addrIdNo!);
    if (data.address1       !== undefined) await this.inp('address1',   data.address1!);
    if (data.address2       !== undefined) await this.inp('address2',   data.address2!);
    if (data.address3       !== undefined) await this.inp('address3',   data.address3!);

    if (data.country        !== undefined) {
      await this.sel('country', data.country!);
      await this.page.waitForTimeout(200);
    }
    if (data.state          !== undefined) await this.sel2('state', data.state!);
    if (data.city           !== undefined) {
      await this.page.waitForTimeout(200);
      await this.sel('city', data.city!);
    }
    if (data.postalCode     !== undefined) await this.inp('postalCode', data.postalCode!); // NO Tab

    // ── Section 4 — Contact ───────────────────────────────────────────────────
    if (data.email          !== undefined) await this.inp('email',           data.email!);
    if (data.isdOffTelephone !== undefined) await this.sel('isdOffTelephone', data.isdOffTelephone!);
    if (data.officeTelephone !== undefined) await this.inp('officeTelephone', data.officeTelephone!);
    if (data.isdMobile       !== undefined) await this.sel('isdMobile',       data.isdMobile!);
    if (data.mobile          !== undefined) await this.inp('mobile',          data.mobile!);
    // ── Section 5 — Document Upload ────────────────────────────────────────────────────────────
    if (data.docUpload  !== undefined) await this.page.locator('#docUpload').setInputFiles(data.docUpload!);
    if (data.docUpload1 !== undefined) await this.page.locator('#docUpload1').setInputFiles(data.docUpload1!);
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  async save(): Promise<string> {
    // Close any open Select2 dropdown before saving
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);

    // CBS save button is CSS-hidden (display:none) — scroll to it then force click
    const btn = this.page.locator('a.button.sm.btn-save').first();
    await btn.waitFor({ state: 'attached', timeout: 15_000 });
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    // Try force click — if still blocked by visibility, try clicking via keyboard Tab+Enter
    const clicked = await btn.click({ force: true }).then(() => true).catch(() => false);
    if (!clicked) {
      // Fallback: focus the button via Tab navigation and press Enter
      await this.page.keyboard.press('Tab');
      await this.page.keyboard.press('Enter');
    }

    const confirm = this.page.locator('#submitForm, #notifySave').first();
    if (await confirm.isVisible({ timeout: 5_000 }).catch(() => false)) await confirm.click();

    // Wait for success toast
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    // Also check for error toast to understand what's happening
    const errorToast = this.page.locator('.toast-messages .msg-toast.msg-error em, .toast-messages .msg-toast.msg-warning em').first();
    const anyToast = this.page.locator('.toast-messages .msg-toast em').first();
    await anyToast.waitFor({ state: 'visible', timeout: 20_000 });
    const isSuccess = await toast.isVisible().catch(() => false);
    const msg = (await anyToast.innerText()).trim();
    if (!isSuccess) throw new Error(`Save failed. Toast: "${msg}"`);

    // After save CBS stays on create form — navigate back to list
    await this.page.goto(this.page.url().replace(/\/addEmployee.*/, '/employeeList'), { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(1_500);
    return msg;
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  async create(data: EmployeeMasterData): Promise<string> {
    await this.fillForm(data);
    return this.save();
  }

  async update(searchText: string, data: Partial<EmployeeMasterData>): Promise<string> {
    await this.searchRecord(searchText);
    await this.clickEdit();
    await this.fillForm(data as EmployeeMasterData);
    return this.save();
  }

  // ── Authorization ─────────────────────────────────────────────────────────────
  async approve(searchText: string): Promise<string> {
    await this.page.locator('#dt-pendingdata tbody tr')
      .filter({ hasText: searchText }).first()
      .locator('.authorization-btns a').first().click();
    await this.page.locator('#idApprove').click();
    await this.page.locator('#btnApproveId').click();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.innerText()).trim();
  }

  async reject(searchText: string, remark: string): Promise<string> {
    await this.page.locator('#dt-pendingdata tbody tr')
      .filter({ hasText: searchText }).first()
      .locator('.authorization-btns a').first().click();
    await this.page.locator('#idReject').click();
    await this.page.locator('#rejectRemark, #remarkId').first().fill(remark);
    await this.page.locator('#btnRejectId').click();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.innerText()).trim();
  }

  // ── Field-level verifications ─────────────────────────────────────────────────
  /** Asserts a field is read-only (disabled or readonly attribute) */
  async verifyFieldReadOnly(fieldId: string): Promise<void> {
    const loc = this.f(fieldId);
    const isDisabled = await loc.isDisabled().catch(() => false);
    const isReadonly = await loc.getAttribute('readonly').then(v => v !== null).catch(() => false);
    expect(isDisabled || isReadonly, `Field #${fieldId} must be read-only`).toBe(true);
  }

  /** Returns the current selected value of a native select */
  async getSelectValue(fieldId: string): Promise<string> {
    return this.f(fieldId).inputValue().catch(() => '');
  }

  // ── Grid helpers ──────────────────────────────────────────────────────────────
  async switchToPendingTab(): Promise<void> {
    // After save, app may still be on form page — wait for list page to load
    await this.page.waitForTimeout(1_000);
    const tab = this.page.locator('#PendingList, a[href="#PendingList"], li[id="PendingList"]').first();
    if (await tab.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await tab.click();
    } else {
      // Try clicking by text
      await this.page.locator('a, li').filter({ hasText: /pending/i }).first().click().catch(() => {});
    }
    await this.page.waitForTimeout(500);
  }

  async switchToAuthorizedTab(): Promise<void> {
    await this.page.locator('#AuthorizedList').click();
    await this.page.waitForTimeout(300);
  }

  async getPendingRowCount(): Promise<number> {
    return this.page.locator('#dt-pendingdata tbody tr').count();
  }

  async getAuthorizedRowCount(): Promise<number> {
    return this.page.locator('#dt-authdata tbody tr').count();
  }

  async isRecordInPendingGrid(empId: string): Promise<boolean> {
    // Try both the datatable and any visible table row
    const inDt = await this.page.locator('#dt-pendingdata tbody tr')
      .filter({ hasText: empId }).first()
      .isVisible({ timeout: 5_000 }).catch(() => false);
    if (inDt) return true;
    // Fallback: any table row on page
    return this.page.locator('table tbody tr')
      .filter({ hasText: empId }).first()
      .isVisible({ timeout: 3_000 }).catch(() => false);
  }

  async isRecordInAuthorizedGrid(empId: string): Promise<boolean> {
    return this.page.locator('#dt-authdata tbody tr')
      .filter({ hasText: empId }).first()
      .isVisible({ timeout: 5_000 }).catch(() => false);
  }

  // ── Toast helpers ─────────────────────────────────────────────────────────────
  async getErrorToastMessage(): Promise<string> {
    const toast = this.page.locator('.toast-messages .msg-toast.msg-error em').first();
    await toast.waitFor({ state: 'visible', timeout: 5_000 });
    return (await toast.innerText()).trim();
  }
}

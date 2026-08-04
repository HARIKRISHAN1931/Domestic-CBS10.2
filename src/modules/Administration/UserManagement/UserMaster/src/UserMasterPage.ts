import { Locator, expect } from '@playwright/test';
import { BasePage } from '../../../../../framework/base/BasePage';

// ═════════════════════════════════════════════════════════════════════════════
// SCREEN INVENTORY — User Master (USERMGMT)
// Menu : Administration > User Management > User Master
// URL  : /addNewUserMember
// Type : Master Screen — CRUD + Authorize
// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — User Information
//  01 Login ID           #loginId              text    maxlen=10  MANDATORY
//  02 Employee ID        #employeeId           text    maxlen=10  MANDATORY  F2=#employeeIdF2
//  03 Role Code          #roleCode             text    maxlen=10  MANDATORY  F2=#roleCodeF2
//  04 Base Branch        #userBaseBranchCode   text    maxlen=10  MANDATORY  F2=#assignedBranchF2
//  05 Salutation         #userSalutation       SELECT  MANDATORY  1=MR 2=MRS 3=MISS 6=THE 7=KUMARI 8=MAST 9=SHRI 10=SMT 11=MX
//  06 First Name         #userFName            text    maxlen=60  MANDATORY
//  07 Middle Name        #userMName            text    maxlen=60
//  08 Last Name          #userLName            text    maxlen=60  MANDATORY
//  09 Gender             #gender               SELECT  AUTO from salutation — DISABLED, never set manually
//  10 Display Name       #userDisplayName      text    maxlen=60  MANDATORY
//  11 Reporting User     #reportingUserCode    text    DISABLED — auto from employee
//  12 User Type          #userTypeCode         SELECT  MANDATORY  EXTERNAL/INTERNAL/WEBUSER
//  13 Preferred Language #preferLang           SELECT  MANDATORY  1=English
//  14 ISD Mobile         #isdmobileNo1         SELECT  +91 only
//  15 Mobile             #mobileNo1            text    maxlen=10
//  16 Email              #emailId              text    maxlen=100 MANDATORY
//  17 Department         #userDepartment       SELECT  MANDATORY  DISABLED — auto from employee
//  18 HNW Category       #hnwCategory          SELECT  MANDATORY  1=VIP 2=PRIVILEGED 3=NORMAL
//  19 SSO Login Allow    #ssoLoginAllowY/N     RADIO   Y=1 N=0  DISABLED
//  20 Multi Branch       #mulBranchAcccessY/N  RADIO   Y=1 N=0
//  21 Concurrent Login   #allowConcurrentLoginY/N RADIO Y=1 N=0
//  22 Force Pwd Change   #forcePwdChgY/N       RADIO   Y=1 N=0
//  23 Photo Upload       #docUpload            FILE    image/*
//
// BUTTONS (List Page)
//  B1 Add               #addButton
//  B2 Edit              button.button.edit
//  B3 Delete            button.button.delete
//  B4 Quick View        button.button.secondary
//
// BUTTONS (Create/Edit Page)
//  B5 Save              #btnSave  (button.cnf-btn.enabled)
//  B6 Reset             button.cnf-btn-reset
//
// SAVE FLOW (confirmed from CBS JS)
//  1. Click #btnSave → cbs.core.js shows #tm-saveconfirm modal (tinymodal-showing class)
//  2. Click #submitForm (Yes) → validates → submits form POST
//  3. CBS navigates to authorizedUserList automatically
//
// GRIDS
//  G1 Pending:    #dt-pendingdata  cols: User/Login ID | User Name | E-Mail ID
//  G2 Authorized: #dt-authdata     cols: User/Login ID | User Name | Employee ID | User Category | E-mail ID | Assigned to Branch | User Role | Last Modified Date
// ═════════════════════════════════════════════════════════════════════════════

export interface UserMasterData extends Record<string, unknown> {
  loginId?:              string;  // MANDATORY, unique, maxlen=10
  employeeId?:           string;  // MANDATORY, F2 lookup
  roleCode?:             string;  // MANDATORY, F2 lookup
  userBaseBranchCode?:   string;  // MANDATORY, F2 lookup
  userSalutation?:       string;  // '1'=MR '2'=MRS '3'=MISS '6'=THE '7'=KUMARI '8'=MAST '9'=SHRI '10'=SMT '11'=MX
  userFName?:            string;  // MANDATORY, maxlen=60
  userMName?:            string;  // maxlen=60
  userLName?:            string;  // MANDATORY, maxlen=60
  // gender — AUTO from salutation, never set manually
  userDisplayName?:      string;  // MANDATORY, maxlen=60
  userTypeCode?:         string;  // 'EXTERNAL' | 'INTERNAL' | 'WEBUSER'
  preferLang?:           string;  // '1'=English
  mobileNo1?:            string;  // maxlen=10
  emailId?:              string;  // MANDATORY, maxlen=100
  hnwCategory?:          string;  // '1'=VIP '2'=PRIVILEGED '3'=NORMAL
  mulBranchAcccess?:     string;  // 'Y'=1 'N'=0
  allowConcurrentLogin?: string;  // 'Y'=1 'N'=0
  forcePwdChg?:          string;  // 'Y'=1 'N'=0
  docUpload?:            string;  // absolute path to image file
}

export class UserMasterPage extends BasePage {
  readonly pageTitle  = 'User Master';
  readonly menuCode   = 'USERMGMT';
  readonly listUrl    = '/authorizedUserList';
  readonly createUrl  = '/addNewUserMember';

  private f = (id: string): Locator => this.page.locator(`#${id}`).first();

  // ── Text input: type char-by-char + Tab to trigger CBS jQuery validation ─────
  private inp = async (id: string, val: string): Promise<void> => {
    if (!val) return;
    const loc = this.f(id);
    await loc.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await loc.click({ force: true });
    await this.page.keyboard.type(val, { delay: 20 });
    await loc.press('Tab');
    await this.page.waitForTimeout(80);
  };

  // ── Native <select>: selectOption + Tab ──────────────────────────────────────
  private sel = async (id: string, val: string, pollMs = 8_000): Promise<void> => {
    if (!val) return;
    const loc = this.f(id);
    await loc.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    const deadline = Date.now() + pollMs;
    while (Date.now() < deadline) {
      if (!await loc.isDisabled().catch(() => true)) break;
      await this.page.waitForTimeout(300);
    }
    await loc.selectOption(val).catch(() => loc.selectOption({ label: val }).catch(() => {}));
    await loc.press('Tab');
    await this.page.waitForTimeout(150);
  };

  // ── F2 Lookup: click F2 → wait for popup → fill visible input → Search → click result row
  // For branch F2: clicks selecttd1 cell (branch code cell)
  // For role F2: clicks first visible row directly (no search needed)
  private f2Lookup = async (fieldId: string, searchTerm: string): Promise<void> => {
    if (!searchTerm) return;
    await this.page.locator(`#${fieldId}F2`).first().click({ force: true });
    const popup = this.page.locator('#add-popnew');
    await popup.waitFor({ state: 'visible', timeout: 10_000 });
    await this.page.waitForTimeout(600);

    const visibleInput = popup.locator('input:visible').first();
    const hasInput = await visibleInput.count() > 0;
    if (hasInput) {
      await visibleInput.fill(searchTerm);
      const searchBtn = popup.locator('button:visible').filter({ hasText: /search/i }).first();
      const hasSearchBtn = await searchBtn.count() > 0;
      if (hasSearchBtn) {
        await searchBtn.click();
        await this.page.waitForTimeout(1_000);
      }
    }

    // Click result: try selecttd1 first (branch), fallback to row click (role)
    const firstRow = popup.locator('table tbody tr:visible').first();
    await firstRow.waitFor({ state: 'visible', timeout: 5_000 });
    const td1 = firstRow.locator('td.selecttd1').first();
    if (await td1.count() > 0) {
      await td1.click();
    } else {
      await firstRow.click();
    }
    await popup.waitFor({ state: 'hidden', timeout: 8_000 }).catch(() =>
      this.page.keyboard.press('Escape')
    );
    await this.page.waitForTimeout(300);
  };

  // ── Radio button: click the Y or N radio ─────────────────────────────────────
  private radio = async (yId: string, nId: string, val: string): Promise<void> => {
    if (!val) return;
    const id = (val === '1' || val.toUpperCase() === 'Y') ? yId : nId;
    const loc = this.page.locator(`#${id}`).first();
    if (await loc.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await loc.click({ force: true });
    }
  };

  // ── List page ────────────────────────────────────────────────────────────────
  async openCreateForm(): Promise<void> {
    const btn = this.page.locator('#addButton');
    await btn.waitFor({ state: 'visible', timeout: 15_000 });
    await btn.click({ force: true });
    await this.f('loginId').waitFor({ state: 'visible', timeout: 30_000 });
  }

  async searchRecord(searchText: string): Promise<void> {
    const box = this.page.locator('#searchBox, input[type="search"]').first();
    await box.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await box.fill(searchText, { force: true }).catch(() => {});
    await this.page.waitForTimeout(800);
  }

  async clickEdit(): Promise<void> {
    await this.page.locator('button.button.edit').first().click();
    await this.f('loginId').waitFor({ state: 'visible', timeout: 15_000 });
  }

  async clickDelete(): Promise<string> {
    await this.page.locator('button.button.delete').first().click();
    const confirm = this.page.locator('#confirmDelete, #btnConfirmDelete, .swal2-confirm').first();
    if (await confirm.isVisible({ timeout: 3_000 }).catch(() => false)) await confirm.click();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 10_000 });
    return (await toast.innerText()).trim();
  }

  async clickQuickView(): Promise<void> {
    await this.page.locator('button.button.secondary').first().click();
    await this.page.waitForTimeout(500);
  }

  // ── Form fill ────────────────────────────────────────────────────────────────
  async fillForm(data: UserMasterData): Promise<void> {

    if (data.loginId !== undefined) {
      await this.inp('loginId', data.loginId);
      await this.page.waitForTimeout(500);
    }

    // Employee ID — type directly; CBS change handler does AJAX lookup to populate user details
    // Use F2 only as fallback if direct type fails
    if (data.employeeId !== undefined) {
      await this.inp('employeeId', data.employeeId);
      await this.page.waitForTimeout(1_500);  // wait for AJAX
      // Check if CBS rejected it (toast = already in use)
      const toastVis = await this.page.locator('.toast-messages .msg-toast em').first()
        .isVisible({ timeout: 500 }).catch(() => false);
      if (toastVis) {
        const toastMsg = await this.page.locator('.toast-messages .msg-toast em').first().innerText().catch(() => '');
        if (toastMsg.toLowerCase().includes('already in use')) {
          throw new Error(`Employee ID "${data.employeeId}" is already linked to another user. Use a different empId.`);
        }
      }
    }

    // Role Code — F2 lookup; click first row (no search needed, shows all roles)
    if (data.roleCode !== undefined) await this.f2Lookup('roleCode', data.roleCode);

    // Base Branch — F2 lookup using branch code
    if (data.userBaseBranchCode !== undefined) await this.f2Lookup('assignedBranch', data.userBaseBranchCode);

    // Salutation — auto-sets gender
    if (data.userSalutation !== undefined) {
      await this.sel('userSalutation', data.userSalutation);
    }

    if (data.userFName       !== undefined) await this.inp('userFName',       data.userFName);
    if (data.userMName       !== undefined) await this.inp('userMName',       data.userMName);
    if (data.userLName       !== undefined) await this.inp('userLName',       data.userLName);
    if (data.userDisplayName !== undefined) await this.inp('userDisplayName', data.userDisplayName);

    if (data.userTypeCode !== undefined) await this.sel('userTypeCode', data.userTypeCode);
    if (data.preferLang   !== undefined) await this.sel('preferLang',   data.preferLang);
    if (data.mobileNo1    !== undefined) await this.inp('mobileNo1',    data.mobileNo1);
    if (data.emailId      !== undefined) await this.inp('emailId',      data.emailId);
    if (data.hnwCategory  !== undefined) await this.sel('hnwCategory',  data.hnwCategory);

    // Radio buttons
    if (data.mulBranchAcccess     !== undefined) await this.radio('mulBranchAcccessY',     'mulBranchAcccessN',     data.mulBranchAcccess);
    if (data.allowConcurrentLogin !== undefined) await this.radio('allowConcurrentLoginY', 'allowConcurrentLoginN', data.allowConcurrentLogin);
    if (data.forcePwdChg          !== undefined) await this.radio('forcePwdChgY',          'forcePwdChgN',          data.forcePwdChg);

    // Photo upload
    if (data.docUpload !== undefined) {
      await this.page.locator('#docUpload').first().setInputFiles(data.docUpload);
      await this.page.waitForTimeout(400);
    }
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  // Flow: #btnSave → tinymodal-showing on #tm-saveconfirm → #submitForm → form POST → list page
  async save(): Promise<string> {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);

    const saveBtn = this.page.locator('#btnSave').first();
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();
    await this.page.waitForTimeout(600);

    // Modal check via CSS class (CBS uses tinymodal-showing, not display:block)
    const modalHasClass = await this.page.locator('#tm-saveconfirm').getAttribute('class')
      .then(c => (c ?? '').includes('tinymodal-showing')).catch(() => false);
    if (!modalHasClass) {
      throw new Error('Save confirm modal did not appear — mandatory fields may be unfilled');
    }

    await this.page.locator('#submitForm').click();

    // Wait for success toast
    const successToast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    const anyToast     = this.page.locator('.toast-messages .msg-toast em').first();
    await anyToast.waitFor({ state: 'visible', timeout: 20_000 });
    const isSuccess = await successToast.isVisible().catch(() => false);
    const msg       = (await anyToast.innerText()).trim();
    if (!isSuccess) {
      const errorFields: string[] = [];
      const errorDivs = await this.page.locator('.control-error').all();
      for (const div of errorDivs) {
        if (!await div.isVisible().catch(() => false)) continue;
        const id  = await div.getAttribute('id').catch(() => '');
        const txt = await div.innerText().catch(() => '');
        const firstLine = txt.trim().split('\n')[0].trim();
        if (firstLine) errorFields.push(`${id}: ${firstLine}`);
      }
      throw new Error(`Save failed. Toast: "${msg}". Error fields: [${errorFields.join(' | ')}]`);
    }

    // CBS navigates to list automatically after form POST
    await this.page.waitForURL(/authorizedUserList/, { timeout: 15_000 }).catch(() => {});
    return msg;
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  async create(data: UserMasterData): Promise<string> {
    await this.fillForm(data);
    return this.save();
  }

  async update(searchText: string, data: Partial<UserMasterData>): Promise<string> {
    await this.searchRecord(searchText);
    await this.clickEdit();
    await this.fillForm(data as UserMasterData);
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

  // ── Grid helpers ──────────────────────────────────────────────────────────────
  async switchToPendingTab(): Promise<void> {
    await this.page.waitForTimeout(2_000);
    const tab = this.page.locator('#PendingList, a[href="#PendingList"]').first();
    if (await tab.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await tab.click();
    } else {
      await this.page.locator('a, li').filter({ hasText: /pending/i }).first().click().catch(() => {});
    }
    await this.page.waitForTimeout(1_000);
  }

  async switchToAuthorizedTab(): Promise<void> {
    await this.page.locator('#AuthorizedList').click();
    await this.page.waitForTimeout(300);
  }

  async isRecordInPendingGrid(loginId: string): Promise<boolean> {
    await this.page.waitForTimeout(1_000);
    const inDt = await this.page.locator('#dt-pendingdata tbody tr')
      .filter({ hasText: loginId }).first()
      .isVisible({ timeout: 8_000 }).catch(() => false);
    if (inDt) return true;
    return this.page.locator('table tbody tr')
      .filter({ hasText: loginId }).first()
      .isVisible({ timeout: 5_000 }).catch(() => false);
  }

  async isRecordInAuthorizedGrid(loginId: string): Promise<boolean> {
    return this.page.locator('#dt-authdata tbody tr')
      .filter({ hasText: loginId }).first()
      .isVisible({ timeout: 5_000 }).catch(() => false);
  }

  // ── Verifications ─────────────────────────────────────────────────────────────
  async verifyFieldReadOnly(fieldId: string): Promise<void> {
    const loc = this.f(fieldId);
    const isDisabled = await loc.isDisabled().catch(() => false);
    const isReadonly = await loc.getAttribute('readonly').then(v => v !== null).catch(() => false);
    expect(isDisabled || isReadonly, `Field #${fieldId} must be read-only`).toBe(true);
  }

  async getFieldValue(fieldId: string): Promise<string> {
    return this.f(fieldId).inputValue().catch(() => '');
  }

  async getErrorToastMessage(): Promise<string> {
    const toast = this.page.locator('.toast-messages .msg-toast.msg-error em').first();
    await toast.waitFor({ state: 'visible', timeout: 5_000 });
    return (await toast.innerText()).trim();
  }
}

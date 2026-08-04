import { Locator, expect } from '@playwright/test';
import { BasePage } from '../../../../../framework/base/BasePage';

export interface EmployeeMasterData extends Record<string, unknown> {
  empId?:           string;
  userSalutation?:  string;
  empFName?:        string;
  empMName?:        string;
  empLName?:        string;
  designation?:     string;
  joinDate?:        string;
  birthDate?:       string;
  employmentType?:  string;
  bloodGroup?:      string;
  education?:       string;
  religion?:        string;
  caste?:           string;
  subCaste?:        string;
  status?:          string;
  retireDate?:      string;
  remark?:          string;
  postBr?:          string;
  dept?:            string;
  repoMngr?:        string;
  maritalStatus?:   string;
  empSpouseName?:   string;
  idProof?:         string;
  idNumber?:        string;
  issueDate?:       string;
  docIssuedBy?:     string;
  idProofName?:     string;
  addrIdType?:      string;
  addrIdNo?:        string;
  address1?:        string;
  address2?:        string;
  address3?:        string;
  country?:         string;
  state?:           string;
  city?:            string;
  postalCode?:      string;
  email?:           string;
  isdOffTelephone?: string;
  officeTelephone?: string;
  isdMobile?:       string;
  mobile?:          string;
  docUpload?:       string;
  docUpload1?:      string;
}

export class EmployeeMasterPage extends BasePage {
  readonly pageTitle = 'Employee Master';
  readonly menuCode  = 'EMPLOYEEMST';
  readonly listUrl   = '/employeeList';
  readonly createUrl = '/addEmployee';

  private f = (id: string): Locator => this.page.locator(`#${id}`).first();

  // fill + Tab so CBS jQuery blur handler marks field as valid
  private inp = async (id: string, val: string): Promise<void> => {
    if (!val) return;
    const loc = this.f(id);
    await loc.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await loc.click({ force: true });
    await loc.fill(val);
    await loc.press('Tab');
    await this.page.waitForTimeout(80);
  };

  // native <select>: click → selectOption → Tab
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

  // Select2: click container → optionally type in search box → click matching option
  private sel2 = async (id: string, searchText?: string): Promise<void> => {
    const container = this.page.locator(`#select2-${id}-container`).first();
    await container.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await container.click({ force: true });
    await this.page.waitForTimeout(400);
    // If search box is present and searchText given, type to filter
    const searchBox = this.page.locator('.select2-search__field').last();
    if (searchText && await searchBox.isVisible({ timeout: 800 }).catch(() => false)) {
      // Use last word of searchText for filtering (avoids numeric prefix issues)
      const filterTerm = searchText.split(/[\s-]+/).filter(Boolean).pop() ?? searchText;
      await searchBox.fill(filterTerm.slice(0, 8));
      await this.page.waitForTimeout(300);
    }
    const opts = await this.page.locator('.select2-results__option').all();
    if (opts.length === 0) { await this.page.keyboard.press('Escape'); return; }
    if (searchText) {
      for (const opt of opts) {
        const txt = await opt.innerText().catch(() => '');
        if (txt.trim().toLowerCase().includes(searchText.toLowerCase())) {
          await opt.click({ force: true });
          await this.page.waitForTimeout(300);
          return;
        }
      }
    }
    await opts[0].click({ force: true });
    await this.page.waitForTimeout(300);
  };

  // F2 popup: click F2 → wait 600ms for correct panel → fill visible input → Search → first row
  private f2Lookup = async (fieldId: string, searchTerm: string): Promise<void> => {
    if (!searchTerm) return;
    await this.page.locator(`#${fieldId}F2`).first().click();
    const popup = this.page.locator('#add-popnew');
    await popup.waitFor({ state: 'visible', timeout: 10_000 });
    await this.page.waitForTimeout(600);
    await popup.locator('input:visible').first().fill(searchTerm);
    await popup.locator('button:visible').filter({ hasText: /search/i }).first().click();
    await this.page.waitForTimeout(1_000);
    await popup.locator('table tbody tr:visible').first().click();
    await this.page.waitForTimeout(300);
  };

  // dependent <select>: poll until options > 1, pick index 1, Tab
  private selDep = async (id: string): Promise<void> => {
    const loc = this.f(id);
    const deadline = Date.now() + 8_000;
    while (Date.now() < deadline) {
      if (await loc.locator('option').count().catch(() => 0) > 1) break;
      await this.page.waitForTimeout(300);
    }
    if (await loc.locator('option').count().catch(() => 0) > 1) {
      await loc.selectOption({ index: 1 });
      await loc.press('Tab');
      await this.page.waitForTimeout(200);
    }
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
    await box.fill(searchText, { force: true }).catch(() => {});
    await this.page.waitForTimeout(800);
  }

  async clickEdit(): Promise<void> {
    await this.page.locator('a.button.edit, button.button.edit').first().click();
    await this.f('empId').waitFor({ state: 'visible', timeout: 15_000 });
  }

  async clickDelete(): Promise<string> {
    await this.page.locator('a.button.delete, button.button.delete').first().click();
    const confirm = this.page.locator('#confirmDelete, #btnConfirmDelete, .swal2-confirm').first();
    if (await confirm.isVisible({ timeout: 3_000 }).catch(() => false)) await confirm.click();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 10_000 });
    return (await toast.innerText()).trim();
  }

  async clickQuickView(): Promise<void> {
    await this.page.locator('a.button.secondary, button.button.secondary').first().click();
    await this.page.waitForTimeout(500);
  }

  // ── Form fill ────────────────────────────────────────────────────────────────
  async fillForm(data: EmployeeMasterData): Promise<void> {

    // Section 1 — Personal Information
    if (data.empId !== undefined) {
      await this.inp('empId', data.empId);
      await this.page.waitForTimeout(1_000);   // empId AJAX
    }
    if (data.userSalutation !== undefined) await this.sel('userSalutation', data.userSalutation);
    if (data.empFName       !== undefined) await this.inp('empFName', data.empFName);
    if (data.empMName       !== undefined) await this.inp('empMName', data.empMName);
    if (data.empLName       !== undefined) await this.inp('empLName', data.empLName);
    if (data.designation    !== undefined) await this.sel2('designation', data.designation);

    if (data.joinDate !== undefined) {
      await this.inp('joinDate', data.joinDate);
      await this.page.waitForTimeout(200);
    }
    if (data.birthDate !== undefined) {
      await this.inp('birthDate', data.birthDate);
      await this.page.waitForTimeout(200);
    }

    // employmentType disabled until empId AJAX completes — poll 30s
    if (data.employmentType !== undefined) await this.sel('employmentType', data.employmentType, 30_000);

    if (data.bloodGroup !== undefined) await this.sel('bloodGroup', data.bloodGroup);
    if (data.education  !== undefined) await this.sel('education',  data.education);
    if (data.religion   !== undefined) await this.sel('religion',   data.religion);

    // caste/subCaste dependent on religion
    if (data.caste    !== undefined) await this.selDep('caste');
    if (data.subCaste !== undefined) await this.selDep('subCaste');

    // status is always disabled — set value directly via page.evaluate (querySelector, not locator)
    if (data.status !== undefined) {
      await this.page.evaluate((v) => {
        const el = document.querySelector('#status') as HTMLSelectElement;
        if (el) el.value = v;
      }, data.status);
    }

    if (data.retireDate !== undefined) await this.inp('retireDate', data.retireDate);
    if (data.remark     !== undefined) await this.inp('remark',     data.remark);

    if (data.postBr        !== undefined) await this.f2Lookup('postBr',    data.postBr);
    if (data.dept          !== undefined) await this.sel2('dept', data.dept);
    if (data.repoMngr      !== undefined) await this.f2Lookup('repoMngr',  data.repoMngr);
    if (data.maritalStatus !== undefined) await this.sel2('maritalStatus', data.maritalStatus);
    if (data.empSpouseName !== undefined) await this.inp('empSpouseName', data.empSpouseName);

    // Section 2 — ID Proof
    if (data.idProof     !== undefined) await this.sel('idProof',    data.idProof);
    if (data.idNumber    !== undefined) await this.inp('idNumber',   data.idNumber);
    if (data.issueDate   !== undefined) await this.inp('issueDate',  data.issueDate);
    if (data.docIssuedBy !== undefined) await this.sel('docIssuedBy', data.docIssuedBy);
    if (data.idProofName !== undefined) await this.inp('idProofName', data.idProofName);

    // Section 3 — Address
    if (data.addrIdType !== undefined) await this.sel('addrIdType', data.addrIdType);
    if (data.addrIdNo   !== undefined) await this.inp('addrIdNo',   data.addrIdNo);
    if (data.address1   !== undefined) await this.inp('address1',   data.address1);
    if (data.address2   !== undefined) await this.inp('address2',   data.address2);
    if (data.address3   !== undefined) await this.inp('address3',   data.address3);

    if (data.country !== undefined) {
      await this.sel('country', data.country);
      // Wait for getStateByCountry AJAX response
      await this.page.waitForResponse(
        r => r.url().includes('getStateByCountry') && r.status() === 200,
        { timeout: 10_000 }
      ).catch(() => this.page.waitForTimeout(2_000));
    }
    if (data.state !== undefined) {
      // state Select2 has a search box — sel2 types partial text to filter then clicks
      await this.sel2('state', data.state);
      // Wait for getDistrictByState AJAX response
      await this.page.waitForResponse(
        r => r.url().includes('getDistrictByState') && r.status() === 200,
        { timeout: 10_000 }
      ).catch(() => this.page.waitForTimeout(2_000));
    }
    if (data.city !== undefined) {
      await this.sel('city', data.city);
    }
    if (data.postalCode !== undefined) await this.inp('postalCode', data.postalCode);

    // Section 4 — Contact
    if (data.email           !== undefined) await this.inp('email',           data.email);
    if (data.isdOffTelephone !== undefined) await this.sel('isdOffTelephone', data.isdOffTelephone).catch(() => {});
    if (data.officeTelephone !== undefined) await this.inp('officeTelephone', data.officeTelephone);
    if (data.isdMobile       !== undefined) await this.sel('isdMobile',       data.isdMobile).catch(() => {});
    if (data.mobile          !== undefined) await this.inp('mobile',          data.mobile);

    // Section 5 — Document Upload
    if (data.docUpload  !== undefined) {
      await this.page.locator('#docUpload').first().setInputFiles(data.docUpload);
      await this.page.waitForTimeout(400);
    }
    if (data.docUpload1 !== undefined) {
      await this.page.locator('#docUpload1').first().setInputFiles(data.docUpload1);
      await this.page.waitForTimeout(400);
    }
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  // Flow confirmed by CBS JS source (cbs.core.js):
  //   1. Click #saveCustomer (button.cnf-btn) → cbs.core.js adds class 'tinymodal-showing' to #tm-saveconfirm
  //      NOTE: modal uses CSS class not display:block — Playwright isVisible() returns false
  //   2. Click #submitForm (Yes anchor) → M002013Crud.js calls validateForm() then submits
  //   3. Wait for .msg-toast.msg-success em
  async save(): Promise<string> {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);

    // Click #saveCustomer — cbs.core.js shows #tm-saveconfirm via tinymodal-showing class
    const saveBtn = this.page.locator('#saveCustomer').first();
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();
    await this.page.waitForTimeout(600);

    // Check modal via class (not isVisible — CBS uses tinymodal-showing CSS class, not display:block)
    const modalHasClass = await this.page.locator('#tm-saveconfirm').getAttribute('class')
      .then(c => (c ?? '').includes('tinymodal-showing')).catch(() => false);
    if (!modalHasClass) {
      throw new Error('Save confirm modal did not appear (tinymodal-showing class not added) — mandatory fields may be unfilled');
    }

    // Click #submitForm (the Yes button) — M002013Crud.js calls validateForm() then submits
    await this.page.locator('#submitForm').click();

    // Wait for success toast — or capture CBS error details
    const successToast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    const anyToast     = this.page.locator('.toast-messages .msg-toast em').first();
    await anyToast.waitFor({ state: 'visible', timeout: 20_000 });
    const isSuccess = await successToast.isVisible().catch(() => false);
    const msg       = (await anyToast.innerText()).trim();
    if (!isSuccess) {
      // Capture which fields CBS marked as errors
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
    // CBS submits #employeeForm via POST — page navigates automatically to list
    // Wait for navigation to complete (CBS lands on employeeList)
    await this.page.waitForURL(/employeeList/, { timeout: 15_000 }).catch(() => {});
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
    const row = this.page.locator('#dt-pendingdata tbody tr').filter({ hasText: searchText }).first();
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.hover();
    await this.page.waitForTimeout(300);
    await row.locator('.authorization-btns a').first().click({ force: true });
    await this.page.waitForTimeout(500);
    await this.page.locator('button:has-text("Approve")').first().click();
    await this.page.waitForTimeout(300);
    await this.page.locator('#btnApproveId').click();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.innerText()).trim();
  }

  async reject(searchText: string, remark: string): Promise<string> {
    const row = this.page.locator('#dt-pendingdata tbody tr').filter({ hasText: searchText }).first();
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.hover();
    await this.page.waitForTimeout(300);
    await row.locator('.authorization-btns a').first().click({ force: true });
    await this.page.waitForTimeout(500);
    await this.page.locator('#idReject').click();
    await this.page.locator('#rejectRemark, #remarkId').first().fill(remark);
    await this.page.locator('#btnRejectId').click();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.innerText()).trim();
  }

  // ── Verifications ─────────────────────────────────────────────────────────────
  async verifyFieldReadOnly(fieldId: string): Promise<void> {
    const loc = this.f(fieldId);
    const isDisabled = await loc.isDisabled().catch(() => false);
    const isReadonly = await loc.getAttribute('readonly').then(v => v !== null).catch(() => false);
    expect(isDisabled || isReadonly, `Field #${fieldId} must be read-only`).toBe(true);
  }

  async getSelectValue(fieldId: string): Promise<string> {
    return this.f(fieldId).inputValue().catch(() => '');
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

  async searchPendingRecord(empId: string): Promise<void> {
    const search = this.page.locator('#dt-pendingdata_filter input, #PendingList input[type=search]').first();
    if (await search.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await search.fill(empId);
      await this.page.waitForTimeout(800);
    }
  }

  async searchAuthorizedRecord(empId: string): Promise<void> {
    const search = this.page.locator('#dt-authdata_filter input, #AuthorizedList input[type=search]').first();
    if (await search.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await search.fill(empId);
      await this.page.waitForTimeout(800);
    }
  }

  async getPendingRowCount(): Promise<number> {
    return this.page.locator('#dt-pendingdata tbody tr').count();
  }

  async getAuthorizedRowCount(): Promise<number> {
    return this.page.locator('#dt-authdata tbody tr').count();
  }

  async isRecordInPendingGrid(empId: string): Promise<boolean> {
    // Wait for datatable to render
    await this.page.waitForTimeout(1_000);
    // Try pending datatable first
    const inDt = await this.page.locator('#dt-pendingdata tbody tr')
      .filter({ hasText: empId }).first()
      .isVisible({ timeout: 8_000 }).catch(() => false);
    if (inDt) return true;
    // Fallback: any visible table row on page
    return this.page.locator('table tbody tr')
      .filter({ hasText: empId }).first()
      .isVisible({ timeout: 5_000 }).catch(() => false);
  }

  async isRecordInAuthorizedGrid(empId: string): Promise<boolean> {
    return this.page.locator('#dt-authdata tbody tr')
      .filter({ hasText: empId }).first()
      .isVisible({ timeout: 5_000 }).catch(() => false);
  }

  async getErrorToastMessage(): Promise<string> {
    const toast = this.page.locator('.toast-messages .msg-toast.msg-error em').first();
    await toast.waitFor({ state: 'visible', timeout: 5_000 });
    return (await toast.innerText()).trim();
  }
}

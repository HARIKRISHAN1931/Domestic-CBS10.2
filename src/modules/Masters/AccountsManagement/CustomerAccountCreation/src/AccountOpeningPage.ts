import { Locator, expect } from '@playwright/test';
import { BasePage } from '../../../../../framework/base/BasePage';

export interface AccountOpeningFormData extends Record<string, unknown> {
  customerNumber?: string;
  moduleCode?:     string;
  productCode?:    string;
  schemeCode?:     string;
  modeOfOperation?: string;
  documentFileNumber?: string;
  additionalInformation1?: string;
  additionalInformation2?: string;
  // Nominee
  nomineeYN?:      'Y' | 'N';
  // Statement
  stmtFreq?:       string;
  stmtMode?:       string;
  // Address
  addressType?:    string;
  address1?:       string;
  address2?:       string;
  address3?:       string;
  countryCode?:    string;
  stateCode?:      string;
  districtCode?:   string;
}

export class AccountOpeningPage extends BasePage {
  readonly pageTitle = 'Customer Account Creation';
  readonly menuCode  = 'PRDACNOMST';
  readonly listUrl   = '/accountList';
  readonly createUrl = '/createNewAccnt';

  private f = (id: string): Locator => this.page.locator(`#${id}`).first();

  private inp = async (id: string, val: string): Promise<void> => {
    if (!val) return;
    const loc = this.f(id);
    await loc.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await loc.click({ force: true });
    await loc.fill(val);
    await loc.press('Tab');
    await this.page.waitForTimeout(80);
  };

  // native <select>: poll until enabled → selectOption → wait for dependent AJAX
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

  // Select2 (stateCode / districtCode)
  private sel2 = async (id: string, searchText?: string): Promise<void> => {
    const container = this.page.locator(`#select2-${id}-container`).first();
    await container.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await container.click({ force: true });
    await this.page.waitForTimeout(400);
    const searchBox = this.page.locator('.select2-search__field').last();
    if (searchText && await searchBox.isVisible({ timeout: 800 }).catch(() => false)) {
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

  // Poll until a select has options loaded (AJAX cascade)
  private waitForOptions = async (id: string, timeoutMs = 10_000): Promise<void> => {
    const loc = this.f(id);
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const count = await loc.locator('option').count().catch(() => 0);
      if (count > 1) return;
      await this.page.waitForTimeout(300);
    }
  };

  // ── List page ────────────────────────────────────────────────────────────────
  async openCreateForm(): Promise<void> {
    const btn = this.page.locator('a.button.add, button.button.add, #btnAddAccount').first();
    await btn.waitFor({ state: 'visible', timeout: 15_000 });
    await btn.click({ force: true });
    await this.f('customerNumber').waitFor({ state: 'visible', timeout: 30_000 });
  }

  async searchRecord(searchText: string): Promise<void> {
    const box = this.page.locator('#searchBox, input[type="search"]').first();
    await box.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await box.fill(searchText, { force: true }).catch(() => {});
    await this.page.waitForTimeout(800);
  }

  async clickEdit(): Promise<void> {
    await this.page.locator('a.button.edit, button.button.edit').first().click();
    await this.f('customerNumber').waitFor({ state: 'visible', timeout: 15_000 });
  }

  async clickDelete(): Promise<string> {
    await this.page.locator('a.button.delete, button.button.delete').first().click();
    const confirm = this.page.locator('#confirmDelete, #btnConfirmDelete, .swal2-confirm').first();
    if (await confirm.isVisible({ timeout: 3_000 }).catch(() => false)) await confirm.click();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 10_000 });
    return (await toast.innerText()).trim();
  }

  // ── Form fill ────────────────────────────────────────────────────────────────
  async fillForm(data: AccountOpeningFormData): Promise<void> {
    // Customer ID — Tab triggers AJAX to load customer name/branch
    if (data.customerNumber !== undefined) {
      await this.inp('customerNumber', data.customerNumber);
      await this.page.waitForTimeout(1_500);
    }

    // Module → wait for options → select → wait for productCode AJAX
    if (data.moduleCode !== undefined) {
      await this.waitForOptions('moduleCode');
      await this.sel('moduleCode', data.moduleCode);
      await this.waitForOptions('productCode');
    }

    // Product → wait for options → select → wait for schemeCode AJAX
    if (data.productCode !== undefined) {
      await this.waitForOptions('productCode');
      await this.sel('productCode', data.productCode);
      await this.waitForOptions('schemeCode');
    }

    // Scheme → wait for options → select → wait for modeOfOperation AJAX
    if (data.schemeCode !== undefined) {
      await this.waitForOptions('schemeCode');
      await this.sel('schemeCode', data.schemeCode);
      await this.page.waitForTimeout(500);
    }

    // Mode of Operation
    if (data.modeOfOperation !== undefined) await this.sel('modeOfOperation', data.modeOfOperation);

    // Nominee radio
    if (data.nomineeYN !== undefined) {
      const radio = this.page.locator(`#nominee${data.nomineeYN}`).first();
      await radio.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(200);
    }

    // Optional fields
    if (data.documentFileNumber    !== undefined) await this.inp('documentFileNumber',    data.documentFileNumber);
    if (data.additionalInformation1 !== undefined) await this.inp('additionalInformation1', data.additionalInformation1);
    if (data.additionalInformation2 !== undefined) await this.inp('additionalInformation2', data.additionalInformation2);

    // Statement
    if (data.stmtFreq !== undefined) await this.sel('stmtFreq', data.stmtFreq);
    if (data.stmtMode !== undefined) await this.sel('stmtMode', data.stmtMode);

    // Address
    if (data.addressType  !== undefined) await this.sel('addressType',  data.addressType);
    if (data.address1     !== undefined) await this.inp('address1',     data.address1);
    if (data.address2     !== undefined) await this.inp('address2',     data.address2);
    if (data.address3     !== undefined) await this.inp('address3',     data.address3);
    if (data.countryCode  !== undefined) await this.sel('countryCode',  data.countryCode);
    if (data.stateCode    !== undefined) await this.sel2('stateCode',   data.stateCode);
    if (data.districtCode !== undefined) await this.sel2('districtCode', data.districtCode);
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  async save(): Promise<string> {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);

    const saveBtn = this.page.locator('#saveCustomer').first();
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();
    await this.page.waitForTimeout(600);

    const modalHasClass = await this.page.locator('#tm-saveconfirm').getAttribute('class')
      .then(c => (c ?? '').includes('tinymodal-showing')).catch(() => false);
    if (!modalHasClass) {
      throw new Error('Save confirm modal did not appear — mandatory fields may be unfilled');
    }

    await this.page.locator('#submitForm').click();

    const successToast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    const anyToast     = this.page.locator('.toast-messages .msg-toast em').first();
    await anyToast.waitFor({ state: 'visible', timeout: 20_000 });
    const isSuccess = await successToast.isVisible().catch(() => false);
    const msg       = (await anyToast.innerText()).trim();
    if (!isSuccess) {
      const errorFields: string[] = [];
      for (const div of await this.page.locator('.control-error').all()) {
        if (!await div.isVisible().catch(() => false)) continue;
        const id  = await div.getAttribute('id').catch(() => '');
        const txt = (await div.innerText().catch(() => '')).trim().split('\n')[0].trim();
        if (txt) errorFields.push(`${id}: ${txt}`);
      }
      throw new Error(`Save failed. Toast: "${msg}". Errors: [${errorFields.join(' | ')}]`);
    }
    await this.page.waitForURL(/accountList|createNewAccnt/, { timeout: 15_000 }).catch(() => {});
    return msg;
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  async create(data: AccountOpeningFormData): Promise<string> {
    await this.fillForm(data);
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

  async isRecordInPendingGrid(searchText: string): Promise<boolean> {
    await this.page.waitForTimeout(1_000);
    const inDt = await this.page.locator('#dt-pendingdata tbody tr')
      .filter({ hasText: searchText }).first()
      .isVisible({ timeout: 8_000 }).catch(() => false);
    if (inDt) return true;
    return this.page.locator('table tbody tr')
      .filter({ hasText: searchText }).first()
      .isVisible({ timeout: 5_000 }).catch(() => false);
  }

  async getErrorToastMessage(): Promise<string> {
    const toast = this.page.locator('.toast-messages .msg-toast.msg-error em').first();
    await toast.waitFor({ state: 'visible', timeout: 5_000 });
    return (await toast.innerText()).trim();
  }

  async verifyFieldReadOnly(fieldId: string): Promise<void> {
    const loc = this.f(fieldId);
    const isDisabled = await loc.isDisabled().catch(() => false);
    const isReadonly = await loc.getAttribute('readonly').then(v => v !== null).catch(() => false);
    expect(isDisabled || isReadonly, `Field #${fieldId} must be read-only`).toBe(true);
  }
}

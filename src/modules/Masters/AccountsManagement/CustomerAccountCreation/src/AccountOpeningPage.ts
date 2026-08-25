import { Locator, expect } from '@playwright/test';
import { BasePage } from '../../../../../framework/base/BasePage';

export interface AccountOpeningFormData extends Record<string, unknown> {
  customerId?:      string;
  acType?:          string;   // Select2 — product/scheme code e.g. '1-SAVINGS'
  branchCode?:      string;   // F2 lookup
  intRate?:         string;   // Interest Rate (optional, auto-populated)
  openDate?:        string;   // DD-MM-YYYY
  minBal?:          string;   // Minimum Balance
  operMode?:        string;   // Operation Mode — native select
  nomineeName?:     string;
  nomineeRelation?: string;   // native select
  nomineeDob?:      string;   // DD-MM-YYYY
  nomineeAddr?:     string;
  remark?:          string;
}

export class AccountOpeningPage extends BasePage {
  readonly pageTitle  = 'Customer Account Creation';
  readonly menuCode   = 'PRDACNOMST';
  readonly listUrl    = '/accountList';
  readonly createUrl  = '/addAccount';

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

  // native <select>: poll until enabled → selectOption → Tab
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

  // Select2: click container → type to filter → click matching option
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

  // F2 popup lookup: click F2 button → wait for #add-popnew → fill search → click first result
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

  // ── List page ────────────────────────────────────────────────────────────────
  async openCreateForm(): Promise<void> {
    const btn = this.page.locator('#btnAddAccount, a.button.add, button.button.add').first();
    await btn.waitFor({ state: 'visible', timeout: 15_000 });
    await btn.click({ force: true });
    await this.f('customerId').waitFor({ state: 'visible', timeout: 30_000 });
  }

  async searchRecord(searchText: string): Promise<void> {
    const box = this.page.locator('#searchBox, input[type="search"]').first();
    await box.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await box.fill(searchText, { force: true }).catch(() => {});
    await this.page.waitForTimeout(800);
  }

  async clickEdit(): Promise<void> {
    await this.page.locator('a.button.edit, button.button.edit').first().click();
    await this.f('customerId').waitFor({ state: 'visible', timeout: 15_000 });
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
    // Customer ID — Tab triggers AJAX to load customer details
    if (data.customerId !== undefined) {
      await this.inp('customerId', data.customerId);
      await this.page.waitForTimeout(1_000);
    }

    // Account Type — Select2 (product/scheme)
    if (data.acType !== undefined) await this.sel2('acType', data.acType);

    // Branch Code — F2 lookup
    if (data.branchCode !== undefined) await this.f2Lookup('branchCode', data.branchCode);

    // Open Date
    if (data.openDate !== undefined) {
      await this.inp('openDate', data.openDate);
      await this.page.waitForTimeout(200);
    }

    // Minimum Balance
    if (data.minBal !== undefined) await this.inp('minBal', data.minBal);

    // Operation Mode — native select
    if (data.operMode !== undefined) await this.sel('operMode', data.operMode);

    // Nominee section
    if (data.nomineeName     !== undefined) await this.inp('nomineeName',     data.nomineeName);
    if (data.nomineeRelation !== undefined) await this.sel('nomineeRelation', data.nomineeRelation);
    if (data.nomineeDob      !== undefined) await this.inp('nomineeDob',      data.nomineeDob);
    if (data.nomineeAddr     !== undefined) await this.inp('nomineeAddr',     data.nomineeAddr);

    // Remark
    if (data.remark !== undefined) await this.inp('remark', data.remark);
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  // CBS save flow (same as all CBS screens):
  //   1. Click #saveCustomer → cbs.core.js adds 'tinymodal-showing' to #tm-saveconfirm
  //   2. Click #submitForm (Yes) → validateForm() → POST submit
  //   3. Wait for .msg-toast.msg-success em
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
    await this.page.waitForURL(/accountList/, { timeout: 15_000 }).catch(() => {});
    return msg;
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  async create(data: AccountOpeningFormData): Promise<string> {
    await this.fillForm(data);
    return this.save();
  }

  async update(searchText: string, data: Partial<AccountOpeningFormData>): Promise<string> {
    await this.searchRecord(searchText);
    await this.clickEdit();
    await this.fillForm(data as AccountOpeningFormData);
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

  async isRecordInAuthorizedGrid(searchText: string): Promise<boolean> {
    return this.page.locator('#dt-authdata tbody tr')
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

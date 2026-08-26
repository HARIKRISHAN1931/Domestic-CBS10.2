import { Locator, expect } from '@playwright/test';
import { BasePage } from '../../../../../framework/base/BasePage';

export interface TDContractData extends Record<string, unknown> {
  // Mandatory
  customerCode:    string;
  productCode:     string;
  schemeCode:      string;
  depositAmount:   string;
  depositMonths:   string;
  // Optional
  depositDays?:    string;
  modeOfOprn?:     string;
  sourceOfFund?:   string;
  debitAccID?:     string;
  instrType?:      string;
  instrNo?:        string;
  instrDate?:      string;
  matNoticeYn?:    'Y' | 'N';
  noticeHardCopyYn?: 'Y' | 'N';
  noticeAddress?:  string;
  autoRenewYn?:    'Y' | 'N';
  nomineeYn?:      'Y' | 'N';
  sIDetailsYn?:    'Y' | 'N';
  intPayOutInstrYn?: 'Y' | 'N';
  matInstrYn?:     'Y' | 'N';
  spclInstr?:      string;
  modeOfOprnDesc?: string;
  // Nominee holder fields
  holderType?:     string;
  holderSalutation?: string;
  holderFName?:    string;
  holderMName?:    string;
  holderLName?:    string;
  holderDOB?:      string;
  holderRelWithCust?: string;
  email?:          string;
  phoneNumber?:    string;
}

export class TermDepositPage extends BasePage {
  readonly pageTitle = 'Term Deposit Contract';
  readonly menuCode  = 'TERMDEPOSITCONTRACTD';
  readonly subSection = 'td';
  readonly topSection = 'Masters';

  private f = (id: string): Locator => this.page.locator(`#${id}`).first();

  private inp = async (id: string, val: string): Promise<void> => {
    if (!val) return;
    const loc = this.f(id);
    await loc.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await loc.click({ force: true });
    await loc.fill(val);
    await loc.press('Tab');
    await this.page.waitForTimeout(100);
  };

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

  private radio = async (id: string): Promise<void> => {
    await this.f(id).click({ force: true }).catch(() => {});
    await this.page.waitForTimeout(200);
  };

  // Poll until select has >1 options (AJAX cascade)
  private waitForOptions = async (id: string, ms = 12_000): Promise<void> => {
    const loc = this.f(id);
    const deadline = Date.now() + ms;
    while (Date.now() < deadline) {
      if (await loc.locator('option').count().catch(() => 0) > 1) return;
      await this.page.waitForTimeout(400);
    }
  };

  // ── List page ────────────────────────────────────────────────────────────────
  async openCreateForm(): Promise<void> {
    const btn = this.page.locator('a.button.add, button.button.add, #btnAddTD, #addButton').first();
    await btn.waitFor({ state: 'visible', timeout: 15_000 });
    await btn.click({ force: true });
    await this.f('customerCode').waitFor({ state: 'visible', timeout: 30_000 });
  }

  async searchRecord(searchText: string): Promise<void> {
    const box = this.page.locator('#searchBox, input[type="search"]').first();
    await box.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await box.fill(searchText, { force: true }).catch(() => {});
    await this.page.waitForTimeout(800);
  }

  async clickEdit(): Promise<void> {
    await this.page.locator('a.button.edit, button.button.edit, a.dt-quickedit').first().click();
    await this.f('customerCode').waitFor({ state: 'visible', timeout: 15_000 });
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
  async fillForm(data: TDContractData): Promise<void> {
    // Customer — Tab triggers AJAX to load customer name + products
    await this.inp('customerCode', data.customerCode);
    await this.waitForOptions('productCode');

    // Product → triggers schemeCode AJAX
    await this.sel('productCode', data.productCode);
    await this.waitForOptions('schemeCode');

    // Scheme
    await this.sel('schemeCode', data.schemeCode);
    await this.page.waitForTimeout(500);

    // Deposit amount + Tab triggers interest/maturity calculation
    await this.inp('depositAmount_txt', data.depositAmount);

    // Tenure
    if (data.depositMonths) await this.inp('depositMonths', data.depositMonths);
    if (data.depositDays)   await this.inp('depositDays',   data.depositDays);
    await this.page.waitForTimeout(500);

    // Mode of operation
    if (data.modeOfOprn)      await this.sel('modeOfOprn',   data.modeOfOprn);
    if (data.modeOfOprnDesc)  await this.inp('modeOfOprnDesc', data.modeOfOprnDesc);

    // Source of fund
    if (data.sourceOfFund) await this.sel('sourceOfFund', data.sourceOfFund);

    // Debit account (only if enabled)
    if (data.debitAccID) {
      const dis = await this.f('debitAccID').isDisabled().catch(() => true);
      if (!dis) await this.inp('debitAccID', data.debitAccID);
    }

    // Instrument
    if (data.instrType) await this.sel('instrType', data.instrType);
    if (data.instrNo)   await this.inp('instrNo',   data.instrNo);
    if (data.instrDate) await this.inp('instrDate', data.instrDate);

    // Maturity notice
    if (data.matNoticeYn) {
      await this.radio(data.matNoticeYn === 'Y' ? 'matNoticeY' : 'matNoticeN');
      if (data.matNoticeYn === 'Y') {
        if (data.noticeHardCopyYn) await this.radio(data.noticeHardCopyYn === 'Y' ? 'noticeHardCopyY' : 'noticeHardCopyN');
        if (data.noticeAddress)    await this.sel('noticeAddress', data.noticeAddress);
      }
    }

    // Auto renew
    if (data.autoRenewYn) await this.radio(data.autoRenewYn === 'Y' ? 'autoRenewY' : 'autoRenewN');

    // SI Details
    if (data.sIDetailsYn) await this.radio(data.sIDetailsYn === 'Y' ? 'sIDetailsY' : 'sIDetailsN');

    // Interest payout instruction
    if (data.intPayOutInstrYn) await this.radio(data.intPayOutInstrYn === 'Y' ? 'intPayOutInstrY' : 'intPayOutInstrN');

    // Maturity instruction
    if (data.matInstrYn) await this.radio(data.matInstrYn === 'Y' ? 'matInstrY' : 'matInstrN');

    // Nominee
    if (data.nomineeYn) {
      await this.radio(data.nomineeYn === 'Y' ? 'nomineeY' : 'nomineeN');
      if (data.nomineeYn === 'Y') {
        if (data.holderType)        await this.sel('holderType',        data.holderType);
        if (data.holderSalutation)  await this.sel('holderSalutation',  data.holderSalutation);
        if (data.holderFName)       await this.inp('holderFName',       data.holderFName);
        if (data.holderMName)       await this.inp('holderMName',       data.holderMName);
        if (data.holderLName)       await this.inp('holderLName',       data.holderLName);
        if (data.holderDOB)         await this.inp('holderDOB',         data.holderDOB);
        if (data.holderRelWithCust) await this.sel('holderRelWithCust', data.holderRelWithCust);
        if (data.email)             await this.inp('email',             data.email);
        if (data.phoneNumber)       await this.inp('phoneNumber',       data.phoneNumber);
      }
    }

    // Special instructions
    if (data.spclInstr) await this.inp('spclInstr', data.spclInstr);
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  async save(): Promise<string> {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);

    const saveBtn = this.page.locator('#saveCustomer, #saveParamDetails, #btnSave, a.button.sm.btn-save').first();
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
    await this.page.waitForURL(/d020004|tdList|termDeposit/, { timeout: 15_000 }).catch(() => {});
    return msg;
  }

  async create(data: TDContractData): Promise<string> {
    await this.fillForm(data);
    return this.save();
  }

  async update(searchText: string, data: Partial<TDContractData>): Promise<string> {
    await this.searchRecord(searchText);
    await this.clickEdit();
    await this.fillForm(data as TDContractData);
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

import { Locator } from '@playwright/test';
import { BasePage } from '../../../../../framework/base/BasePage';

export interface BlacklistingOfCustomersData extends Record<string, unknown> {
  custNo?:          string;   // Customer Number — lookup field (MANDATORY)
  blacklistReason?: string;   // Reason for blacklisting — Select (MANDATORY)
  blacklistDate?:   string;   // Date of blacklisting — DateInput dd-MM-yyyy (MANDATORY)
  remarks?:         string;   // Remarks / Narration — TextInput (Optional)
  // Auth / Update control
  searchKey?:       string;
  tab?:             string;
}

export class BlacklistingOfCustomersPage extends BasePage {
  readonly pageTitle = 'Blacklisting Of Customers';

  private v   = (id: string): Locator => this.loc(`#${id}`);
  private async inp(id: string, val: string)  { if (val) await this.fill(this.v(id), val); }
  private async sel(id: string, val: string)  { if (val) await this.selectOption(this.v(id), val); await this.waitForAjax(); }
  private async vis(id: string)               { return this.v(id).isVisible().catch(() => false); }

  async openCreateForm(): Promise<void> {
    const addBtn = this.page.locator('#addButton, button.add, #createButton, a[onclick*="add"], button[title*="Add"]').first();
    await addBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await addBtn.click({ force: true });
    await this.page.locator('#custNo, #customerNo, #customerId').first()
      .waitFor({ state: 'visible', timeout: 20_000 });
    await this.waitForAjax();
  }

  async fillForm(data: BlacklistingOfCustomersData): Promise<void> {
    // Customer Number — enter and Tab to trigger lookup/validation
    if (data.custNo) {
      const custField = this.page.locator('#custNo, #customerNo, #customerId').first();
      await custField.waitFor({ state: 'visible', timeout: 10_000 });
      await custField.fill(data.custNo);
      await custField.press('Tab');
      await this.waitForAjax();
    }
    if (data.blacklistReason && await this.vis('blacklistReason')) await this.sel('blacklistReason', data.blacklistReason);
    if (data.blacklistDate   && await this.vis('blacklistDate'))   await this.inp('blacklistDate',   data.blacklistDate);
    if (data.remarks         && await this.vis('remarks'))         await this.inp('remarks',         data.remarks);
  }

  async save(): Promise<string> {
    const btn = this.page.locator(
      '#saveBlacklist, #saveCustBlacklist, #saveDepositeparamDetails, #saveCustomerDetails, button[id*="save"], input[id*="save"]'
    ).filter({ visible: true }).first();
    await btn.waitFor({ state: 'visible', timeout: 10_000 });
    await btn.click();
    await this.modal.confirmSave();
    await this.switchToActivePage();
    const errToast = this.page.locator('.toast-messages .msg-toast.msg-error em').first();
    if (await errToast.isVisible({ timeout: 5_000 }).catch(() => false)) {
      throw new Error(`[CBS] ${(await errToast.innerText().catch(() => '')).trim()}`);
    }
    return this.toast.getSuccess();
  }

  async approve(searchKey: string, tab = 'pending'): Promise<string> {
    await this.grid.switchTab(tab as any);
    await this.grid.clickAuthorize(searchKey);
    await this.modal.confirmApprove();
    await this.switchToActivePage();
    const errToast = this.page.locator('.toast-messages .msg-toast.msg-error em').first();
    if (await errToast.isVisible({ timeout: 5_000 }).catch(() => false)) {
      throw new Error(`[CBS] ${(await errToast.innerText().catch(() => '')).trim()}`);
    }
    return this.toast.getSuccess();
  }
}

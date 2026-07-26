import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../framework/base/BasePage';

export interface TDContractData {
  customerCode:       string;
  productCode:        string;
  schemeCode:         string;
  depositAmount:      string;
  custType?:          string;
  accountType?:       string;
  depositAccntBranch?: string;
  depositMonths?:     string;
  depositDays?:       string;
  depFreq?:           string;
  accountName?:       string;
  modeOfOprn?:        string;
  sourceOfFund?:      string;
  debitAccID?:        string;
  instrType?:         string;
  instrNo?:           string;
  instrDate?:         string;
  matNoticeYn?:       string;
  noticeHardCopyYn?:  string;
  noticeAddress?:     string;
  autoRenewYn?:       string;
  nomineeYn?:         string;
  sIDetailsYn?:       string;
  intPayOutInstrYn?:  string;
  matInstrYn?:        string;
  remarks?:           string;
  spclInstr?:         string;
  tag?:               string;
  accountId?:         string;
}

export class TermDepositPage extends BasePage {
  readonly pageTitle = 'Term Deposit Contract';
  readonly pageUrl   = '';

  private v     = (id: string): Locator => this.page.locator(`#${id}`);
  private inp   = async (id: string, val: string) => { await this.fillField(this.v(id), val); };
  private sel   = async (id: string, val: string) => { await this.selectDropdown(this.v(id), val); };
  private selOpt = async (id: string, val: string) => { await this.v(id).selectOption(val).catch(() => {}); };
  private tab   = async (id: string) => { await this.v(id).press('Tab'); };
  private radio = async (id: string) => { await this.v(id).click().catch(() => {}); };

  private async waitForAjax() {
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    await this.page.evaluate(() => new Promise<void>(resolve => {
      const check = () => ((window as any).jQuery?.active > 0) ? setTimeout(check, 100) : resolve();
      check();
    })).catch(() => {});
  }

  private async selScheme(val: string): Promise<void> {
    const loc = this.v('schemeCode');
    await loc.locator('option').nth(1).waitFor({ state: 'attached', timeout: 10_000 }).catch(() => {});
    await this.waitForAjax();
    const totalOptions = await loc.locator('option').count().catch(() => 0);
    const nonEmpty: string[] = [];
    for (let i = 0; i < totalOptions; i++) {
      const optVal = await loc.locator('option').nth(i).getAttribute('value').catch(() => '');
      if (optVal && optVal.trim() !== '') nonEmpty.push(optVal);
    }
    const exactMatch = await loc.selectOption(val).then(() => true).catch(() => false);
    if (exactMatch) return;
    const idx = parseInt(val, 10);
    if (!isNaN(idx) && idx >= 1 && idx <= nonEmpty.length) { await loc.selectOption(nonEmpty[idx - 1]); return; }
    if (nonEmpty.length > 0) await loc.selectOption(nonEmpty[0]);
  }

  async openCreateForm(): Promise<void> {
    await this.page.locator('button.add, #addButton, a.button.add').first().click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.waitForAjax();
  }

  async fillForm(data: TDContractData): Promise<void> {
    await this.v('customerCode').waitFor({ state: 'visible', timeout: 15_000 });
    await this.inp('customerCode', data.customerCode);
    await this.tab('customerCode');
    await this.waitForAjax();
    if (data.accountName) await this.inp('accountName', data.accountName);
    await this.sel('productCode', data.productCode);
    await this.waitForAjax();
    await this.selScheme(data.schemeCode);
    await this.inp('depositAmount_txt', data.depositAmount);
    await this.tab('depositAmount_txt');
    await this.waitForAjax();
    if (data.depositMonths) { await this.inp('depositMonths', data.depositMonths); await this.tab('depositMonths'); }
    if (data.depositDays)   { await this.inp('depositDays',   data.depositDays);   await this.tab('depositDays'); }
    if (data.depFreq)         await this.selOpt('depFreq',      data.depFreq);
    if (data.modeOfOprn)      await this.selOpt('modeOfOprn',   data.modeOfOprn);
    if (data.sourceOfFund)    await this.selOpt('sourceOfFund', data.sourceOfFund);
    if (data.debitAccID) {
      const disabled = await this.v('debitAccID').isDisabled().catch(() => true);
      if (!disabled) { await this.inp('debitAccID', data.debitAccID); await this.tab('debitAccID'); }
    }
    if (data.instrType) await this.selOpt('instrType', data.instrType);
    if (data.instrNo)   await this.inp('instrNo',  data.instrNo);
    if (data.instrDate) { await this.inp('instrDate', data.instrDate); await this.tab('instrDate'); }
    if (data.matNoticeYn) {
      await this.radio(data.matNoticeYn === 'Y' ? 'matNoticeY' : 'matNoticeN');
      if (data.matNoticeYn === 'Y') {
        if (data.noticeHardCopyYn) await this.radio(data.noticeHardCopyYn === 'Y' ? 'noticeHardCopyY' : 'noticeHardCopyN');
        if (data.noticeAddress)    await this.selOpt('noticeAddress', data.noticeAddress);
      }
    }
    if (data.autoRenewYn) await this.radio(data.autoRenewYn === 'Y' ? 'autoRenewY' : 'autoRenewN');
    if (data.nomineeYn)   await this.radio(data.nomineeYn   === 'Y' ? 'nomineeY'   : 'nomineeN');
    if (data.sIDetailsYn) await this.radio(data.sIDetailsYn === 'Y' ? 'sIDetailsY' : 'sIDetailsN');
    if (data.remarks)     await this.inp('remarks',   data.remarks);
    if (data.spclInstr)   await this.inp('spclInstr', data.spclInstr);
  }

  async save(): Promise<string> {
    const btn = this.page.locator('#saveParamDetails, #btnSave, a.button.sm.btn-save').first();
    await btn.waitFor({ state: 'attached', timeout: 10_000 });
    await btn.click({ force: true });
    await this.page.locator('#submitForm').waitFor({ state: 'visible', timeout: 10_000 });
    await this.page.locator('#submitForm').click();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em');
    await toast.first().waitFor({ state: 'visible', timeout: 20_000 });
    return (await toast.first().innerText()).trim();
  }

  async create(data: TDContractData): Promise<string> {
    await this.fillForm(data);
    return this.save();
  }
}

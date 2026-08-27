import { Locator } from '@playwright/test';
import { BasePage } from '../../../../../framework/base/BasePage';

export interface RtgsNeftEntryData extends Record<string, unknown> {
  // Transaction type
  msgTrfType?:      string;   // 1=RTGS, 2=NEFT, 3=IMPS (MANDATORY)
  msgSType?:        string;   // N02,N06,R10,R41,R42 (MANDATORY)
  msgDate?:         string;   // dd-mm-yyyy
  rtgsNeftAcctId?:  string;   // RTGS/NEFT Account ID maxLen=32
  tBatchCd?:        string;   // Batch Code
  // Ordering party
  ordIFSCCd?:       string;   // Ordering IFSC — Tab triggers lookup
  orgBrCode?:       string;   // Originating Branch (Select)
  ordAcctId?:       string;   // Ordering Account ID maxLen=32
  ordDesc1?:        string;   // Ordering account no
  ordDesc2?:        string;   // Ordering customer name
  ordDesc3?:        string;   // Ordering address line 1
  ordDesc4?:        string;   // Ordering address line 2
  ordDesc5?:        string;   // Ordering address line 3
  // Contact
  mobileEmail?:     string;   // 1=MOBILENO, 2=EMAIL
  mobileNo?:        string;   // maxLen=10
  email?:           string;   // maxLen=100
  // Instrument
  insType?:         string;   // Instrument type Select
  chequeNo?:        string;   // Instrument number
  instrDate?:       string;   // Instrument date dd-mm-yyyy
  insDate?:         string;   // dd-mm-yyyy
  valueAmt_txt?:    string;   // Transaction amount (visible) maxLen=16
  // LEI / Org
  cusLeiNo?:        string;   // Customer LEI maxLen=20
  benLeiNo?:        string;   // Beneficiary LEI maxLen=20
  organisationCode?:string;   // maxLen=32
  // Charges (ReadOnly — auto-calculated)
  dtlsOfChrgs?:     string;   // Details of charges Select
  msgPriority?:     string;   // Message priority Select
  // Beneficiary
  exisBenDesc?:     string;   // Existing beneficiary account id maxLen=32
  benIFSCCd?:       string;   // Beneficiary IFSC — Tab triggers lookup maxLen=32
  benaccountVer?:   string;   // Beneficiary account verification (password)
  benDesc1?:        string;   // Beneficiary account id maxLen=32
  benDesc2?:        string;   // Beneficiary name maxLen=34
  benDesc3?:        string;   // Beneficiary address 1 maxLen=34
  benDesc4?:        string;   // Beneficiary address 2 maxLen=34
  benDesc5?:        string;   // Beneficiary address 3 maxLen=34
  // Remittance info
  fldNo?:           string;   // 6305=DONATION, 7023=PAYMENT DETAILS, 7495=SENDER TO RECEIVER INFO
  fld1?:            string;   // Description 1
  fld2?:            string;   // Description 2 maxLen=34
  fld3?:            string;   // Description 3 maxLen=34
  fld4?:            string;   // Description 4 maxLen=34
  fld5?:            string;   // Description 5 maxLen=34
  // Auth/Update control
  searchKey?:       string;
  tab?:             string;
}

export class RtgsNeftEntryPage extends BasePage {
  readonly pageTitle = 'RTGS/NEFT Entry';

  private v  = (id: string): Locator => this.loc(`#${id}`);
  private async inp(id: string, val: string)  { if (val) await this.fill(this.v(id), val); }
  private async sel(id: string, val: string)  { if (val) await this.selectOption(this.v(id), val); await this.waitForAjax(); }
  private async vis(id: string): Promise<boolean> { return this.v(id).isVisible().catch(() => false); }

  async openCreateForm(): Promise<void> {
    const addBtn = this.page.locator('#addButton, .add-btn, #createButton, a[onclick*="add"]').first();
    await addBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await addBtn.click();
    await this.v('msgTrfType').waitFor({ state: 'visible', timeout: 20_000 });
    await this.waitForAjax();
  }

  async fillForm(data: RtgsNeftEntryData): Promise<void> {
    // Transaction type — must be first as it drives conditional fields
    if (data.msgTrfType) { await this.sel('msgTrfType', data.msgTrfType); }
    if (data.msgSType)   { await this.sel('msgSType',   data.msgSType); }
    if (data.msgDate)    { await this.inp('msgDate',    data.msgDate); }
    if (data.rtgsNeftAcctId) { await this.inp('rtgsNeftAcctId', data.rtgsNeftAcctId); }
    if (data.tBatchCd)   { await this.sel('tBatchCd',   data.tBatchCd); }

    // Ordering IFSC — Tab to trigger bank lookup
    if (data.ordIFSCCd) {
      await this.inp('ordIFSCCd', data.ordIFSCCd);
      await this.v('ordIFSCCd').press('Tab');
      await this.waitForAjax();
    }
    if (data.orgBrCode)  { await this.sel('orgBrCode',  data.orgBrCode); }
    if (data.ordAcctId)  { await this.inp('ordAcctId',  data.ordAcctId); }
    if (data.ordDesc1)   { await this.inp('ordDesc1',   data.ordDesc1); }
    if (data.ordDesc2)   { await this.inp('ordDesc2',   data.ordDesc2); }
    if (data.ordDesc3)   { await this.inp('ordDesc3',   data.ordDesc3); }
    if (data.ordDesc4)   { await this.inp('ordDesc4',   data.ordDesc4); }
    if (data.ordDesc5)   { await this.inp('ordDesc5',   data.ordDesc5); }

    // Contact
    if (data.mobileEmail) { await this.sel('mobileEmail', data.mobileEmail); }
    if (data.mobileNo && await this.vis('mobileNo')) { await this.inp('mobileNo', data.mobileNo); }
    if (data.email    && await this.vis('email'))    { await this.inp('email',    data.email); }

    // Instrument
    if (data.insType)    { await this.sel('insType',    data.insType); }
    if (data.chequeNo)   { await this.inp('chequeNo',   data.chequeNo); }
    if (data.instrDate)  { await this.inp('instrDate',  data.instrDate); }
    if (data.insDate)    { await this.inp('insDate',    data.insDate); }

    // Amount — Tab to trigger charge calculation
    if (data.valueAmt_txt) {
      await this.inp('valueAmt_txt', data.valueAmt_txt);
      await this.v('valueAmt_txt').press('Tab');
      await this.waitForAjax();
    }

    // LEI / Org
    if (data.cusLeiNo)        { await this.inp('cusLeiNo',        data.cusLeiNo); }
    if (data.benLeiNo)        { await this.inp('benLeiNo',        data.benLeiNo); }
    if (data.organisationCode){ await this.inp('organisationCode',data.organisationCode); }

    // Charges
    if (data.dtlsOfChrgs) { await this.sel('dtlsOfChrgs', data.dtlsOfChrgs); }
    if (data.msgPriority) { await this.sel('msgPriority', data.msgPriority); }

    // Beneficiary IFSC — Tab to trigger lookup
    if (data.benIFSCCd) {
      await this.inp('benIFSCCd', data.benIFSCCd);
      await this.v('benIFSCCd').press('Tab');
      await this.waitForAjax();
    }
    if (data.exisBenDesc)   { await this.inp('exisBenDesc',   data.exisBenDesc); }
    if (data.benaccountVer) { await this.inp('benaccountVer', data.benaccountVer); }
    if (data.benDesc1)      { await this.inp('benDesc1',      data.benDesc1); }
    if (data.benDesc2)      { await this.inp('benDesc2',      data.benDesc2); }
    if (data.benDesc3)      { await this.inp('benDesc3',      data.benDesc3); }
    if (data.benDesc4)      { await this.inp('benDesc4',      data.benDesc4); }
    if (data.benDesc5)      { await this.inp('benDesc5',      data.benDesc5); }

    // Remittance info
    if (data.fldNo) { await this.sel('fldNo', data.fldNo); }
    if (data.fld1)  { await this.inp('fld1',  data.fld1); }
    if (data.fld2)  { await this.inp('fld2',  data.fld2); }
    if (data.fld3)  { await this.inp('fld3',  data.fld3); }
    if (data.fld4)  { await this.inp('fld4',  data.fld4); }
    if (data.fld5)  { await this.inp('fld5',  data.fld5); }
  }

  async save(): Promise<string> {
    const btn = this.page.locator(
      '#saveD946020, #saveRtgsNeft, #saveDepositeparamDetails, button[id*="save"], input[id*="save"]'
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

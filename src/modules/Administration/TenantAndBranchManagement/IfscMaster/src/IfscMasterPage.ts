import { Locator } from '@playwright/test';
import { BasePage } from '../../../../../framework/base/BasePage';

export interface IfscMasterData {
  ifscCd?: string;
  bankName?: string;
  bankRbiCd?: string;
  branchRbiCd?: string;
  addr1?: string;
  addr2?: string;
  addr3?: string;
  city?: string;
  state?: string;
  memberCode1?: string;
  memberFullName1?: string;
  refDocNo1?: string;
  memberDOB1?: string;
  moduleCode1?: string;
  moduleName1?: string;
  productCode1?: string;
  productName1?: string;
  schemeCode1?: string;
  schemeName1?: string;
  AccountSearchBox?: string;
  memberCodeSearch?: string;
  memberNameSearch?: string;
  phoneNoSearch?: string;
  panNoSearch?: string;
  dobSearch?: string;
  venderCode?: string;
  venderName?: string;
  ifscCodeSearch?: string;
  applicationNoSearch?: string;
  BlockCardSearchBox?: string;
  cardNoSearch?: string;
  UserMasterSearchBox?: string;
  EmployeeMasterSearchBox?: string;
  CenterMasterSearchBox?: string;
  BranchMasterSearchBox?: string;
  GroupMasterSearchBox?: string;
  BICCodeSearchBox?: string;
}

export class IfscMasterPage extends BasePage {
  readonly pageTitle = 'IFSC Master';

  private v   = (id: string): Locator => this.page.locator(`#${id}`).first();
  private inp = async (id: string, val: string) => { await this.fill(this.v(id), val); };
  private sel = async (id: string, val: string) => { await this.selectOption(this.v(id), val); };
  private tab = async (id: string) => { await this.v(id).press('Tab'); };

  async openCreateForm(): Promise<void> {
    const addBtn = this.page.locator('#addButton');
    await addBtn.waitFor({ state: 'attached', timeout: 15_000 });
    await addBtn.click({ force: true });
    await this.waitForAjax();
    await this.page.locator('#ifscCd').first().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async fillForm(data: IfscMasterData): Promise<void> {
    await this.waitForAjax();
    if (data.ifscCd !== undefined) { await this.inp('ifscCd', data.ifscCd!); await this.tab('ifscCd'); }
    if (data.bankName !== undefined) { await this.inp('bankName', data.bankName!); await this.tab('bankName'); }
    if (data.bankRbiCd !== undefined) await this.sel('bankRbiCd', data.bankRbiCd!);
    if (data.branchRbiCd !== undefined) await this.sel('branchRbiCd', data.branchRbiCd!);
    if (data.addr1 !== undefined) { await this.inp('addr1', data.addr1!); await this.tab('addr1'); }
    if (data.addr2 !== undefined) { await this.inp('addr2', data.addr2!); await this.tab('addr2'); }
    if (data.addr3 !== undefined) { await this.inp('addr3', data.addr3!); await this.tab('addr3'); }
    if (data.city !== undefined) { await this.inp('city', data.city!); await this.tab('city'); }
    if (data.state !== undefined) { await this.inp('state', data.state!); await this.tab('state'); }
    if (data.memberCode1 !== undefined) { await this.inp('memberCode1', data.memberCode1!); await this.tab('memberCode1'); }
    if (data.memberFullName1 !== undefined) { await this.inp('memberFullName1', data.memberFullName1!); await this.tab('memberFullName1'); }
    if (data.refDocNo1 !== undefined) { await this.inp('refDocNo1', data.refDocNo1!); await this.tab('refDocNo1'); }
    if (data.memberDOB1 !== undefined) { await this.inp('memberDOB1', data.memberDOB1!); await this.tab('memberDOB1'); }
    if (data.moduleCode1 !== undefined) { await this.inp('moduleCode1', data.moduleCode1!); await this.tab('moduleCode1'); }
    if (data.moduleName1 !== undefined) { await this.inp('moduleName1', data.moduleName1!); await this.tab('moduleName1'); }
    if (data.productCode1 !== undefined) { await this.inp('productCode1', data.productCode1!); await this.tab('productCode1'); }
    if (data.productName1 !== undefined) { await this.inp('productName1', data.productName1!); await this.tab('productName1'); }
    if (data.schemeCode1 !== undefined) { await this.inp('schemeCode1', data.schemeCode1!); await this.tab('schemeCode1'); }
    if (data.schemeName1 !== undefined) { await this.inp('schemeName1', data.schemeName1!); await this.tab('schemeName1'); }
    if (data.AccountSearchBox !== undefined) { await this.inp('AccountSearchBox', data.AccountSearchBox!); await this.tab('AccountSearchBox'); }
    if (data.memberCodeSearch !== undefined) { await this.inp('memberCodeSearch', data.memberCodeSearch!); await this.tab('memberCodeSearch'); }
    if (data.memberNameSearch !== undefined) { await this.inp('memberNameSearch', data.memberNameSearch!); await this.tab('memberNameSearch'); }
    if (data.phoneNoSearch !== undefined) { await this.inp('phoneNoSearch', data.phoneNoSearch!); await this.tab('phoneNoSearch'); }
    if (data.panNoSearch !== undefined) { await this.inp('panNoSearch', data.panNoSearch!); await this.tab('panNoSearch'); }
    if (data.dobSearch !== undefined) { await this.inp('dobSearch', data.dobSearch!); await this.tab('dobSearch'); }
    if (data.venderCode !== undefined) { await this.inp('venderCode', data.venderCode!); await this.tab('venderCode'); }
    if (data.venderName !== undefined) { await this.inp('venderName', data.venderName!); await this.tab('venderName'); }
    if (data.ifscCodeSearch !== undefined) { await this.inp('ifscCodeSearch', data.ifscCodeSearch!); await this.tab('ifscCodeSearch'); }
    if (data.applicationNoSearch !== undefined) { await this.inp('applicationNoSearch', data.applicationNoSearch!); await this.tab('applicationNoSearch'); }
    if (data.BlockCardSearchBox !== undefined) { await this.inp('BlockCardSearchBox', data.BlockCardSearchBox!); await this.tab('BlockCardSearchBox'); }
    if (data.cardNoSearch !== undefined) { await this.inp('cardNoSearch', data.cardNoSearch!); await this.tab('cardNoSearch'); }
    if (data.UserMasterSearchBox !== undefined) { await this.inp('UserMasterSearchBox', data.UserMasterSearchBox!); await this.tab('UserMasterSearchBox'); }
    if (data.EmployeeMasterSearchBox !== undefined) { await this.inp('EmployeeMasterSearchBox', data.EmployeeMasterSearchBox!); await this.tab('EmployeeMasterSearchBox'); }
    if (data.CenterMasterSearchBox !== undefined) { await this.inp('CenterMasterSearchBox', data.CenterMasterSearchBox!); await this.tab('CenterMasterSearchBox'); }
    if (data.BranchMasterSearchBox !== undefined) { await this.inp('BranchMasterSearchBox', data.BranchMasterSearchBox!); await this.tab('BranchMasterSearchBox'); }
    if (data.GroupMasterSearchBox !== undefined) { await this.inp('GroupMasterSearchBox', data.GroupMasterSearchBox!); await this.tab('GroupMasterSearchBox'); }
    if (data.BICCodeSearchBox !== undefined) { await this.inp('BICCodeSearchBox', data.BICCodeSearchBox!); await this.tab('BICCodeSearchBox'); }
  }

  async save(): Promise<string> {
    const btn = this.page.locator('#btnSave').first();
    await btn.waitFor({ state: 'visible', timeout: 15_000 });
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await btn.click({ force: true });
    await this.waitForAjax();
    // Handle confirm modal if present
    const confirm = this.page.locator('#submitForm');
    if (await confirm.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await confirm.click();
      await this.waitForAjax();
    }
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 20_000 });
    return (await toast.innerText()).trim();
  }

  async create(data: IfscMasterData): Promise<string> {
    await this.fillForm(data);
    return this.save();
  }

  async approve(searchText: string): Promise<string> {
    await this.page.locator('#dt-pendingdata tbody tr').filter({ hasText: searchText }).first()
      .locator('.authorization-btns a').first().click();
    await this.waitForAjax();
    await this.page.locator('#idApprove').click();
    await this.page.locator('#btnApproveId').click();
    await this.waitForAjax();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.innerText()).trim();
  }

  async reject(searchText: string, remark: string): Promise<string> {
    await this.page.locator('#dt-pendingdata tbody tr').filter({ hasText: searchText }).first()
      .locator('.authorization-btns a').first().click();
    await this.waitForAjax();
    await this.page.locator('#idReject').click();
    await this.page.locator('#rejectRemark, #remarkId').first().fill(remark);
    await this.page.locator('#btnRejectId').click();
    await this.waitForAjax();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.innerText()).trim();
  }

  async update(searchText: string, data: Partial<IfscMasterData>): Promise<string> {
    await this.page.locator('#searchInput, input[type="search"]').first().fill(searchText);
    await this.waitForAjax();
    await this.page.locator('a.btn-edit, .edit-btn, a[title="Edit"]').first().click();
    await this.waitForAjax();
    await this.fillForm(data as IfscMasterData);
    return this.save();
  }
}

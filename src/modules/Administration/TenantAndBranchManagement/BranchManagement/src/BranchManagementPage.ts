import { Locator } from '@playwright/test';
import { BasePage } from '../../../../../framework/base/BasePage';

export interface BranchManagementData {
  newBranch?: string;
  copyBranch?: string;
  previousBranchCode?: string;
  branchTypeCode?: string;
  parentBranchCode?: string;
  ifscCode?: string;
  micrCode?: string;
  sourceHeadOffice?: string;
  emailId?: string;
  baseCurrency?: string;
  bsrCode?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  countryCode?: string;
  stateCode?: string;
  districtCode?: string;
  municipalityCode?: string;
  villageCode?: string;
  postalCode?: string;
  tele1?: string;
  tele2?: string;
  faxNumber?: string;
  finYearFromCode?: string;
  finYearToCode?: string;
  branchDayFromCode?: string;
  branchDayToCode?: string;
  branchFromTime?: string;
  branchToTime?: string;
  weeklyOff1Code?: string;
  weeklyOff2Code?: string;
  weeklyHalfOff1Code?: string;
  weeklyHalfOff2Code?: string;
  contactPerson?: string;
  moduleMaps?: string;
  swiftCode?: string;
  clusterNo?: string;
  ipNo?: string;
  parentBranchCode1?: string;
  parentBranchCode2?: string;
  parentBranchCode3?: string;
  mappedValue?: string;
  docUpload?: string;
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

export class BranchManagementPage extends BasePage {
  readonly pageTitle = 'Branch Management';

  private v   = (id: string): Locator => this.page.locator(`#${id}`).first();
  private inp = async (id: string, val: string) => { await this.fill(this.v(id), val); };
  private sel = async (id: string, val: string) => { await this.selectOption(this.v(id), val); };
  private tab = async (id: string) => { await this.v(id).press('Tab'); };

  async openCreateForm(): Promise<void> {
    const addBtn = this.page.locator('#addButton');
    await addBtn.waitFor({ state: 'attached', timeout: 15_000 });
    await addBtn.click({ force: true });
    await this.waitForAjax();
    await this.page.locator('#branchCode').first().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async fillForm(data: BranchManagementData): Promise<void> {
    await this.waitForAjax();
    if (data.newBranch !== undefined) await this.page.locator('#' + data.newBranch).click().catch(() => {});
    if (data.copyBranch !== undefined) await this.page.locator('#' + data.copyBranch).click().catch(() => {});
    if (data.previousBranchCode !== undefined) await this.sel('previousBranchCode', data.previousBranchCode!);
    if (data.branchTypeCode !== undefined) await this.sel('branchTypeCode', data.branchTypeCode!);
    if (data.parentBranchCode !== undefined) { await this.inp('parentBranchCode', data.parentBranchCode!); await this.tab('parentBranchCode'); }
    if (data.ifscCode !== undefined) { await this.inp('ifscCode', data.ifscCode!); await this.tab('ifscCode'); }
    if (data.micrCode !== undefined) { await this.inp('micrCode', data.micrCode!); await this.tab('micrCode'); }
    if (data.sourceHeadOffice !== undefined) { await this.inp('sourceHeadOffice', data.sourceHeadOffice!); await this.tab('sourceHeadOffice'); }
    if (data.emailId !== undefined) { await this.inp('emailId', data.emailId!); await this.tab('emailId'); }
    if (data.baseCurrency !== undefined) await this.sel('baseCurrency', data.baseCurrency!);
    if (data.bsrCode !== undefined) { await this.inp('bsrCode', data.bsrCode!); await this.tab('bsrCode'); }
    if (data.address1 !== undefined) { await this.inp('address1', data.address1!); await this.tab('address1'); }
    if (data.address2 !== undefined) { await this.inp('address2', data.address2!); await this.tab('address2'); }
    if (data.address3 !== undefined) { await this.inp('address3', data.address3!); await this.tab('address3'); }
    if (data.countryCode !== undefined) await this.sel('countryCode', data.countryCode!);
    if (data.stateCode !== undefined) await this.sel('stateCode', data.stateCode!);
    if (data.districtCode !== undefined) await this.sel('districtCode', data.districtCode!);
    if (data.municipalityCode !== undefined) await this.sel('municipalityCode', data.municipalityCode!);
    if (data.villageCode !== undefined) await this.sel('villageCode', data.villageCode!);
    if (data.postalCode !== undefined) { await this.inp('postalCode', data.postalCode!); await this.tab('postalCode'); }
    if (data.tele1 !== undefined) { await this.inp('tele1', data.tele1!); await this.tab('tele1'); }
    if (data.tele2 !== undefined) { await this.inp('tele2', data.tele2!); await this.tab('tele2'); }
    if (data.faxNumber !== undefined) { await this.inp('faxNumber', data.faxNumber!); await this.tab('faxNumber'); }
    if (data.finYearFromCode !== undefined) await this.sel('finYearFromCode', data.finYearFromCode!);
    if (data.finYearToCode !== undefined) await this.sel('finYearToCode', data.finYearToCode!);
    if (data.branchDayFromCode !== undefined) await this.sel('branchDayFromCode', data.branchDayFromCode!);
    if (data.branchDayToCode !== undefined) await this.sel('branchDayToCode', data.branchDayToCode!);
    if (data.branchFromTime !== undefined) { await this.inp('branchFromTime', data.branchFromTime!); await this.tab('branchFromTime'); }
    if (data.branchToTime !== undefined) { await this.inp('branchToTime', data.branchToTime!); await this.tab('branchToTime'); }
    if (data.weeklyOff1Code !== undefined) await this.sel('weeklyOff1Code', data.weeklyOff1Code!);
    if (data.weeklyOff2Code !== undefined) await this.sel('weeklyOff2Code', data.weeklyOff2Code!);
    if (data.weeklyHalfOff1Code !== undefined) await this.sel('weeklyHalfOff1Code', data.weeklyHalfOff1Code!);
    if (data.weeklyHalfOff2Code !== undefined) await this.sel('weeklyHalfOff2Code', data.weeklyHalfOff2Code!);
    if (data.contactPerson !== undefined) { await this.inp('contactPerson', data.contactPerson!); await this.tab('contactPerson'); }
    if (data.moduleMaps !== undefined) await this.sel('moduleMaps', data.moduleMaps!);
    if (data.swiftCode !== undefined) { await this.inp('swiftCode', data.swiftCode!); await this.tab('swiftCode'); }
    if (data.clusterNo !== undefined) { await this.inp('clusterNo', data.clusterNo!); await this.tab('clusterNo'); }
    if (data.ipNo !== undefined) { await this.inp('ipNo', data.ipNo!); await this.tab('ipNo'); }
    if (data.parentBranchCode1 !== undefined) { await this.inp('parentBranchCode1', data.parentBranchCode1!); await this.tab('parentBranchCode1'); }
    if (data.parentBranchCode2 !== undefined) { await this.inp('parentBranchCode2', data.parentBranchCode2!); await this.tab('parentBranchCode2'); }
    if (data.parentBranchCode3 !== undefined) { await this.inp('parentBranchCode3', data.parentBranchCode3!); await this.tab('parentBranchCode3'); }
    if (data.mappedValue !== undefined) { await this.inp('mappedValue', data.mappedValue!); await this.tab('mappedValue'); }
    if (data.docUpload !== undefined) { await this.inp('docUpload', data.docUpload!); await this.tab('docUpload'); }
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
    const btn = this.page.locator('button#saveCustomer').first();
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

  async create(data: BranchManagementData): Promise<string> {
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

  async update(searchText: string, data: Partial<BranchManagementData>): Promise<string> {
    await this.page.locator('#searchInput, input[type="search"]').first().fill(searchText);
    await this.waitForAjax();
    await this.page.locator('a.btn-edit, .edit-btn, a[title="Edit"]').first().click();
    await this.waitForAjax();
    await this.fillForm(data as BranchManagementData);
    return this.save();
  }
}

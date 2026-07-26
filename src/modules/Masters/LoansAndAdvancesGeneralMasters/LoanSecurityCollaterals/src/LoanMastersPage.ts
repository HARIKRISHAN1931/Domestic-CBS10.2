import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../framework/base/BasePage';

export interface LoanCollateralData {
  memberCode:           string;
  existingOrNewColl?:   string;
  collateralType?:      string;
  collateralSubType?:   string;
  groupCodeokForPopUp?: string;
  searchModule?:        string;
  searchProduct?:       string;
  searchScheme?:        string;
  cardNoSearch?:        string;
  tag?:                 string;
}

export interface LoanSecurityData {
  custId:                      string;
  collateralIDExistsY?:        string;
  collateralIDExistsN?:        string;
  existingcolateralId?:        string;
  securityType?:               string;
  MainClsOfSec?:               string;
  MainSubClsOfSec?:            string;
  securityStatus?:             string;
  securityHeldDate?:           string;
  valuationDate?:              string;
  valuationBy?:                string;
  insuranceY?:                 string;
  insuranceN?:                 string;
  nextValuationDate?:          string;
  collateralValueAmount_txt?:  string;
  utilizedAmount_txt?:         string;
  marginPercent_txt?:          string;
  groupCodeokForPopUp?:        string;
  searchModule?:               string;
  searchProduct?:              string;
  searchScheme?:               string;
  cardNoSearch?:               string;
  tag?:                        string;
}

export interface LoanSuretyData {
  accountNumber:              string;
  customerNumber:             string;
  customerpinCode:            string;
  employerName:               string;
  employerAddress1:           string;
  employerpinCode:            string;
  surety?:                    string;
  existingCustY?:             string;
  existingCustN?:             string;
  relationshipWithApplicant?: string;
  remark?:                    string;
  businessY?:                 string;
  businessN?:                 string;
  designation?:               string;
  monthlyIncome_txt?:         string;
  guarantorWorth_txt?:        string;
  employerAddress2?:          string;
  employerAddress3?:          string;
  country1?:                  string;
  state1?:                    string;
  district1?:                 string;
  city1?:                     string;
  municipal1?:                string;
  ruralUrban1?:               string;
  village1?:                  string;
  urbanCode1?:                string;
  tag?:                       string;
}

export class LoanMastersPage extends BasePage {
  readonly pageTitle = 'Loan Masters';
  readonly pageUrl   = '';

  private v     = (id: string): Locator => this.page.locator(`#${id}`);
  private inp   = async (id: string, val: string) => { await this.fillField(this.v(id), val); };
  private sel   = async (id: string, val: string) => { await this.selectDropdown(this.v(id), val); };
  private tab   = async (id: string) => { await this.v(id).press('Tab'); };
  private radio = async (id: string) => { await this.v(id).click().catch(() => {}); };

  private async waitForAjax() {
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    await this.page.evaluate(() => new Promise<void>(resolve => {
      const check = () => ((window as any).jQuery?.active > 0) ? setTimeout(check, 100) : resolve();
      check();
    })).catch(() => {});
  }

  async openCreateForm(): Promise<void> {
    await this.page.locator('button.add, #addButton, a.button.add').first().click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.waitForAjax();
  }

  async save(): Promise<string> {
    const btn = this.page.locator('button#saveCustomer, a.button.sm.btn-save, #btnSave').first();
    await btn.waitFor({ state: 'attached', timeout: 10_000 });
    await btn.click({ force: true });
    await this.page.locator('#submitForm').waitFor({ state: 'visible', timeout: 10_000 });
    await this.page.locator('#submitForm').click();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em');
    await toast.first().waitFor({ state: 'visible', timeout: 20_000 });
    return (await toast.first().innerText()).trim();
  }

  // ── Loan Collateral ───────────────────────────────────────────────────────
  async fillCollateralForm(data: LoanCollateralData): Promise<void> {
    await this.waitForAjax();
    if (data.memberCode)           { await this.inp('memberCode',           data.memberCode);           await this.tab('memberCode'); }
    if (data.existingOrNewColl)      await this.sel('existingOrNewColl',      data.existingOrNewColl);
    if (data.collateralType)         await this.sel('collateralType',         data.collateralType);
    if (data.collateralSubType)      await this.sel('collateralSubType',      data.collateralSubType);
    if (data.groupCodeokForPopUp)  { await this.inp('groupCodeokForPopUp',  data.groupCodeokForPopUp);  await this.tab('groupCodeokForPopUp'); }
    if (data.searchModule)         { await this.inp('searchModule',         data.searchModule);         await this.tab('searchModule'); }
    if (data.searchProduct)        { await this.inp('searchProduct',        data.searchProduct);        await this.tab('searchProduct'); }
    if (data.searchScheme)         { await this.inp('searchScheme',         data.searchScheme);         await this.tab('searchScheme'); }
    if (data.cardNoSearch)         { await this.inp('cardNoSearch',         data.cardNoSearch);         await this.tab('cardNoSearch'); }
  }

  // ── Loan Security ─────────────────────────────────────────────────────────
  async fillSecurityForm(data: LoanSecurityData): Promise<void> {
    await this.waitForAjax();
    if (data.custId)                     { await this.inp('custId',                     data.custId);                     await this.tab('custId'); }
    if (data.collateralIDExistsY)          await this.radio(data.collateralIDExistsY);
    if (data.collateralIDExistsN)          await this.radio(data.collateralIDExistsN);
    if (data.existingcolateralId)          await this.sel('existingcolateralId',          data.existingcolateralId);
    if (data.securityType)                 await this.sel('securityType',                 data.securityType);
    if (data.MainClsOfSec)                 await this.sel('MainClsOfSec',                 data.MainClsOfSec);
    if (data.MainSubClsOfSec)              await this.sel('MainSubClsOfSec',              data.MainSubClsOfSec);
    if (data.securityStatus)               await this.sel('securityStatus',               data.securityStatus);
    if (data.securityHeldDate)           { await this.inp('securityHeldDate',           data.securityHeldDate);           await this.tab('securityHeldDate'); }
    if (data.valuationDate)              { await this.inp('valuationDate',              data.valuationDate);              await this.tab('valuationDate'); }
    if (data.valuationBy)                { await this.inp('valuationBy',                data.valuationBy);                await this.tab('valuationBy'); }
    if (data.insuranceY)                   await this.radio(data.insuranceY);
    if (data.insuranceN)                   await this.radio(data.insuranceN);
    if (data.nextValuationDate)          { await this.inp('nextValuationDate',          data.nextValuationDate);          await this.tab('nextValuationDate'); }
    if (data.collateralValueAmount_txt)  { await this.inp('collateralValueAmount_txt',  data.collateralValueAmount_txt);  await this.tab('collateralValueAmount_txt'); }
    if (data.utilizedAmount_txt)         { await this.inp('utilizedAmount_txt',         data.utilizedAmount_txt);         await this.tab('utilizedAmount_txt'); }
    if (data.marginPercent_txt)          { await this.inp('marginPercent_txt',          data.marginPercent_txt);          await this.tab('marginPercent_txt'); }
    if (data.groupCodeokForPopUp)        { await this.inp('groupCodeokForPopUp',        data.groupCodeokForPopUp);        await this.tab('groupCodeokForPopUp'); }
    if (data.searchModule)               { await this.inp('searchModule',               data.searchModule);               await this.tab('searchModule'); }
    if (data.searchProduct)              { await this.inp('searchProduct',              data.searchProduct);              await this.tab('searchProduct'); }
    if (data.searchScheme)               { await this.inp('searchScheme',               data.searchScheme);               await this.tab('searchScheme'); }
    if (data.cardNoSearch)               { await this.inp('cardNoSearch',               data.cardNoSearch);               await this.tab('cardNoSearch'); }
  }

  // ── Loan Surety ───────────────────────────────────────────────────────────
  async fillSuretyForm(data: LoanSuretyData): Promise<void> {
    await this.waitForAjax();
    if (data.accountNumber)              { await this.inp('accountNumber',              data.accountNumber);              await this.tab('accountNumber'); }
    if (data.customerNumber)             { await this.inp('customerNumber',             data.customerNumber);             await this.tab('customerNumber'); }
    if (data.customerpinCode)            { await this.inp('customerpinCode',            data.customerpinCode);            await this.tab('customerpinCode'); }
    if (data.employerName)               { await this.inp('employerName',               data.employerName);               await this.tab('employerName'); }
    if (data.employerAddress1)           { await this.inp('employerAddress1',           data.employerAddress1);           await this.tab('employerAddress1'); }
    if (data.employerpinCode)            { await this.inp('employerpinCode',            data.employerpinCode);            await this.tab('employerpinCode'); }
    if (data.surety)                       await this.sel('surety',                       data.surety);
    if (data.existingCustY)                await this.radio(data.existingCustY);
    if (data.existingCustN)                await this.radio(data.existingCustN);
    if (data.relationshipWithApplicant)    await this.sel('relationshipWithApplicant',    data.relationshipWithApplicant);
    if (data.remark)                     { await this.inp('remark',                     data.remark);                     await this.tab('remark'); }
    if (data.businessY)                    await this.radio(data.businessY);
    if (data.businessN)                    await this.radio(data.businessN);
    if (data.designation)                  await this.sel('designation',                  data.designation);
    if (data.monthlyIncome_txt)          { await this.inp('monthlyIncome_txt',          data.monthlyIncome_txt);          await this.tab('monthlyIncome_txt'); }
    if (data.guarantorWorth_txt)         { await this.inp('guarantorWorth_txt',         data.guarantorWorth_txt);         await this.tab('guarantorWorth_txt'); }
    if (data.employerAddress2)           { await this.inp('employerAddress2',           data.employerAddress2);           await this.tab('employerAddress2'); }
    if (data.employerAddress3)           { await this.inp('employerAddress3',           data.employerAddress3);           await this.tab('employerAddress3'); }
    if (data.country1)                     await this.sel('country1',                     data.country1);
    if (data.state1)                       await this.sel('state1',                       data.state1);
    if (data.district1)                    await this.sel('district1',                    data.district1);
    if (data.city1)                        await this.sel('city1',                        data.city1);
    if (data.municipal1)                   await this.sel('municipal1',                   data.municipal1);
    if (data.ruralUrban1)                  await this.sel('ruralUrban1',                  data.ruralUrban1);
    if (data.village1)                     await this.sel('village1',                     data.village1);
    if (data.urbanCode1)                   await this.sel('urbanCode1',                   data.urbanCode1);
  }
}

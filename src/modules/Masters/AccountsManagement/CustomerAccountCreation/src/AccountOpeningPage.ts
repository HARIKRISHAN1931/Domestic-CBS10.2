import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../../framework/base/BasePage';
import { CBS_CONSTANTS } from '../../../../common/constants/cbs.constants';

export interface AccountOpeningFormData {
  customerId: string;
  accountType: string;
  branchCode: string;
  initialDeposit: number;
  nomineeName?: string;
  nomineeRelation?: string;
}

export class AccountOpeningPage extends BasePage {
  readonly pageTitle = 'Account Opening';
  readonly pageUrl = CBS_CONSTANTS.ROUTES.ACCOUNT_OPENING;

  constructor(page: Page) { super(page); }

  private get customerIdInput(): Locator { return this.page.getByLabel('Customer ID'); }
  private get accountTypeDropdown(): Locator { return this.page.getByLabel('Account Type'); }
  private get branchCodeInput(): Locator { return this.page.getByLabel('Branch Code'); }
  private get initialDepositInput(): Locator { return this.page.getByLabel('Initial Deposit'); }
  private get nomineeNameInput(): Locator { return this.page.getByLabel('Nominee Name'); }
  private get nomineeRelationDropdown(): Locator { return this.page.getByLabel('Nominee Relation'); }
  private get saveButton(): Locator { return this.page.getByRole('button', { name: 'Open Account' }); }
  private get authorizeButton(): Locator { return this.page.getByRole('button', { name: 'Authorize' }); }
  get accountNumberDisplay(): Locator { return this.page.getByTestId('account-number'); }

  async fillForm(data: AccountOpeningFormData): Promise<void> {
    await this.fillField(this.customerIdInput, data.customerId);
    await this.selectDropdown(this.accountTypeDropdown, data.accountType);
    await this.fillField(this.branchCodeInput, data.branchCode);
    await this.fillField(this.initialDepositInput, String(data.initialDeposit));
    if (data.nomineeName) await this.fillField(this.nomineeNameInput, data.nomineeName);
    if (data.nomineeRelation) await this.selectDropdown(this.nomineeRelationDropdown, data.nomineeRelation);
  }

  async save(): Promise<void> { await this.clickAndWait(this.saveButton); }
  async authorize(): Promise<void> { await this.clickAndWait(this.authorizeButton); }

  async getAccountNumber(): Promise<string> {
    await this.waitForVisible(this.accountNumberDisplay);
    return this.getTextContent(this.accountNumberDisplay);
  }
}

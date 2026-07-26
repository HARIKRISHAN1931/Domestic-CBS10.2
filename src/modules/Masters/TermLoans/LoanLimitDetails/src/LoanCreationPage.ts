import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../framework/base/BasePage';
import { CBS_CONSTANTS } from '../../../common/constants/cbs.constants';

export interface LoanCreationFormData {
  customerId: string;
  loanType: string;
  loanAmount: number;
  tenureMonths: number;
  purpose: string;
  collateralType?: string;
}

export class LoanCreationPage extends BasePage {
  readonly pageTitle = 'Loan Creation';
  readonly pageUrl = CBS_CONSTANTS.ROUTES.LOAN_CREATION;

  constructor(page: Page) { super(page); }

  private get customerIdInput(): Locator { return this.page.getByLabel('Customer ID'); }
  private get loanTypeDropdown(): Locator { return this.page.getByLabel('Loan Type'); }
  private get loanAmountInput(): Locator { return this.page.getByLabel('Loan Amount'); }
  private get tenureInput(): Locator { return this.page.getByLabel('Tenure (Months)'); }
  private get purposeInput(): Locator { return this.page.getByLabel('Purpose'); }
  private get submitButton(): Locator { return this.page.getByRole('button', { name: 'Apply' }); }
  private get authorizeButton(): Locator { return this.page.getByRole('button', { name: 'Authorize' }); }
  get loanIdDisplay(): Locator { return this.page.getByTestId('loan-id'); }

  async fillForm(data: LoanCreationFormData): Promise<void> {
    await this.fillField(this.customerIdInput, data.customerId);
    await this.selectDropdown(this.loanTypeDropdown, data.loanType);
    await this.fillField(this.loanAmountInput, String(data.loanAmount));
    await this.fillField(this.tenureInput, String(data.tenureMonths));
    await this.fillField(this.purposeInput, data.purpose);
  }

  async save(): Promise<void> { await this.clickAndWait(this.submitButton); }
  async authorize(): Promise<void> { await this.clickAndWait(this.authorizeButton); }

  async getLoanId(): Promise<string> {
    await this.waitForVisible(this.loanIdDisplay);
    return this.getTextContent(this.loanIdDisplay);
  }
}

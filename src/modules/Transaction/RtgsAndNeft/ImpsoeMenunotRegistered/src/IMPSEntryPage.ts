import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../framework/base/BasePage';
import { CBS_CONSTANTS } from '../../../common/constants/cbs.constants';

export interface IMPSFormData {
  debitAccountNumber: string;
  beneficiaryMobile: string;
  beneficiaryMMID: string;
  amount: number;
  remarks?: string;
}

export class IMPSEntryPage extends BasePage {
  readonly pageTitle = 'IMPS Entry';
  readonly pageUrl = CBS_CONSTANTS.ROUTES.IMPS_ENTRY;

  constructor(page: Page) { super(page); }

  private get debitAccountInput(): Locator { return this.page.getByLabel('Debit Account Number'); }
  private get beneficiaryMobileInput(): Locator { return this.page.getByLabel('Beneficiary Mobile'); }
  private get beneficiaryMMIDInput(): Locator { return this.page.getByLabel('Beneficiary MMID'); }
  private get amountInput(): Locator { return this.page.getByLabel('Amount'); }
  private get remarksInput(): Locator { return this.page.getByLabel('Remarks'); }
  private get submitButton(): Locator { return this.page.getByRole('button', { name: 'Submit' }); }
  private get authorizeButton(): Locator { return this.page.getByRole('button', { name: 'Authorize' }); }
  get transactionRefDisplay(): Locator { return this.page.getByTestId('transaction-ref'); }

  async fillForm(data: IMPSFormData): Promise<void> {
    await this.fillField(this.debitAccountInput, data.debitAccountNumber);
    await this.fillField(this.beneficiaryMobileInput, data.beneficiaryMobile);
    await this.fillField(this.beneficiaryMMIDInput, data.beneficiaryMMID);
    await this.fillField(this.amountInput, String(data.amount));
    if (data.remarks) await this.fillField(this.remarksInput, data.remarks);
  }

  async submit(): Promise<void> { await this.clickAndWait(this.submitButton); }
  async authorize(): Promise<void> { await this.clickAndWait(this.authorizeButton); }

  async getTransactionReference(): Promise<string> {
    await this.waitForVisible(this.transactionRefDisplay);
    return this.getTextContent(this.transactionRefDisplay);
  }
}

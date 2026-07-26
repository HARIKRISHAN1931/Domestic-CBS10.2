import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../framework/base/BasePage';
import { CBS_CONSTANTS } from '../../../common/constants/cbs.constants';

export interface NEFTFormData {
  debitAccountNumber: string;
  beneficiaryName: string;
  beneficiaryAccountNumber: string;
  beneficiaryIFSC: string;
  amount: number;
  remarks?: string;
}

export class NEFTEntryPage extends BasePage {
  readonly pageTitle = 'NEFT Entry';
  readonly pageUrl = CBS_CONSTANTS.ROUTES.NEFT_ENTRY;

  constructor(page: Page) { super(page); }

  private get debitAccountInput(): Locator { return this.page.getByLabel('Debit Account Number'); }
  private get beneficiaryNameInput(): Locator { return this.page.getByLabel('Beneficiary Name'); }
  private get beneficiaryAccountInput(): Locator { return this.page.getByLabel('Beneficiary Account Number'); }
  private get beneficiaryIFSCInput(): Locator { return this.page.getByLabel('Beneficiary IFSC'); }
  private get amountInput(): Locator { return this.page.getByLabel('Amount'); }
  private get remarksInput(): Locator { return this.page.getByLabel('Remarks'); }
  private get submitButton(): Locator { return this.page.getByRole('button', { name: 'Submit' }); }
  private get authorizeButton(): Locator { return this.page.getByRole('button', { name: 'Authorize' }); }
  get transactionRefDisplay(): Locator { return this.page.getByTestId('transaction-ref'); }

  async fillForm(data: NEFTFormData): Promise<void> {
    await this.fillField(this.debitAccountInput, data.debitAccountNumber);
    await this.fillField(this.beneficiaryNameInput, data.beneficiaryName);
    await this.fillField(this.beneficiaryAccountInput, data.beneficiaryAccountNumber);
    await this.fillField(this.beneficiaryIFSCInput, data.beneficiaryIFSC);
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

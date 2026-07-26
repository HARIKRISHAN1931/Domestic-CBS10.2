import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../../framework/base/BasePage';
import { CBS_CONSTANTS } from '../../../../common/constants/cbs.constants';

export interface CustomerModificationFormData {
  customerId: string;
  mobileNumber?: string;
  email?: string;
  address?: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export class CustomerModificationPage extends BasePage {
  readonly pageTitle = 'Customer Modification';
  readonly pageUrl = CBS_CONSTANTS.ROUTES.CUSTOMER_MODIFICATION;

  constructor(page: Page) { super(page); }

  private get customerIdInput(): Locator { return this.page.getByLabel('Customer ID'); }
  private get searchButton(): Locator { return this.page.getByRole('button', { name: 'Search' }); }
  private get mobileInput(): Locator { return this.page.getByLabel('Mobile Number'); }
  private get emailInput(): Locator { return this.page.getByLabel('Email'); }
  private get updateButton(): Locator { return this.page.getByRole('button', { name: 'Update' }); }
  private get authorizeButton(): Locator { return this.page.getByRole('button', { name: 'Authorize' }); }
  get successMessage(): Locator { return this.page.getByTestId('success-message'); }

  async searchCustomer(customerId: string): Promise<void> {
    await this.fillField(this.customerIdInput, customerId);
    await this.clickAndWait(this.searchButton);
  }

  async updateContactDetails(data: Pick<CustomerModificationFormData, 'mobileNumber' | 'email'>): Promise<void> {
    if (data.mobileNumber) await this.fillField(this.mobileInput, data.mobileNumber);
    if (data.email) await this.fillField(this.emailInput, data.email);
    await this.clickAndWait(this.updateButton);
  }

  async authorize(): Promise<void> { await this.clickAndWait(this.authorizeButton); }
}

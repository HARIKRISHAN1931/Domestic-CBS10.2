import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../../framework/base/BasePage';
import { TableComponent } from '../../../../common/components/TableComponent';
import { CBS_CONSTANTS } from '../../../../common/constants/cbs.constants';

export class CustomerInquiryPage extends BasePage {
  readonly pageTitle = 'Customer Inquiry';
  readonly pageUrl = CBS_CONSTANTS.ROUTES.CUSTOMER_INQUIRY;

  constructor(page: Page) { super(page); }

  private get customerIdInput(): Locator { return this.page.getByLabel('Customer ID'); }
  private get panInput(): Locator { return this.page.getByLabel('PAN Number'); }
  private get mobileInput(): Locator { return this.page.getByLabel('Mobile Number'); }
  private get searchButton(): Locator { return this.page.getByRole('button', { name: 'Search' }); }

  get resultsTable(): TableComponent {
    return new TableComponent(this.page, this.page.locator('table.results-table'));
  }

  async searchByCustomerId(customerId: string): Promise<void> {
    await this.fillField(this.customerIdInput, customerId);
    await this.clickAndWait(this.searchButton);
  }

  async searchByPAN(pan: string): Promise<void> {
    await this.fillField(this.panInput, pan);
    await this.clickAndWait(this.searchButton);
  }

  async searchByMobile(mobile: string): Promise<void> {
    await this.fillField(this.mobileInput, mobile);
    await this.clickAndWait(this.searchButton);
  }
}

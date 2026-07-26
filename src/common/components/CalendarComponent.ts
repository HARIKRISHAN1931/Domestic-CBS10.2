import { Page, Locator, expect } from '@playwright/test';
import { BaseComponent } from '../../framework/base/BaseComponent';

export class CalendarComponent extends BaseComponent {
  constructor(page: Page, root: Locator) {
    super(page, root);
  }

  private get prevButton(): Locator { return this.root.getByRole('button', { name: /prev|previous|</i }); }
  private get nextButton(): Locator { return this.root.getByRole('button', { name: /next|>/i }); }
  private get monthYearHeader(): Locator { return this.root.getByRole('heading'); }

  async selectDate(date: string): Promise<void> {
    await this.root.getByRole('gridcell', { name: date }).click();
  }

  async getSelectedDate(): Promise<string> {
    return (await this.root.locator('[aria-selected="true"]').textContent()) ?? '';
  }

  async navigateToMonth(month: string, year: string): Promise<void> {
    let attempts = 0;
    while (attempts < 24) {
      const header = await this.monthYearHeader.textContent() ?? '';
      if (header.includes(month) && header.includes(year)) return;
      await this.click(this.nextButton);
      attempts++;
    }
  }

  async verifyDateSelected(expected: string): Promise<void> {
    await expect(this.root.locator('[aria-selected="true"]')).toContainText(expected);
  }
}

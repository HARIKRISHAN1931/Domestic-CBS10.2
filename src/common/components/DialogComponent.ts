import { Page, Locator, expect } from '@playwright/test';
import { BaseComponent } from '../../framework/base/BaseComponent';

export class DialogComponent extends BaseComponent {
  constructor(page: Page, root: Locator) {
    super(page, root);
  }

  private get title(): Locator { return this.root.getByRole('heading'); }
  private get confirmButton(): Locator { return this.root.getByRole('button', { name: /confirm|yes|ok/i }); }
  private get cancelButton(): Locator { return this.root.getByRole('button', { name: /cancel|no/i }); }
  private get closeButton(): Locator { return this.root.getByRole('button', { name: /close/i }); }

  async getTitle(): Promise<string> { return (await this.title.textContent()) ?? ''; }

  async confirm(): Promise<void> {
    await this.click(this.confirmButton);
    await this.waitForHidden();
  }

  async cancel(): Promise<void> {
    await this.click(this.cancelButton);
    await this.waitForHidden();
  }

  async close(): Promise<void> {
    await this.click(this.closeButton);
    await this.waitForHidden();
  }

  async verifyTitle(expectedTitle: string): Promise<void> {
    await expect(this.title).toHaveText(expectedTitle);
  }
}

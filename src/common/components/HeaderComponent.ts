import { Page, Locator, expect } from '@playwright/test';
import { BaseComponent } from '../../framework/base/BaseComponent';

export class HeaderComponent extends BaseComponent {
  constructor(page: Page) {
    super(page, page.locator('header, [role="banner"]'));
  }

  private get userMenu(): Locator { return this.root.getByRole('button', { name: /user|profile/i }); }
  private get logoutButton(): Locator { return this.page.getByRole('menuitem', { name: /logout|sign out/i }); }
  private get pageHeading(): Locator { return this.root.getByRole('heading').first(); }

  async getPageHeading(): Promise<string> { return (await this.pageHeading.textContent()) ?? ''; }

  async logout(): Promise<void> {
    await this.click(this.userMenu);
    await this.click(this.logoutButton);
  }

  async verifyPageHeading(expected: string): Promise<void> {
    await expect(this.pageHeading).toContainText(expected);
  }
}

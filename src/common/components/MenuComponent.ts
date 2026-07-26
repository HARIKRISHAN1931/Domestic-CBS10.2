import { Page, Locator } from '@playwright/test';
import { BaseComponent } from '../../framework/base/BaseComponent';

export class MenuComponent extends BaseComponent {
  constructor(page: Page) {
    super(page, page.locator('nav, [role="navigation"]'));
  }

  async navigateTo(menuPath: string[]): Promise<void> {
    for (const item of menuPath) {
      await this.root.getByRole('menuitem', { name: item }).click();
    }
  }

  async clickMenuItem(name: string): Promise<void> {
    await this.root.getByRole('menuitem', { name }).click();
  }

  async isMenuItemVisible(name: string): Promise<boolean> {
    return this.root.getByRole('menuitem', { name }).isVisible();
  }

  private get menuToggle(): Locator { return this.page.getByRole('button', { name: /menu|hamburger/i }); }

  async toggleMenu(): Promise<void> { await this.click(this.menuToggle); }
}

import { Page } from '@playwright/test';

const escId = (id: string) => id.replace(/([^\w-])/g, '\\$1');

export class MenuNavigation {
  constructor(private readonly page: Page) {}

  async navigate(topSection: string, subSection: string, menuItemId: string): Promise<void> {
    // Open hamburger only if menu is not already visible
    const sectionToggle = this.page.locator(`li#${escId(topSection)} > a.dropnav`);
    const menuVisible = await sectionToggle.isVisible({ timeout: 1_000 }).catch(() => false);
    if (!menuVisible) {
      await this.page.locator('a.item-nav').first().click();
      await sectionToggle.waitFor({ state: 'visible', timeout: 10_000 });
    }

    // Expand top section only if not already open
    const isOpen = await sectionToggle.evaluate((el: Element) => el.classList.contains('mn-open'));
    if (!isOpen) await sectionToggle.click();

    // Expand sub-section only if not already open
    const subToggle = this.page.locator(`li#${escId(subSection)} > a.s-dropnav`);
    await subToggle.waitFor({ state: 'visible', timeout: 8_000 });
    const subPanel = this.page.locator(`li#${escId(subSection)} > div.super-sub-nav`);
    const subOpen  = await subPanel.evaluate((el: Element) => el.classList.contains('ssn-open')).catch(() => false);
    if (!subOpen) await subToggle.click();

    // Click menu item — CBS loads screen via AJAX, no full page navigation
    const menuItem = this.page.locator(`li#${escId(menuItemId)} > a`);
    await menuItem.waitFor({ state: 'visible', timeout: 8_000 });
    await menuItem.click();

    // Wait for the screen content to appear instead of waitForLoadState
    // CBS injects content into an iframe/div — wait for any loading indicator to disappear
    await this.page.waitForFunction(() => {
      const loader = document.querySelector('.loading, .loader, #loadingDiv, .page-loader');
      return !loader || (loader as HTMLElement).style.display === 'none';
    }, { timeout: 15_000 }).catch(() => {});
  }
}

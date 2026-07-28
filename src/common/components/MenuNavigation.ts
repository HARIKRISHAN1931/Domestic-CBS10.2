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
    const isOpen = await sectionToggle.getAttribute('class').then(c => (c ?? '').includes('mn-open')).catch(() => false);
    if (!isOpen) await sectionToggle.click();

    // Expand sub-section only if not already open
    const subToggle = this.page.locator(`li#${escId(subSection)} > a.s-dropnav`);
    await subToggle.waitFor({ state: 'visible', timeout: 8_000 });
    const subClass = await subToggle.getAttribute('class').catch(() => '');
    const subOpen  = (subClass ?? '').includes('ssn-open') ||
                     await this.page.locator(`li#${escId(subSection)} > div.super-sub-nav`)
                       .getAttribute('class').then(c => (c ?? '').includes('ssn-open')).catch(() => false);
    if (!subOpen) await subToggle.click();

    // Click menu item
    const menuItem = this.page.locator(`li#${escId(menuItemId)} > a`);
    await menuItem.waitFor({ state: 'visible', timeout: 8_000 });
    await menuItem.click();

    // CBS loads screen via AJAX — do NOT use waitForLoadState (hangs on AJAX screens)
    // Wait for the Add button or grid to appear as signal that screen loaded
    await this.page.waitForTimeout(1_500);
  }
}

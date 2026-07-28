import { Page, BrowserContext } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { config } from '../config/config';

/** LoginPage — kept for backward compatibility. Session logic is in fixtures.ts */
export class LoginPage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto(): Promise<void> {
    await this.page.goto(`${config.baseUrl}${config.appPath}`, { waitUntil: 'domcontentloaded' });
  }

  async loginAndGetAppPage(context: BrowserContext, username: string, password: string): Promise<Page> {
    await this.page.locator('#loginId').fill(username);
    await this.page.locator('#loginId').press('Tab');
    await this.page.locator('#uiPwd').fill(password);
    const [appPage] = await Promise.all([
      context.waitForEvent('page', { timeout: 30_000 }),
      this.page.locator('#userLogin').click(),
    ]);
    await appPage.waitForLoadState('domcontentloaded');
    await appPage.bringToFront();
    return appPage;
  }
}

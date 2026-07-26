import { Page, BrowserContext } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { config } from '../config/config';

export class LoginPage extends BasePage {
  // Login page has no iframe — must use page.locator() directly, not this.loc()
  private loginIdInput  = () => this.page.locator('#loginId');
  private passwordInput = () => this.page.locator('#uiPwd');
  private continueBtn   = () => this.page.locator('#userLogin');

  constructor(page: Page) { super(page); }

  async goto(): Promise<void> {
    await this.page.goto(`${config.baseUrl}${config.appPath}`);
    await this.page.waitForLoadState('domcontentloaded');
    const reloginBtn = this.page.locator('#relogin');
    if (await reloginBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await reloginBtn.click();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  async loginAndGetAppPage(context: BrowserContext, username: string, password: string): Promise<Page> {
    // Use locator.fill() directly — BasePage.fill() uses evaluate() which fails on main-frame inputs
    await this.loginIdInput().fill(username);
    await this.loginIdInput().press('Tab');
    await this.passwordInput().fill(password);

    // CBS opens the app in a new tab after login
    const [appPage] = await Promise.all([
      context.waitForEvent('page', { timeout: 30_000 }),
      this.continueBtn().click(),
    ]);
    await appPage.waitForLoadState('domcontentloaded');
    await appPage.evaluate(() => {
      window.moveTo(0, 0);
      window.resizeTo(screen.width, screen.height);
    }).catch(() => {});
    return appPage;
  }
}

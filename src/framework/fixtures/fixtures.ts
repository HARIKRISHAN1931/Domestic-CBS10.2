import { test as base, Page, Browser, BrowserContext } from '@playwright/test';
import { config } from '../config/config';
import { CBS_SELECTORS } from '../config/selectors';
import { CBS_TIMEOUTS } from '../config/timeouts';
import { DatabaseConnectionManager } from '../database/DatabaseConnectionManager';

type CbsFixtures = {
  authenticatedPage:        Page;
  checkerAuthenticatedPage: Page;
  makerContext:             BrowserContext;
  checkerContext:           BrowserContext;
  db:                       DatabaseConnectionManager;
};

/**
 * CBS login flow:
 *   1. Open login tab → goto app URL
 *   2. Fill credentials → click login
 *   3. CBS opens the app in a NEW popup tab
 *   4. Return that popup tab as the active page
 *
 * No session caching — always fresh login.
 * One context, one window per test.
 */
async function createSession(
  browser: Browser,
  username: string,
  password: string
): Promise<{ context: BrowserContext; page: Page }> {

  const context  = await browser.newContext({ baseURL: config.baseUrl });
  const loginTab = await context.newPage();

  await loginTab.goto(`${config.baseUrl}${config.appPath}`, { waitUntil: 'domcontentloaded' });

  // Handle stale-session relogin prompt if CBS shows it
  const reloginBtn = loginTab.locator('#relogin');
  if (await reloginBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await reloginBtn.click();
    await loginTab.waitForLoadState('domcontentloaded');
  }

  await loginTab.locator('#loginId').fill(username);
  await loginTab.locator('#loginId').press('Tab');
  await loginTab.locator('#uiPwd').fill(password);

  // CBS opens the app in a NEW popup tab on login click
  const [appPage] = await Promise.all([
    context.waitForEvent('page', { timeout: 30_000 }),
    loginTab.locator('#userLogin').click(),
  ]);

  await appPage.waitForLoadState('domcontentloaded');
  await appPage.bringToFront();
  await appPage.locator(CBS_SELECTORS.HAMBURGER).waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.LOGIN });

  return { context, page: appPage };
}

export const test = base.extend<CbsFixtures>({
  makerContext: async ({ browser }, use) => {
    const { context } = await createSession(browser, config.auth.username, config.auth.password);
    await use(context);
    await context.close().catch(() => {});
  },

  checkerContext: async ({ browser }, use) => {
    const { context } = await createSession(browser, config.auth.checkerUsername, config.auth.checkerPassword);
    await use(context);
    await context.close().catch(() => {});
  },

  authenticatedPage: async ({ browser }, use) => {
    const { context, page } = await createSession(browser, config.auth.username, config.auth.password);
    await use(page);
    await context.close().catch(() => {});
  },

  checkerAuthenticatedPage: async ({ browser }, use) => {
    const { context, page } = await createSession(browser, config.auth.checkerUsername, config.auth.checkerPassword);
    await use(page);
    await context.close().catch(() => {});
  },

  db: async ({}, use) => {
    const db = new DatabaseConnectionManager();
    if (config.db.host) await db.connect();
    await use(db);
    if (config.db.host) await db.disconnect();
  },
});

export { expect } from '@playwright/test';

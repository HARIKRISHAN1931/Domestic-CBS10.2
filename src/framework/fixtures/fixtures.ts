import { test as base, Page, Browser, BrowserContext } from '@playwright/test';
import { LoginPage } from '../auth/LoginPage';
import { config } from '../config/config';
import { CBS_SELECTORS } from '../config/selectors';
import { CBS_TIMEOUTS } from '../config/timeouts';
import { DatabaseConnectionManager } from '../database/DatabaseConnectionManager';
import path from 'path';
import fs from 'fs';

export const STORAGE_STATE_DIR     = path.join(process.cwd(), '.auth');
export const MAKER_STORAGE_STATE   = path.join(STORAGE_STATE_DIR, 'maker.json');
export const CHECKER_STORAGE_STATE = path.join(STORAGE_STATE_DIR, 'checker.json');

type CbsFixtures = {
  authenticatedPage:        Page;
  checkerAuthenticatedPage: Page;
  makerContext:             BrowserContext;
  checkerContext:           BrowserContext;
  db:                       DatabaseConnectionManager;
};

async function createSession(
  browser: Browser,
  storageFile: string,
  username: string,
  password: string
): Promise<{ context: BrowserContext; page: Page }> {
  if (fs.existsSync(storageFile)) {
    const context = await browser.newContext({ baseURL: config.baseUrl, storageState: storageFile });
    const page    = await context.newPage();
    await page.goto(`${config.baseUrl}${config.appPath}`);
    await page.waitForLoadState('domcontentloaded');
    const isLoggedIn = await page.locator(CBS_SELECTORS.HAMBURGER)
      .isVisible({ timeout: CBS_TIMEOUTS.SHORT }).catch(() => false);
    if (isLoggedIn) {
      await page.evaluate(() => { window.moveTo(0, 0); window.resizeTo(screen.width, screen.height); });
      return { context, page };
    }
    await context.close();
  }

  const context   = await browser.newContext({ baseURL: config.baseUrl });
  const loginPage = new LoginPage(await context.newPage());
  await loginPage.goto();
  const page = await loginPage.loginAndGetAppPage(context, username, password);
  await page.locator(CBS_SELECTORS.HAMBURGER).waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.LOGIN });
  await page.evaluate(() => { window.moveTo(0, 0); window.resizeTo(screen.width, screen.height); });
  if (!fs.existsSync(STORAGE_STATE_DIR)) fs.mkdirSync(STORAGE_STATE_DIR, { recursive: true });
  await context.storageState({ path: storageFile });
  return { context, page };
}

export const test = base.extend<CbsFixtures>({
  makerContext: async ({ browser }, use) => {
    const { context } = await createSession(browser, MAKER_STORAGE_STATE, config.auth.username, config.auth.password);
    await use(context);
    await context.close().catch(() => {});
  },

  checkerContext: async ({ browser }, use) => {
    const { context } = await createSession(browser, CHECKER_STORAGE_STATE, config.auth.checkerUsername, config.auth.checkerPassword);
    await use(context);
    await context.close().catch(() => {});
  },

  authenticatedPage: async ({ browser }, use) => {
    const { context, page } = await createSession(browser, MAKER_STORAGE_STATE, config.auth.username, config.auth.password);
    await use(page);
    await context.close().catch(() => {});
  },

  checkerAuthenticatedPage: async ({ browser }, use) => {
    const { context, page } = await createSession(browser, CHECKER_STORAGE_STATE, config.auth.checkerUsername, config.auth.checkerPassword);
    await use(page);
    await context.close().catch(() => {});
  },

  db: async ({}, use) => {
    const db = new DatabaseConnectionManager();
    if (config.db.host) {
      await db.connect();
    }
    await use(db);
    if (config.db.host) {
      await db.disconnect();
    }
  },
});

export { expect } from '@playwright/test';

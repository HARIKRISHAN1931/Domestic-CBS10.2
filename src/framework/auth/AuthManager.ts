import { Browser, BrowserContext, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { config } from '../config/config';
import { logger } from '../logger/logger';

const AUTH_STATE_PATH = path.resolve('auth-state.json');

export class AuthManager {
  static async saveStorageState(browser: Browser): Promise<void> {
    logger.info('Authenticating and saving storage state');
    const context: BrowserContext = await browser.newContext();
    const page: Page = await context.newPage();
    await page.goto(config.baseUrl);
    await page.getByLabel('Username').fill(config.auth.username);
    await page.getByLabel('Password').fill(config.auth.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard**');
    await context.storageState({ path: AUTH_STATE_PATH });
    await context.close();
    logger.info('Storage state saved');
  }

  static storageStatePath(): string {
    return AUTH_STATE_PATH;
  }

  static isStorageStateValid(): boolean {
    if (!fs.existsSync(AUTH_STATE_PATH)) return false;
    const ageMs = Date.now() - fs.statSync(AUTH_STATE_PATH).mtimeMs;
    return ageMs < 8 * 60 * 60 * 1000;
  }
}

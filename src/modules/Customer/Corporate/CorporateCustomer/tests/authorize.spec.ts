import * as fs from 'fs';
import * as path from 'path';
import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { CorporateCustomerPage } from '../src/CorporateCustomerPage';
import { CorporateCustomerValidator } from '../src/CorporateCustomerBuilder';

const CREATED_FILE = path.resolve(__dirname, '../data/created-customers.json');

const loadCreated = (): string[] => {
  if (!fs.existsSync(CREATED_FILE)) throw new Error('created-customers.json not found — run create tests first');
  return JSON.parse(fs.readFileSync(CREATED_FILE, 'utf-8'));
};

const NAV = async (page: any) => {
  await page.locator('a.item-nav').first().click();
  await page.waitForTimeout(400);
  await page.locator('a[href*="corporateCustomerList"]').click({ force: true });
  await page.waitForTimeout(2000);
};

test.describe('Corporate Customer > Authorize', () => {

  test('should authorize first created customer @sanity @smoke', async ({ checkerAuthenticatedPage }) => {
    test.setTimeout(120_000);
    const names  = loadCreated();
    const name   = names[0];
    const screen = new CorporateCustomerPage(checkerAuthenticatedPage);
    const validator = new CorporateCustomerValidator();

    await test.step('Navigate', () => NAV(checkerAuthenticatedPage));
    await test.step('Switch to pending', () => screen.switchToPendingTab());
    await test.step('Search', () => screen.searchPendingRecord(name));
    await test.step('Verify in pending', async () => {
      expect(await screen.isRecordInPendingGrid(name), `${name} must be in pending grid`).toBe(true);
    });
    const toast = await test.step('Approve', () => screen.approve(name));
    validator.validateApproved(toast);
    await test.step('Verify authorized', async () => {
      await screen.switchToAuthorizedTab();
      await screen.searchAuthorizedRecord(name);
      expect(await screen.isRecordInAuthorizedGrid(name), `${name} must be in authorized grid`).toBe(true);
    });
  });

  test('should authorize all created customers @regression', async ({ checkerAuthenticatedPage }) => {
    test.setTimeout(900_000);
    const names  = loadCreated();
    const screen = new CorporateCustomerPage(checkerAuthenticatedPage);
    const validator = new CorporateCustomerValidator();

    await test.step('Navigate', () => NAV(checkerAuthenticatedPage));

    for (const name of names) {
      await test.step(`Authorize ${name}`, async () => {
        await screen.switchToPendingTab();
        await screen.searchPendingRecord(name);
        await checkerAuthenticatedPage.waitForTimeout(500);
        const inPending = await screen.isRecordInPendingGrid(name);
        if (!inPending) { console.log(`[SKIP] ${name} not in pending`); return; }
        const toast = await screen.approve(name);
        console.log(`[${name}] Toast: ${toast}`);
        validator.validateApproved(toast);
      });
    }
  });

});

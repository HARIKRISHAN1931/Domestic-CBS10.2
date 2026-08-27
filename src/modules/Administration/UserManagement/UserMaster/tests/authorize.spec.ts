import * as fs from 'fs';
import * as path from 'path';
import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { UserMasterPage } from '../src/UserMasterPage';
import { UserMasterValidator } from '../src/UserMasterBuilder';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

const CREATED_FILE = path.resolve(__dirname, '../data/created-users.json');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'usermgmtAdm', 'USERMGMT');

const loadCreated = (): string[] => {
  if (!fs.existsSync(CREATED_FILE)) throw new Error('created-users.json not found — run create tests first');
  return JSON.parse(fs.readFileSync(CREATED_FILE, 'utf-8'));
};

test.describe('User Master > Authorize', () => {

  test('should authorize first created user @sanity @sanity', async ({ checkerAuthenticatedPage }) => {
    test.setTimeout(120_000);
    const loginIds = loadCreated();
    const screen    = new UserMasterPage(checkerAuthenticatedPage);
    const validator = new UserMasterValidator();

    await test.step('Navigate', () => NAV(checkerAuthenticatedPage));
    await test.step('Switch to pending', () => screen.switchToPendingTab());

    // Find first loginId still in pending
    let target = '';
    for (const id of loginIds) {
      const box = checkerAuthenticatedPage.locator('#dt-pendingdata_filter input').first();
      if (await box.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await box.fill(id); await checkerAuthenticatedPage.waitForTimeout(800);
      }
      if (await screen.isRecordInPendingGrid(id)) { target = id; break; }
    }
    if (!target) { console.log('No pending users found — all already authorized'); return; }

    const toast = await test.step(`Approve ${target}`, () => screen.approve(target));
    validator.validateApproved(toast);
    console.log(`[${target}] Toast: ${toast}`);
  });

  test('should authorize all created users @regression', async ({ checkerAuthenticatedPage }) => {
    test.setTimeout(5_400_000);
    const loginIds = loadCreated();
    const screen    = new UserMasterPage(checkerAuthenticatedPage);
    const validator = new UserMasterValidator();

    await test.step('Navigate', () => NAV(checkerAuthenticatedPage));

    for (const loginId of loginIds) {
      await test.step(`Authorize ${loginId}`, async () => {
        await screen.switchToPendingTab();
        const box = checkerAuthenticatedPage.locator('#dt-pendingdata_filter input').first();
        if (await box.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await box.fill(loginId);
          await checkerAuthenticatedPage.waitForTimeout(800);
        }
        const inPending = await screen.isRecordInPendingGrid(loginId);
        if (!inPending) { console.log(`[SKIP] ${loginId} not in pending`); return; }
        const toast = await screen.approve(loginId);
        console.log(`[${loginId}] Toast: ${toast}`);
        validator.validateApproved(toast);
      });
    }
  });

});

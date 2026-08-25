import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { config, BranchUsers } from '../../../../../framework/config/config';

async function loginAsUser(
  browser: any,
  loginId: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  const context  = await browser.newContext({ baseURL: config.baseUrl });
  const loginTab = await context.newPage();

  try {
    await loginTab.goto(`${config.baseUrl}${config.appPath}`, { waitUntil: 'domcontentloaded' });

    const reloginBtn = loginTab.locator('#relogin');
    if (await reloginBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await reloginBtn.click();
      await loginTab.waitForLoadState('domcontentloaded');
    }

    await loginTab.locator('#loginId').fill(loginId);
    await loginTab.locator('#loginId').press('Tab');
    await loginTab.locator('#uiPwd').fill(password);

    let appPage = loginTab;
    const popupPromise = context.waitForEvent('page', { timeout: 20_000 }).catch(() => null);
    await loginTab.locator('#userLogin').click();
    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState('domcontentloaded');
      await popup.bringToFront();
      appPage = popup;
    } else {
      await loginTab.waitForTimeout(2_000);
    }

    // Check for login error in URL (CBS appends errMsgs to URL on failure)
    const currentUrl = loginTab.url();
    if (currentUrl.includes('errMsgs=')) {
      const msg = decodeURIComponent(currentUrl.split('errMsgs=')[1] ?? '').replace(/\+/g, ' ');
      return { success: false, message: `Login error: ${msg}` };
    }

    // Force password change screen
    const pwdChange = appPage.locator('#newPassword, #newPwd, form[action*="changePassword"]').first();
    if (await pwdChange.isVisible({ timeout: 5_000 }).catch(() => false)) {
      return { success: true, message: 'LOGIN_OK — force password change screen' };
    }

    // Normal success — hamburger visible
    const hamburger = appPage.locator('a.item-nav').first();
    if (await hamburger.isVisible({ timeout: 10_000 }).catch(() => false)) {
      return { success: true, message: 'LOGIN_OK — app loaded' };
    }

    const url     = appPage.url();
    const bodyTxt = await appPage.locator('body').innerText().catch(() => '').then(t => t.slice(0, 200));
    return { success: false, message: `Unexpected state. URL: ${url} | Body: ${bodyTxt}` };

  } finally {
    await context.close().catch(() => {});
  }
}

// ─── SANITY: CLERK100 only ────────────────────────────────────────────────────
test('should login as CLERK100 @sanity @smoke', async ({ browser }) => {
  test.setTimeout(60_000);
  const branch = config.branchUsers.find(b => b.branchCode === '100')!;
  const result = await loginAsUser(browser, branch.clerkUsername, branch.clerkPassword);
  console.log(`[LOGIN] ${branch.clerkUsername} → ${result.message}`);
  expect(result.success, result.message).toBe(true);
});

const isParallel = process.env.PARALLEL === 'true';
// PARALLEL=false → only branch 101 (Burdwan), PARALLEL=true → all 42 branches
const activeBranches = isParallel
  ? config.branchUsers
  : config.branchUsers.filter(b => b.branchCode === '101');

// ─── REGRESSION: all CLERKs first (parallel), then all MGRs (parallel) ────────
test.describe('All Clerks Login @regression', () => {
  test.describe.configure({ mode: 'parallel' });

  for (const branch of activeBranches) {
    test(`Branch ${branch.branchCode} | ${branch.branchName} — CLERK`, async ({ browser }) => {
      test.setTimeout(60_000);
      const result = await loginAsUser(browser, branch.clerkUsername, branch.clerkPassword);
      console.log(`[LOGIN] ${branch.clerkUsername} (${branch.branchName}) → ${result.message}`);
      expect(result.success, `${branch.clerkUsername}: ${result.message}`).toBe(true);
    });
  }
});

test.describe('All Managers Login @regression', () => {
  test.describe.configure({ mode: 'parallel' });

  for (const branch of activeBranches) {
    test(`Branch ${branch.branchCode} | ${branch.branchName} — MGR`, async ({ browser }) => {
      test.setTimeout(60_000);
      const result = await loginAsUser(browser, branch.mgrUsername, branch.mgrPassword);
      console.log(`[LOGIN] ${branch.mgrUsername} (${branch.branchName}) → ${result.message}`);
      expect(result.success, `${branch.mgrUsername}: ${result.message}`).toBe(true);
    });
  }
});

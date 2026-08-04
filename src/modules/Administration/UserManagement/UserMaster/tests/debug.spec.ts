import { test } from '../../../../../framework/fixtures/fixtures';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'usermgmtAdm', 'USERMGMT');

test('test same empId for multiple users', async ({ authenticatedPage: p }) => {
  test.setTimeout(120_000);
  await p.setViewportSize({ width: 1920, height: 1080 });
  await NAV(p);
  await p.waitForTimeout(1_500);
  await p.locator('#addButton').click({ force: true });
  await p.locator('#loginId').first().waitFor({ state: 'visible', timeout: 15_000 });
  await p.waitForTimeout(1_500);

  // Try empId 4567 again (already used by sanity test)
  await p.locator('#loginId').first().click({ force: true });
  await p.keyboard.type('TESTDUP01', { delay: 20 });
  await p.locator('#loginId').first().press('Tab');
  await p.waitForTimeout(300);

  await p.locator('#employeeId').first().click({ force: true });
  await p.keyboard.type('4567', { delay: 20 });
  await p.locator('#employeeId').first().press('Tab');
  await p.waitForTimeout(1_500);

  const toastVis = await p.locator('.toast-messages .msg-toast em').first().isVisible({ timeout: 500 }).catch(() => false);
  const userFName = await p.locator('#userFName').first().inputValue().catch(() => '');
  if (toastVis) {
    const msg = await p.locator('.toast-messages .msg-toast em').first().innerText().catch(() => '');
    console.log(`empId 4567 (2nd use): TOAST="${msg.trim()}"`);
  } else {
    console.log(`empId 4567 (2nd use): name="${userFName}" — AVAILABLE AGAIN!`);
  }

  await p.waitForTimeout(500);
});

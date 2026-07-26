const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page    = await context.newPage();

  const BASE_URL = 'http://172.21.0.39:7999';
  const APP_PATH = '/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en';

  console.log('Navigating to login page...');
  await page.goto(`${BASE_URL}${APP_PATH}`);
  await page.waitForLoadState('domcontentloaded');

  // Snapshot all inputs on the page
  const inputs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('input')).map(el => ({
      id:          el.id,
      name:        el.name,
      type:        el.type,
      placeholder: el.placeholder,
      visible:     el.offsetParent !== null,
    }))
  );
  console.log('\n=== INPUTS FOUND ===');
  console.table(inputs);

  // Try filling by id
  const loginId = await page.locator('#loginId').isVisible().catch(() => false);
  const uiPwd   = await page.locator('#uiPwd').isVisible().catch(() => false);
  const userLogin = await page.locator('#userLogin').isVisible().catch(() => false);
  console.log(`\n#loginId visible:  ${loginId}`);
  console.log(`#uiPwd visible:    ${uiPwd}`);
  console.log(`#userLogin visible: ${userLogin}`);

  if (loginId) {
    await page.fill('#loginId', 'demo1');
    console.log('Filled #loginId');
  }
  if (uiPwd) {
    await page.fill('#uiPwd', 'Abcd@1243');
    console.log('Filled #uiPwd');
  }

  await page.screenshot({ path: 'scripts/debug-login-filled.png', fullPage: true });
  console.log('\nScreenshot saved: scripts/debug-login-filled.png');

  // Check all pages before clicking
  console.log(`\nPages before click: ${context.pages().length}`);

  if (userLogin) {
    console.log('Clicking #userLogin...');
    await page.click('#userLogin');
    await page.waitForTimeout(5000);

    const pages = context.pages();
    console.log(`Pages after click: ${pages.length}`);
    for (let i = 0; i < pages.length; i++) {
      console.log(`  Page[${i}] URL: ${pages[i].url()}`);
    }

    await page.screenshot({ path: 'scripts/debug-after-click.png', fullPage: true }).catch(() => {});
    if (pages.length > 1) {
      await pages[pages.length - 1].screenshot({ path: 'scripts/debug-new-tab.png', fullPage: true }).catch(() => {});
    }
    console.log('Screenshots saved.');
  }

  await browser.close();
})();

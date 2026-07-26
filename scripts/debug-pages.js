const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext();
  const page    = await context.newPage();

  await page.goto('http://172.21.0.39:7999/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en');
  await page.waitForLoadState('domcontentloaded');
  await page.fill('#loginId', 'demo1');
  await page.locator('#loginId').press('Tab');
  await page.fill('#uiPwd', 'Abcd@1243');

  const [appPage] = await Promise.all([
    context.waitForEvent('page', { timeout: 30_000 }),
    page.click('#userLogin'),
  ]);
  await appPage.waitForLoadState('domcontentloaded');
  await appPage.waitForTimeout(3000);

  console.log(`\nAll pages after login:`);
  for (const [i, p] of context.pages().entries()) {
    const url = p.url();
    const hamburger = await p.locator('a.item-nav').isVisible({ timeout: 1000 }).catch(() => false);
    const bodySnip  = await p.evaluate(() => document.body?.innerHTML?.slice(0,150)).catch(() => '');
    console.log(`  Page[${i}]: ${url}`);
    console.log(`    hamburger: ${hamburger}`);
    console.log(`    body: ${bodySnip.replace(/\s+/g,' ').slice(0,120)}`);
  }

  // Find the page with the hamburger
  let mainApp = context.pages().find(async p => await p.locator('a.item-nav').isVisible({ timeout: 500 }).catch(() => false));
  // Sync check
  for (const p of context.pages()) {
    const h = await p.locator('a.item-nav').isVisible({ timeout: 1000 }).catch(() => false);
    if (h) { mainApp = p; break; }
  }
  console.log(`\nMain app page: ${mainApp?.url()}`);

  if (!mainApp) { await browser.close(); return; }

  // Navigate via menu on the correct page
  await mainApp.locator('a.item-nav').first().click();
  await mainApp.waitForTimeout(1000);

  const allFrames = mainApp.frames();
  console.log(`\nFrames on mainApp: ${allFrames.length}`);
  for (const [i, f] of allFrames.entries()) {
    const url = f.url();
    const addVis = await f.locator('button.add, #addButton').isVisible({ timeout: 500 }).catch(() => false);
    const bodySnip = await f.evaluate(() => document.body?.innerHTML?.slice(0,200)).catch(() => '');
    console.log(`  Frame[${i}]: ${url}`);
    console.log(`    Add visible: ${addVis}`);
    console.log(`    Body: ${bodySnip.replace(/\s+/g,' ').slice(0,120)}`);
  }

  await mainApp.screenshot({ path: 'scripts/debug-mainapp.png' });
  await browser.close();
})();

const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page    = await context.newPage();

  const BASE_URL = 'http://172.21.0.39:7999';
  const APP_PATH = '/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en';

  // ── Login ──────────────────────────────────────────────────────────────────
  await page.goto(`${BASE_URL}${APP_PATH}`);
  await page.waitForLoadState('domcontentloaded');
  await page.fill('#loginId', 'demo1');
  await page.locator('#loginId').press('Tab');
  await page.fill('#uiPwd', 'Abcd@1243');
  const [appPage] = await Promise.all([
    context.waitForEvent('page', { timeout: 30_000 }),
    page.click('#userLogin'),
  ]);
  await appPage.waitForLoadState('domcontentloaded');
  console.log(`Logged in. URL: ${appPage.url()}`);

  // ── Navigate to Customer Creation ─────────────────────────────────────────
  await appPage.goto(`${BASE_URL}/Kiya.aiCBS-10.2.0/customerList?menuCode=CUSTOMER`);
  await appPage.waitForLoadState('domcontentloaded');
  await appPage.waitForTimeout(2000);

  // ── Click Add button ───────────────────────────────────────────────────────
  const addBtn = appPage.locator('button.add, #addButton').first();
  await addBtn.waitFor({ state: 'visible', timeout: 10_000 });
  console.log('Clicking Add...');
  const pagesBefore = context.pages().length;
  await addBtn.click({ force: true });
  await appPage.waitForLoadState('domcontentloaded');
  await appPage.waitForTimeout(2000);
  const pagesAfter = context.pages().length;
  console.log(`Pages before: ${pagesBefore}, after: ${pagesAfter}`);
  console.log(`Current URL: ${appPage.url()}`);
  await appPage.screenshot({ path: 'scripts/debug-tab1.png' });

  // ── Check for customerCategory field ──────────────────────────────────────
  const catVisible = await appPage.locator('#customerCategory').isVisible({ timeout: 5000 }).catch(() => false);
  console.log(`#customerCategory visible: ${catVisible}`);

  // Check if it's inside an iframe
  const frames = appPage.frames();
  console.log(`\nFrames on page: ${frames.length}`);
  for (const [i, f] of frames.entries()) {
    console.log(`  Frame[${i}]: ${f.url()}`);
    const hasCat = await f.locator('#customerCategory').isVisible({ timeout: 500 }).catch(() => false);
    if (hasCat) console.log(`    ^^^ #customerCategory found in this frame!`);
  }

  // ── Fill Tab 1 minimal fields ──────────────────────────────────────────────
  const targetFrame = frames.find(async f => await f.locator('#customerCategory').isVisible({ timeout: 300 }).catch(() => false)) ?? appPage.mainFrame();
  const frameOrPage = frames.length > 1 ? appPage.frames()[1] : appPage;

  // Try filling customerCategory
  try {
    await frameOrPage.locator('#customerCategory').selectOption('1');
    console.log('Selected customerCategory=1');
  } catch(e) { console.log(`customerCategory select failed: ${e.message}`); }

  try {
    await frameOrPage.locator('#memberFName').fill('ISHAN');
    console.log('Filled memberFName');
  } catch(e) { console.log(`memberFName fill failed: ${e.message}`); }

  try {
    await frameOrPage.locator('#memberLName').fill('SRI');
    console.log('Filled memberLName');
  } catch(e) { console.log(`memberLName fill failed: ${e.message}`); }

  try {
    await frameOrPage.locator('#memberDOB').fill('01-01-1999');
    await frameOrPage.locator('#memberDOB').press('Tab');
    console.log('Filled memberDOB');
  } catch(e) { console.log(`memberDOB fill failed: ${e.message}`); }

  await appPage.screenshot({ path: 'scripts/debug-tab1-filled.png' });
  console.log('Tab1 screenshot saved.');

  // ── Click Next and observe ─────────────────────────────────────────────────
  const nextBtn = frameOrPage.locator('#nextBtn').first();
  const nextVisible = await nextBtn.isVisible({ timeout: 5000 }).catch(() => false);
  console.log(`\n#nextBtn visible: ${nextVisible}`);

  if (nextVisible) {
    const pagesBefore2 = context.pages().length;
    console.log('Clicking Next...');
    await nextBtn.click();
    await appPage.waitForLoadState('domcontentloaded').catch(() => {});
    await appPage.waitForTimeout(3000);
    const pagesAfter2 = context.pages().length;
    console.log(`Pages before: ${pagesBefore2}, after: ${pagesAfter2}`);
    console.log(`Current URL: ${appPage.url()}`);
    for (const [i, p] of context.pages().entries()) {
      console.log(`  Page[${i}]: ${p.url()}`);
    }
    await appPage.screenshot({ path: 'scripts/debug-tab2.png' });
    console.log('Tab2 screenshot saved.');
  }

  await browser.close();
})();

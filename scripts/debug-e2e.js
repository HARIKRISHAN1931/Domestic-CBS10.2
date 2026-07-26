const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
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
  await appPage.locator('a.item-nav').waitFor({ state: 'visible', timeout: 15_000 });
  console.log(`Logged in: ${appPage.url()}`);

  // ── Menu navigation (same as MenuNavigation.ts) ────────────────────────────
  await appPage.locator('a.item-nav').first().click();
  await appPage.locator('li#Masters > a.dropnav').waitFor({ state: 'visible', timeout: 10_000 });
  await appPage.locator('li#Masters > a.dropnav').click();
  await appPage.locator('li#customermgmt > a.s-dropnav').waitFor({ state: 'visible', timeout: 8_000 });
  await appPage.locator('li#customermgmt > a.s-dropnav').click();
  await appPage.locator('li#CUSTOMER > a').waitFor({ state: 'visible', timeout: 8_000 });
  await appPage.locator('li#CUSTOMER > a').click();

  // Wait for grid to load
  await appPage.waitForFunction(() => {
    const loader = document.querySelector('.loading, .loader, #loadingDiv, .page-loader');
    return !loader || loader.style.display === 'none';
  }, { timeout: 15_000 }).catch(() => {});
  await appPage.waitForTimeout(2000);

  console.log(`After menu nav URL: ${appPage.url()}`);
  await appPage.screenshot({ path: 'scripts/debug-e2e-grid.png' });

  // Check Add button
  for (const sel of ['button.add', '#addButton', '#createButton']) {
    const vis = await appPage.locator(sel).isVisible({ timeout: 1000 }).catch(() => false);
    console.log(`${sel}: ${vis}`);
  }

  // ── Click Add ──────────────────────────────────────────────────────────────
  const addBtn = appPage.locator('button.add, #addButton').first();
  await addBtn.waitFor({ state: 'visible', timeout: 10_000 });
  console.log('\nClicking Add...');
  await addBtn.click({ force: true });

  // Poll for customerCategory every 500ms up to 15s
  let found = false;
  for (let i = 0; i < 30; i++) {
    await appPage.waitForTimeout(500);
    const url = appPage.url();
    const vis = await appPage.locator('#customerCategory').isVisible({ timeout: 200 }).catch(() => false);
    console.log(`  t=${((i+1)*0.5).toFixed(1)}s  url=${url}  #customerCategory=${vis}`);
    if (vis) { found = true; break; }
  }

  await appPage.screenshot({ path: 'scripts/debug-e2e-addform.png' });
  console.log(`\n#customerCategory found: ${found}`);

  if (found) {
    // Try filling
    await appPage.locator('#customerCategory').selectOption('1').catch(e => console.log('select failed:', e.message));
    await appPage.locator('#memberFName').fill('ISHAN').catch(e => console.log('fill failed:', e.message));
    await appPage.locator('#memberLName').fill('SRI').catch(e => console.log('fill failed:', e.message));
    await appPage.locator('#memberDOB').fill('01-01-1999').catch(e => console.log('fill failed:', e.message));
    await appPage.locator('#memberDOB').press('Tab');
    await appPage.waitForTimeout(1000);
    await appPage.screenshot({ path: 'scripts/debug-e2e-tab1-filled.png' });
    console.log('Tab1 filled. Screenshot saved.');
  }

  await browser.close();
})();

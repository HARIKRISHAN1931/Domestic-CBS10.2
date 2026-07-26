const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 600 });
  const context = await browser.newContext();
  const page    = await context.newPage();

  const BASE_URL = 'http://172.21.0.39:7999';
  const APP_PATH = '/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en';

  // ── Login ──────────────────────────────────────────────────────────────────
  console.log('Navigating to login...');
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
  console.log(`App page URL: ${appPage.url()}`);
  await appPage.screenshot({ path: 'scripts/debug-01-home.png' });

  // ── Navigate via menu ──────────────────────────────────────────────────────
  // Click hamburger
  const hamburger = appPage.locator('a.item-nav').first();
  await hamburger.waitFor({ state: 'visible', timeout: 15_000 });
  await hamburger.click();
  await appPage.waitForTimeout(1000);
  await appPage.screenshot({ path: 'scripts/debug-02-menu-open.png' });

  // Click Masters
  const masters = appPage.locator('text=Masters').first();
  if (await masters.isVisible({ timeout: 3000 }).catch(() => false)) {
    await masters.click();
    await appPage.waitForTimeout(800);
  }
  await appPage.screenshot({ path: 'scripts/debug-03-masters.png' });

  // Click Customer Management
  const custMgmt = appPage.locator('text=Customer Management').first();
  if (await custMgmt.isVisible({ timeout: 3000 }).catch(() => false)) {
    await custMgmt.click();
    await appPage.waitForTimeout(800);
  }
  await appPage.screenshot({ path: 'scripts/debug-04-custmgmt.png' });

  // Click Customer Creation
  const custCreate = appPage.locator('text=Customer Creation').first();
  if (await custCreate.isVisible({ timeout: 3000 }).catch(() => false)) {
    await custCreate.click();
    await appPage.waitForTimeout(3000);
  }
  await appPage.screenshot({ path: 'scripts/debug-05-after-nav.png' });
  console.log(`After nav URL: ${appPage.url()}`);
  console.log(`Total pages: ${context.pages().length}`);
  for (const [i, p] of context.pages().entries()) {
    console.log(`  Page[${i}]: ${p.url()}`);
  }

  // ── Inspect the grid page ──────────────────────────────────────────────────
  const activePage = context.pages()[context.pages().length - 1];
  await activePage.waitForLoadState('domcontentloaded');
  await activePage.screenshot({ path: 'scripts/debug-06-grid.png' });

  // Find all buttons/links that could be the Add button
  const btns = await activePage.evaluate(() =>
    Array.from(document.querySelectorAll('button, a.button, a.btn, input[type=button]')).map(el => ({
      tag:  el.tagName,
      id:   el.id,
      cls:  el.className,
      text: el.textContent?.trim().slice(0, 40),
      href: el.getAttribute('href'),
    }))
  );
  console.log('\n=== BUTTONS/LINKS ON GRID PAGE ===');
  console.table(btns);

  // Check specific selectors
  for (const sel of ['#createButton', '#addButton', 'button.add', 'a.add', '.btn-add', '[title="Add"]', '[title="Create"]']) {
    const el = activePage.locator(sel).first();
    const vis = await el.isVisible({ timeout: 500 }).catch(() => false);
    console.log(`${sel}: visible=${vis}`);
  }

  // ── Try clicking Add and observe ───────────────────────────────────────────
  const addBtn = activePage.locator('#createButton, button.add, #addButton').first();
  const addVisible = await addBtn.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`\nAdd button visible: ${addVisible}`);

  if (addVisible) {
    console.log('Clicking Add button...');
    const pagesBefore = context.pages().length;
    await addBtn.click({ force: true });
    await activePage.waitForTimeout(5000);
    const pagesAfter = context.pages().length;
    console.log(`Pages before: ${pagesBefore}, after: ${pagesAfter}`);
    for (const [i, p] of context.pages().entries()) {
      console.log(`  Page[${i}]: ${p.url()}`);
    }
    await activePage.screenshot({ path: 'scripts/debug-07-after-add-click.png' }).catch(() => {});
    if (pagesAfter > pagesBefore) {
      const newTab = context.pages()[pagesAfter - 1];
      await newTab.screenshot({ path: 'scripts/debug-08-new-tab.png' }).catch(() => {});
      console.log('New tab screenshot saved.');
    }
  }

  await browser.close();
})();

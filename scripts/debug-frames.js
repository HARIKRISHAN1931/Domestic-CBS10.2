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

  // Navigate via menu (same as MenuNavigation does)
  await appPage.locator('a.item-nav').first().click();
  await appPage.locator('li#Masters > a.dropnav').waitFor({ state: 'visible', timeout: 10_000 });
  await appPage.locator('li#Masters > a.dropnav').click();
  await appPage.locator('li#customermgmt > a.s-dropnav').waitFor({ state: 'visible', timeout: 8_000 });
  await appPage.locator('li#customermgmt > a.s-dropnav').click();
  await appPage.locator('li#CUSTOMER > a').waitFor({ state: 'visible', timeout: 8_000 });
  await appPage.locator('li#CUSTOMER > a').click();
  await appPage.waitForTimeout(3000);

  console.log(`After menu nav URL: ${appPage.url()}`);
  console.log(`Frames after menu nav: ${appPage.frames().length}`);
  for (const [i, f] of appPage.frames().entries()) {
    console.log(`  Frame[${i}]: ${f.url()}`);
  }
  await appPage.screenshot({ path: 'scripts/debug-after-menu-nav.png' });

  // Now simulate what BasePage.loc() does
  const frames = appPage.frames();
  const contentFrame = frames.find(f => f !== appPage.mainFrame() && f.url() !== 'about:blank');
  console.log(`\nBasePage.loc() would use: ${contentFrame ? 'iframe: ' + contentFrame.url() : 'mainFrame'}`);

  // Check if Add button is in mainFrame or iframe
  const addInMain = await appPage.mainFrame().locator('button.add, #addButton').isVisible({ timeout: 2000 }).catch(() => false);
  console.log(`Add button in mainFrame: ${addInMain}`);
  if (contentFrame) {
    const addInFrame = await contentFrame.locator('button.add, #addButton').isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`Add button in iframe: ${addInFrame}`);
  }

  // Click Add
  const addBtn = (contentFrame ?? appPage.mainFrame()).locator('button.add, #addButton').first();
  await addBtn.waitFor({ state: 'visible', timeout: 10_000 });
  await addBtn.click({ force: true });
  await appPage.waitForLoadState('domcontentloaded');
  await appPage.waitForTimeout(2000);

  console.log(`\nAfter Add click URL: ${appPage.url()}`);
  console.log(`Frames after Add click: ${appPage.frames().length}`);
  for (const [i, f] of appPage.frames().entries()) {
    console.log(`  Frame[${i}]: ${f.url()}`);
  }

  // Simulate BasePage.loc() again on addNewMember page
  const frames2 = appPage.frames();
  const contentFrame2 = frames2.find(f => f !== appPage.mainFrame() && f.url() !== 'about:blank');
  console.log(`\nBasePage.loc() on addNewMember would use: ${contentFrame2 ? 'iframe: ' + contentFrame2.url() : 'mainFrame'}`);

  const catInMain = await appPage.mainFrame().locator('#customerCategory').isVisible({ timeout: 2000 }).catch(() => false);
  console.log(`#customerCategory in mainFrame: ${catInMain}`);
  if (contentFrame2) {
    const catInFrame = await contentFrame2.locator('#customerCategory').isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`#customerCategory in iframe: ${catInFrame}`);
  }

  await appPage.screenshot({ path: 'scripts/debug-addNewMember.png' });
  await browser.close();
})();

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

  // Navigate via menu
  await appPage.locator('a.item-nav').first().click();
  await appPage.locator('li#Masters > a.dropnav').waitFor({ state: 'visible', timeout: 10_000 });
  await appPage.locator('li#Masters > a.dropnav').click();
  await appPage.locator('li#customermgmt > a.s-dropnav').waitFor({ state: 'visible', timeout: 8_000 });
  await appPage.locator('li#customermgmt > a.s-dropnav').click();
  await appPage.locator('li#CUSTOMER > a').waitFor({ state: 'visible', timeout: 8_000 });
  await appPage.locator('li#CUSTOMER > a').click();
  await appPage.waitForTimeout(4000);

  console.log(`URL: ${appPage.url()}`);

  // Check ALL frames including same-URL ones
  const allFrames = appPage.frames();
  console.log(`\nTotal frames: ${allFrames.length}`);
  for (const [i, f] of allFrames.entries()) {
    const url = f.url();
    const isMain = f === appPage.mainFrame();
    const addVis = await f.locator('button.add, #addButton').isVisible({ timeout: 500 }).catch(() => false);
    const html = await f.evaluate(() => document.body?.innerHTML?.slice(0, 200)).catch(() => '');
    console.log(`  Frame[${i}] isMain=${isMain} url=${url}`);
    console.log(`    Add visible: ${addVis}`);
    console.log(`    Body snippet: ${html.replace(/\s+/g,' ').slice(0,150)}`);
  }

  // Check if the page has any iframes in DOM
  const iframes = await appPage.evaluate(() =>
    Array.from(document.querySelectorAll('iframe')).map(f => ({
      id: f.id, src: f.src, name: f.name
    }))
  );
  console.log('\nIframes in DOM:', JSON.stringify(iframes, null, 2));

  await browser.close();
})();

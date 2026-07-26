const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext();
  const lp = await context.newPage();
  await lp.goto('http://172.21.0.39:7999/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en');
  await lp.locator('#loginId').fill('demo1');
  await lp.locator('#uiPwd').fill('Abcd@1243');
  await lp.locator('#userLogin').click();
  const ap = await context.waitForEvent('page');
  await ap.waitForSelector('a.item-nav', { timeout: 30000 });
  await ap.waitForTimeout(2000);
  await ap.locator('a.item-nav').first().click();
  await ap.waitForTimeout(1000);
  await ap.locator('li#Administration > a.dropnav').waitFor({ state: 'visible', timeout: 10000 });
  await ap.locator('li#Administration > a.dropnav').click();
  await ap.waitForTimeout(500);
  await ap.locator('li#setupAdm > a.s-dropnav').waitFor({ state: 'visible', timeout: 10000 });
  await ap.locator('li#setupAdm > a.s-dropnav').click();
  await ap.waitForTimeout(500);
  await ap.locator('li#COUNTRYMST > a').click();
  await ap.waitForTimeout(3000);

  // Switch to Authorized tab
  await ap.locator('#AuthorizedList').click();
  await ap.waitForTimeout(1500);

  // Search IND
  const input = ap.locator('#dt-authdata_filter input[type="search"]').first();
  await input.fill('IND');
  await ap.waitForTimeout(2000);

  // Get all links in the IND row
  const row = ap.locator('#dt-authdata tbody tr').filter({ hasText: 'IND' }).first();
  const rowVisible = await row.isVisible().catch(() => false);
  console.log('IND row visible:', rowVisible);

  if (rowVisible) {
    // Hover to reveal action buttons
    await row.hover();
    await ap.waitForTimeout(500);

    const links = await row.locator('a').all();
    console.log('Links in row:', links.length);
    for (const link of links) {
      const title = await link.getAttribute('title').catch(() => '');
      const cls   = await link.getAttribute('class').catch(() => '');
      const txt   = await link.innerText().catch(() => '');
      const href  = await link.getAttribute('href').catch(() => '');
      const vis   = await link.isVisible().catch(() => false);
      console.log({ title, cls, txt: txt.trim(), href: href?.substring(0,50), visible: vis });
    }

    // Also check row HTML
    const rowHtml = await row.innerHTML().catch(() => '');
    console.log('\nRow HTML snippet:', rowHtml.substring(0, 500));
  }

  await ap.waitForTimeout(8000);
  await browser.close();
})();

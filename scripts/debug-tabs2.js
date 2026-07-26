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

  // Get all visible links on page
  const allLinks = await ap.locator('a').all();
  for (const link of allLinks) {
    const txt  = await link.innerText().catch(() => '');
    const href = await link.getAttribute('href').catch(() => '');
    const cls  = await link.getAttribute('class').catch(() => '');
    const id   = await link.getAttribute('id').catch(() => '');
    if (txt.trim() && (txt.toLowerCase().includes('auth') || txt.toLowerCase().includes('pend') || txt.toLowerCase().includes('reject'))) {
      console.log({ txt: txt.trim(), href, cls, id });
    }
  }

  // Also check ul.nav-tabs or similar
  const navTabs = await ap.locator('ul.nav-tabs, ul.nav, .tab-header, .tabs').count();
  console.log('\nNav tab containers:', navTabs);

  // Get all tab-like elements
  const tabEls = await ap.locator('[role="tab"], .nav-tabs li, .tab-item').all();
  for (const el of tabEls) {
    const txt = await el.innerText().catch(() => '');
    const cls = await el.getAttribute('class').catch(() => '');
    console.log('Tab el:', { txt: txt.trim(), cls });
  }

  await ap.waitForTimeout(8000);
  await browser.close();
})();

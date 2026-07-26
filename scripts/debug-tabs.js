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

  // Get tab HTML
  const html = await ap.content();
  // Find tab links
  const tabMatches = [...html.matchAll(/<a[^>]*href="#dt-authdata[^"]*"[^>]*>([^<]*)<\/a>/g)];
  console.log('Auth tab links:', tabMatches.map(m => m[0].substring(0, 150)));

  // Also find all tab-like elements
  const tabLinks = [...html.matchAll(/<a[^>]*data-toggle="tab"[^>]*>([^<]*)<\/a>/g)];
  console.log('\nAll data-toggle=tab links:');
  tabLinks.forEach(m => console.log(' ', m[0].substring(0, 150)));

  // Find li elements with tab class
  const liTabs = [...html.matchAll(/<li[^>]*class="[^"]*tab[^"]*"[^>]*>([\s\S]*?)<\/li>/g)];
  console.log('\nTab li elements:');
  liTabs.slice(0, 5).forEach(m => console.log(' ', m[0].substring(0, 200)));

  await ap.waitForTimeout(5000);
  await browser.close();
})();

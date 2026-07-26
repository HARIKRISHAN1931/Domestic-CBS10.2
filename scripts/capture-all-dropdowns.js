const { chromium } = require('@playwright/test');

(async () => {
  const browser  = await chromium.launch({ headless: false, slowMo: 300 });
  const context  = await browser.newContext();
  const loginPage = await context.newPage();

  await loginPage.goto('http://172.21.0.39:7999/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en');
  await loginPage.locator('#loginId').fill('demo1');
  await loginPage.locator('#uiPwd').fill('Abcd@1243');
  await loginPage.locator('#userLogin').click();

  const appPage = await context.waitForEvent('page');
  await appPage.waitForSelector('a.item-nav', { timeout: 30000 });
  await appPage.waitForTimeout(2000);

  await appPage.locator('a.item-nav').first().click();
  await appPage.waitForTimeout(1000);
  await appPage.locator('li#Administration > a.dropnav').waitFor({ state: 'visible', timeout: 10000 });
  await appPage.locator('li#Administration > a.dropnav').click();
  await appPage.waitForTimeout(500);
  await appPage.locator('li#setupAdm > a.s-dropnav').waitFor({ state: 'visible', timeout: 10000 });
  await appPage.locator('li#setupAdm > a.s-dropnav').click();
  await appPage.waitForTimeout(500);
  await appPage.locator('li#COUNTRYMST > a').click();
  await appPage.waitForTimeout(3000);

  await appPage.locator('#addButton').click({ force: true });
  await appPage.waitForTimeout(3000);

  await appPage.locator('#countryCode').fill('ZZT');
  await appPage.locator('#countryCode').press('Tab');
  await appPage.waitForTimeout(3000);

  // Capture all dropdown options using page source (not evaluate)
  const html = await appPage.content();
  const selectMatches = [...html.matchAll(/<select[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)];
  
  for (const m of selectMatches) {
    const id = m[1];
    if (['level1','level2','qmenul1l2'].includes(id)) continue;
    const optMatches = [...m[2].matchAll(/<option[^>]*value="([^"]*)"[^>]*>([^<]*)<\/option>/g)];
    const opts = optMatches.map(o => `${o[1]}=${o[2].trim()}`).filter(o => !o.startsWith('='));
    if (opts.length > 0) console.log(`${id}: [${opts.join(' | ')}]`);
  }

  await browser.close();
})();

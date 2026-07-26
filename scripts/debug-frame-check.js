const { chromium } = require('@playwright/test');

(async () => {
  const browser  = await chromium.launch({ headless: false, slowMo: 200 });
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
  const adminToggle = appPage.locator('li#Administration > a.dropnav');
  await adminToggle.waitFor({ state: 'visible', timeout: 10000 });
  await adminToggle.click();
  await appPage.waitForTimeout(500);
  const subToggle = appPage.locator('li#setupAdm > a.s-dropnav');
  await subToggle.waitFor({ state: 'visible', timeout: 10000 });
  await subToggle.click();
  await appPage.waitForTimeout(500);
  await appPage.locator('li#COUNTRYMST > a').click();
  await appPage.waitForTimeout(3000);

  await appPage.locator('#addButton').click({ force: true });
  await appPage.waitForTimeout(2000);

  await appPage.locator('#countryCode').fill('ZZT');
  await appPage.locator('#countryCode').press('Tab');
  await appPage.waitForTimeout(2000);

  // List all frames and find the one with countryName
  const frames = appPage.frames();
  console.log('Total frames:', frames.length);
  for (const f of frames) {
    console.log(' -', f.url().substring(0, 80));
  }

  // Try main frame evaluate
  const mainResult = await appPage.mainFrame().evaluate(() => {
    return !!document.getElementById('countryName');
  });
  console.log('\ncountryName in mainFrame:', mainResult);

  // Check all frames
  for (const f of frames) {
    const has = await f.evaluate(() => !!document.getElementById('countryName')).catch(() => false);
    if (has) {
      console.log('\nFound in frame:', f.url());
      const info = await f.evaluate(() => {
        const ids = ['countryType','isdCode','zone','region','countryCode','countryName','countryAbbrevation','numCountyCd','pinLength'];
        return ids.map(id => {
          const el = document.getElementById(id);
          if (!el) return { id, found: false };
          const tag = el.tagName.toLowerCase();
          const opts = tag === 'select' ? Array.from(el.options).map(o => o.text.trim()) : [];
          const parent = el.closest('[class*="mandatory"], [class*="required"]');
          const label  = document.querySelector(`label[for="${id}"]`);
          return {
            id, tag,
            opts,
            hasMandatoryParent: !!parent,
            parentClass: parent?.className?.substring(0, 60) || '',
            labelText: label?.innerText?.trim() || '',
            required: el.hasAttribute('required'),
          };
        });
      });
      console.log(JSON.stringify(info, null, 2));
    }
  }

  await appPage.waitForTimeout(5000);
  await browser.close();
})();

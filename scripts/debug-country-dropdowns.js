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
  await appPage.waitForTimeout(3000); // wait longer for dropdowns to load

  // Check dropdowns BEFORE tab-out
  console.log('=== BEFORE Tab-out ===');
  for (const id of ['countryType','isdCode','zone','region']) {
    const opts = await appPage.locator(`#${id} option`).allInnerTexts().catch(() => []);
    console.log(`${id}: [${opts.join(' | ')}]`);
  }

  await appPage.locator('#countryCode').fill('ZZT');
  await appPage.locator('#countryCode').press('Tab');
  await appPage.waitForTimeout(3000); // wait longer after tab

  // Check dropdowns AFTER tab-out
  console.log('\n=== AFTER Tab-out (3s wait) ===');
  for (const id of ['countryType','isdCode','zone','region']) {
    const opts = await appPage.locator(`#${id} option`).allInnerTexts().catch(() => []);
    console.log(`${id}: [${opts.join(' | ')}]`);
  }

  // Check if countryType is marked mandatory in HTML
  const mandatoryInfo = await appPage.evaluate(() => {
    const ids = ['countryType','isdCode','zone','region','countryCode','countryName','countryAbbrevation','numCountyCd','pinLength'];
    return ids.map(id => {
      const el = document.getElementById(id);
      if (!el) return { id, found: false };
      const parent = el.closest('.control-mandatory, .mandatory, .required, [class*="mandatory"]');
      const label  = document.querySelector(`label[for="${id}"]`);
      return {
        id,
        found: true,
        hasMandatoryParent: !!parent,
        parentClass: parent?.className || '',
        labelText: label?.innerText?.trim() || '',
        required: el.hasAttribute('required'),
      };
    });
  });
  console.log('\n=== Mandatory markers ===');
  console.log(JSON.stringify(mandatoryInfo, null, 2));

  await appPage.waitForTimeout(8000);
  await browser.close();
})();

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

  await appPage.locator('a.item-nav').first().click();
  await appPage.locator('li#Administration > a.dropnav').click();
  await appPage.locator('li#setupAdm > a.s-dropnav').click();
  await appPage.locator('li#COUNTRYMST > a').click();
  await appPage.waitForTimeout(2000);

  await appPage.locator('#addButton').click({ force: true });
  await appPage.waitForTimeout(2000);

  await appPage.locator('#countryCode').fill('ZZT');
  await appPage.locator('#countryCode').press('Tab');
  await appPage.waitForTimeout(1500);

  // Find all mandatory fields (label has * or parent has mandatory class)
  const mandatory = await appPage.evaluate(() => {
    const results = [];
    // Check for elements with mandatory indicator
    document.querySelectorAll('input, select, textarea').forEach(el => {
      const id = el.id;
      if (!id) return;
      const parent = el.closest('.control-mandatory, .mandatory, .required');
      const label  = document.querySelector(`label[for="${id}"]`);
      const labelText = label ? label.innerText : '';
      const hasStar = labelText.includes('*') || 
                      el.closest('.form-group')?.querySelector('label')?.innerText?.includes('*');
      const required = el.hasAttribute('required') || el.getAttribute('aria-required') === 'true';
      if (parent || hasStar || required) {
        results.push({ id, tag: el.tagName, labelText: labelText.trim(), hasStar, required, hasParent: !!parent });
      }
    });
    return results;
  });

  console.log('Mandatory fields:', JSON.stringify(mandatory, null, 2));

  // Also check dropdown options count
  const dropdowns = ['countryType', 'isdCode', 'zone', 'region'];
  for (const id of dropdowns) {
    const count = await appPage.locator(`#${id} option`).count();
    const opts  = await appPage.locator(`#${id} option`).allInnerTexts();
    console.log(`\n${id} options (${count}):`, opts);
  }

  await appPage.waitForTimeout(5000);
  await browser.close();
})();

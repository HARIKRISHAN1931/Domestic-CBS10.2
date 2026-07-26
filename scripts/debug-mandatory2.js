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

  // Hamburger
  await appPage.locator('a.item-nav').first().click();
  await appPage.waitForTimeout(1000);

  // Administration
  const adminToggle = appPage.locator('li#Administration > a.dropnav');
  await adminToggle.waitFor({ state: 'visible', timeout: 10000 });
  await adminToggle.click();
  await appPage.waitForTimeout(500);

  // setupAdm
  const subToggle = appPage.locator('li#setupAdm > a.s-dropnav');
  await subToggle.waitFor({ state: 'visible', timeout: 10000 });
  await subToggle.click();
  await appPage.waitForTimeout(500);

  // COUNTRYMST
  await appPage.locator('li#COUNTRYMST > a').click();
  await appPage.waitForTimeout(3000);

  // Add
  await appPage.locator('#addButton').click({ force: true });
  await appPage.waitForTimeout(2000);

  // Fill countryCode + Tab
  await appPage.locator('#countryCode').fill('ZZT');
  await appPage.locator('#countryCode').press('Tab');
  await appPage.waitForTimeout(1500);

  // Dump mandatory info
  const info = await appPage.evaluate(() => {
    const results = [];
    document.querySelectorAll('input, select, textarea').forEach(el => {
      const id = el.id;
      if (!id || ['menuSearchBox','lockloginId','lockpwd','searchBox','branchCode','branchName'].includes(id)) return;
      const formGroup = el.closest('.form-group, .control-group, div');
      const labelEl   = formGroup ? formGroup.querySelector('label') : null;
      const labelText = labelEl ? labelEl.innerText.trim() : '';
      const isMandatory = !!(
        el.closest('[class*="mandatory"]') ||
        el.closest('[class*="required"]') ||
        labelText.includes('*') ||
        el.hasAttribute('required')
      );
      const tag = el.tagName.toLowerCase();
      let optCount = 0;
      if (tag === 'select') optCount = el.options.length;
      results.push({ id, tag, label: labelText, mandatory: isMandatory, optCount, disabled: el.disabled });
    });
    return results;
  });

  console.log('Fields:\n', JSON.stringify(info, null, 2));

  await appPage.waitForTimeout(5000);
  await browser.close();
})();

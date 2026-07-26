// Fills CountryMaster form and captures validation errors / toast
const { chromium } = require('@playwright/test');

(async () => {
  const BASE_URL = 'http://172.21.0.39:7999';
  const APP_PATH = '/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en';

  const browser  = await chromium.launch({ headless: false, slowMo: 500 });
  const context  = await browser.newContext();
  const loginPage = await context.newPage();

  await loginPage.goto(`${BASE_URL}${APP_PATH}`);
  await loginPage.locator('#loginId').fill('demo1');
  await loginPage.locator('#uiPwd').fill('Abcd@1243');
  await loginPage.locator('#userLogin').click();

  const appPage = await context.waitForEvent('page');
  await appPage.waitForLoadState('domcontentloaded');
  await appPage.waitForSelector('a.item-nav', { timeout: 30000 });

  // Navigate
  await appPage.locator('a.item-nav').first().click();
  await appPage.locator('li#Administration > a.dropnav').click();
  await appPage.locator('li#setupAdm > a.s-dropnav').click();
  await appPage.locator('li#COUNTRYMST > a').click();
  await appPage.waitForLoadState('domcontentloaded');
  await appPage.waitForTimeout(2000);

  // Add
  await appPage.locator('#addButton').click({ force: true });
  await appPage.waitForTimeout(2000);

  // Fill countryCode + Tab to unlock
  await appPage.locator('#countryCode').fill('ZZT');
  await appPage.locator('#countryCode').press('Tab');
  await appPage.waitForTimeout(1500);

  // Check which fields are now enabled
  const fields = ['countryName','countryAbbrevation','numCountyCd','countryType','isdCode','zone','region','pinLength'];
  for (const f of fields) {
    const el = appPage.locator(`#${f}`).first();
    const disabled = await el.isDisabled().catch(() => true);
    const visible  = await el.isVisible().catch(() => false);
    console.log(`${f}: visible=${visible} disabled=${disabled}`);
  }

  // Fill text fields
  await appPage.locator('#countryName').fill('Test Country ZZT').catch(() => {});
  await appPage.locator('#countryName').press('Tab');
  await appPage.locator('#countryAbbrevation').fill('ZT').catch(() => {});
  await appPage.locator('#countryAbbrevation').press('Tab');
  await appPage.locator('#numCountyCd').fill('999').catch(() => {});
  await appPage.locator('#numCountyCd').press('Tab');
  await appPage.locator('#pinLength').fill('6').catch(() => {});
  await appPage.locator('#pinLength').press('Tab');
  await appPage.waitForTimeout(1000);

  // Click save
  await appPage.locator('button#saveCustomer').first().click({ force: true });
  await appPage.waitForTimeout(3000);

  // Check for confirm modal
  const confirmVisible = await appPage.locator('#submitForm').isVisible().catch(() => false);
  console.log('\nConfirm modal visible:', confirmVisible);

  // Check for toast
  const toastText = await appPage.locator('.toast-messages .msg-toast em').first().innerText().catch(() => 'NO TOAST');
  console.log('Toast:', toastText);

  // Check for error messages
  const errors = await appPage.locator('.error-msg, .alert-danger, .validation-error').allInnerTexts().catch(() => []);
  console.log('Errors:', errors);

  // Keep open for 10s to observe
  await appPage.waitForTimeout(10000);
  await browser.close();
})();

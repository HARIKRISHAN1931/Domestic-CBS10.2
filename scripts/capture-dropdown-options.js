// Captures all dropdown options from CountryMaster Add form
const { chromium } = require('@playwright/test');

(async () => {
  const BASE_URL  = 'http://172.21.0.39:7999';
  const APP_PATH  = '/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en';
  const USERNAME  = 'demo1';
  const PASSWORD  = 'Abcd@1243';

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext();
  const loginPage = await context.newPage();

  // Login
  await loginPage.goto(`${BASE_URL}${APP_PATH}`);
  await loginPage.locator('#loginId').fill(USERNAME);
  await loginPage.locator('#uiPwd').fill(PASSWORD);
  await loginPage.locator('#userLogin').click();

  // Wait for new tab (CBS app opens in new tab)
  const appPage = await context.waitForEvent('page');
  await appPage.waitForLoadState('domcontentloaded');
  await appPage.waitForSelector('a.item-nav', { timeout: 30000 });

  // Navigate to CountryMaster
  await appPage.locator('a.item-nav').first().click();
  await appPage.locator('li#Administration > a.dropnav').click();
  await appPage.locator('li#setupAdm > a.s-dropnav').click();
  await appPage.locator('li#COUNTRYMST > a').click();
  await appPage.waitForLoadState('domcontentloaded');
  await appPage.waitForTimeout(2000);

  // Click Add
  await appPage.locator('#addButton').click({ force: true });
  await appPage.waitForTimeout(2000);

  // Fill countryCode and Tab to unlock other fields
  await appPage.locator('#countryCode').fill('TST');
  await appPage.locator('#countryCode').press('Tab');
  await appPage.waitForTimeout(1500);

  // Capture all select options
  const dropdowns = ['countryType', 'isdCode', 'zone', 'region'];
  const result = {};

  for (const id of dropdowns) {
    const options = await appPage.locator(`#${id} option`).allInnerTexts().catch(() => []);
    result[id] = options.filter(o => o.trim() && o.trim() !== '--Select--' && o.trim() !== 'Select');
    console.log(`\n${id}: ${JSON.stringify(result[id])}`);
  }

  console.log('\n\nFULL RESULT:\n', JSON.stringify(result, null, 2));

  await browser.close();
})();

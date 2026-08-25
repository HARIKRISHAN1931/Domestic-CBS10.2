const { chromium } = require('playwright');
const fs = require('fs');
require('dotenv').config({ path: '.env.qa' });

(async () => {
  const BASE=process.env.BASE_URL, APP=process.env.CBS_APP_PATH||'/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en';
  const MAKER=process.env.MAKER_USERNAME, PASS=process.env.MAKER_PASSWORD;

  const br  = await chromium.launch({ headless: false, slowMo: 100 });
  const ctx = await br.newContext({ baseURL: BASE });
  const lg  = await ctx.newPage();
  await lg.goto(BASE + APP, { waitUntil: 'domcontentloaded' });
  if (await lg.locator('#relogin').isVisible({ timeout: 2000 }).catch(() => false)) await lg.locator('#relogin').click();
  await lg.locator('#loginId').fill(MAKER);
  await lg.locator('#loginId').press('Tab');
  await lg.locator('#uiPwd').fill(PASS);
  const [app] = await Promise.all([ctx.waitForEvent('page', { timeout: 30000 }), lg.locator('#userLogin').click()]);
  await app.waitForLoadState('domcontentloaded');
  await app.bringToFront();
  await app.waitForTimeout(3000);

  // Navigate
  await app.locator('a.item-nav').first().click({ force: true });
  await app.waitForTimeout(600);
  await app.locator('li#Administration').click({ force: true }).catch(() => {});
  await app.waitForTimeout(400);
  await app.locator('li#usermgmtAdm').click({ force: true }).catch(() => {});
  await app.waitForTimeout(400);
  await app.locator('li#USERMGMT').click({ force: true });
  await app.waitForTimeout(2000);

  await app.locator('#addButton').waitFor({ state: 'visible', timeout: 15000 });
  await app.locator('#addButton').click({ force: true });
  await app.locator('#loginId').waitFor({ state: 'visible', timeout: 20000 });
  await app.waitForTimeout(1000);

  // loginId
  await app.locator('#loginId').click({ force: true });
  await app.keyboard.type('TESTCAP77', { delay: 30 });
  await app.locator('#loginId').press('Tab');
  await app.waitForTimeout(500);

  // employeeId
  await app.locator('#employeeId').click({ force: true });
  await app.keyboard.type('MGR101', { delay: 30 });
  await app.locator('#employeeId').press('Tab');
  await app.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  console.log('empId filled, networkidle done');

  // roleCode F2
  const f2 = app.locator('#roleCodeF2').first();
  console.log('roleCodeF2 visible:', await f2.isVisible({ timeout: 3000 }).catch(() => false));
  await f2.click({ force: true });
  await app.waitForTimeout(1500);

  const popup = app.locator('#add-popnew');
  const popVis = await popup.isVisible({ timeout: 5000 }).catch(() => false);
  console.log('popup visible:', popVis);

  if (popVis) {
    const html = await popup.innerHTML().catch(() => '');
    fs.writeFileSync('scripts/role-popup.html', html);
    console.log('HTML saved, size:', html.length);

    const td1 = await popup.locator('td.selecttd1').count();
    const trCount = await popup.locator('table tbody tr').count();
    console.log('td.selecttd1 count:', td1, '| tr count:', trCount);

    // Try clicking td.selecttd1
    if (td1 > 0) {
      await popup.locator('td.selecttd1').first().click({ force: true });
      await app.waitForTimeout(1000);
      console.log('popup hidden after click:', await popup.isHidden().catch(() => false));
      console.log('roleCode value:', await app.locator('#roleCode').first().inputValue().catch(() => ''));
    } else {
      // Try clicking first tr
      await popup.locator('table tbody tr').first().click({ force: true });
      await app.waitForTimeout(1000);
      console.log('popup hidden after tr click:', await popup.isHidden().catch(() => false));
      console.log('roleCode value:', await app.locator('#roleCode').first().inputValue().catch(() => ''));
    }
  }

  await app.waitForTimeout(3000);
  await br.close();
})().catch(e => { console.error(e.message); process.exit(1); });

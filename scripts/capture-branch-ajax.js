const { chromium } = require('playwright');
require('dotenv').config({ path: '.env.qa' });

(async () => {
  const BASE=process.env.BASE_URL, APP=process.env.CBS_APP_PATH||'/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en';
  const MAKER=process.env.MAKER_USERNAME, PASS=process.env.MAKER_PASSWORD;

  const br  = await chromium.launch({ headless: false });
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
  await app.waitForTimeout(2000);

  // Log ALL network requests
  app.on('request',  req => { if (!req.url().includes('.js') && !req.url().includes('.css') && !req.url().includes('.png')) console.log('REQ:', req.url()); });
  app.on('response', res => { if (!res.url().includes('.js') && !res.url().includes('.css') && !res.url().includes('.png')) console.log('RES:', res.status(), res.url()); });

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
  await app.waitForTimeout(500);

  await app.locator('#loginId').click({ force: true });
  await app.keyboard.type('TESTCAP55', { delay: 30 });
  await app.locator('#loginId').press('Tab');
  await app.waitForTimeout(300);

  await app.locator('#employeeId').click({ force: true });
  await app.keyboard.type('MGR102', { delay: 30 });
  await app.locator('#employeeId').press('Tab');
  await app.waitForTimeout(2000);

  // roleCode F2
  await app.locator('#roleCodeF2').first().click({ force: true });
  const rp = app.locator('#add-popnew');
  await rp.waitFor({ state: 'visible', timeout: 10000 });
  await app.waitForTimeout(800);
  await rp.locator('table tbody tr').first().click({ force: true });
  await rp.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
  await app.waitForTimeout(300);

  console.log('\n--- CLICKING BRANCH F2 NOW ---');
  // branch F2
  await app.locator('#assignedBranchF2').first().click({ force: true });
  const bp = app.locator('#add-popnew');
  await bp.waitFor({ state: 'visible', timeout: 10000 });
  await app.waitForTimeout(800);
  const bi = bp.locator('input:visible').first();
  if (await bi.count() > 0) {
    await bi.fill('102');
    const sb = bp.locator('button:visible').filter({ hasText: /search/i }).first();
    if (await sb.count() > 0) { await sb.click(); await app.waitForTimeout(1500); }
  }
  await app.evaluate(new Function(`
    var td = document.querySelector('#add-popnew table tbody tr td.selecttd1');
    if (td) td.click();
    else { var tr = document.querySelector('#add-popnew table tbody tr'); if (tr) tr.click(); }
  `));
  await bp.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
  console.log('--- BRANCH SELECTED, watching AJAX ---');

  await app.waitForTimeout(5000);
  console.log('\nuserDisplayName disabled:', await app.locator('#userDisplayName').first().isDisabled().catch(() => 'err'));
  await br.close();
})().catch(e => { console.error(e.message); process.exit(1); });

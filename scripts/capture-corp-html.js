/**
 * Captures HTML of all 3 CORPCUSTOMER pages + tries empty submit on page1 to find validation errors.
 * Run: node scripts/capture-corp-html.js
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.qa' });

const BASE  = process.env.BASE_URL;
const APP   = process.env.CBS_APP_PATH || '/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en';
const MAKER = process.env.MAKER_USERNAME;
const PASS  = process.env.MAKER_PASSWORD;

(async () => {
  const browser = await chromium.launch({ headless: false });
  const ctx     = await browser.newContext({ baseURL: BASE });
  const login   = await ctx.newPage();

  await login.goto(`${BASE}${APP}`, { waitUntil: 'domcontentloaded' });
  const relogin = login.locator('#relogin');
  if (await relogin.isVisible({ timeout: 2000 }).catch(() => false)) await relogin.click();
  await login.locator('#loginId').fill(MAKER);
  await login.locator('#loginId').press('Tab');
  await login.locator('#uiPwd').fill(PASS);
  const [app] = await Promise.all([
    ctx.waitForEvent('page', { timeout: 30000 }),
    login.locator('#userLogin').click(),
  ]);
  await app.waitForLoadState('domcontentloaded');
  await app.bringToFront();
  await app.waitForTimeout(2000);

  // Navigate
  await app.locator('a.item-nav').first().click();
  await app.waitForTimeout(400);
  await app.locator('a[href*="corporateCustomerList"]').click({ force: true });
  await app.waitForTimeout(2000);

  await app.locator('#addButton').waitFor({ state: 'visible', timeout: 15000 });
  await app.locator('#addButton').click();
  await app.locator('#memberFName').waitFor({ state: 'visible', timeout: 20000 });
  await app.waitForTimeout(1000);

  // Save page1 HTML BEFORE category selection
  fs.writeFileSync('scripts/corp-p1-before.html', await app.content());
  console.log('Saved corp-p1-before.html');

  // Select COMPANY category
  const catContainer = app.locator('#select2-customerCategory-container').first();
  if (await catContainer.isVisible({ timeout: 3000 }).catch(() => false)) {
    await catContainer.click({ force: true });
    await app.waitForTimeout(400);
    // pick COMPANY (503)
    const opts = await app.locator('.select2-results__option').all();
    for (const o of opts) {
      const t = await o.innerText().catch(() => '');
      if (t.includes('COMPANY')) { await o.click({ force: true }); break; }
    }
    await app.waitForTimeout(600);
  }

  // Save page1 HTML AFTER category selection
  fs.writeFileSync('scripts/corp-p1-after.html', await app.content());
  console.log('Saved corp-p1-after.html');

  // Try clicking Next without filling anything — to trigger validation errors
  const next = app.locator('#nextBtn, #btnNext, button:has-text("Next"), a:has-text("Next"), input[value="Next"]').first();
  await next.waitFor({ state: 'visible', timeout: 10000 });
  await next.click({ force: true });
  await app.waitForTimeout(1500);

  // Save page1 HTML AFTER failed next (shows validation errors)
  fs.writeFileSync('scripts/corp-p1-validation.html', await app.content());
  console.log('Saved corp-p1-validation.html');

  // Extract error/invalid elements
  const errors = await app.evaluate(() => {
    const els = [];
    // Common CBS validation: .error, .is-invalid, .field-error, [aria-invalid], border-red, etc.
    document.querySelectorAll('.error, .is-invalid, .field-error, [aria-invalid="true"], .has-error input, .has-error select').forEach(el => {
      els.push({ id: el.id, name: el.name, class: el.className, tag: el.tagName });
    });
    // Also check for error message spans/divs near inputs
    document.querySelectorAll('.error-msg, .help-block, .invalid-feedback, span.error').forEach(el => {
      if (el.textContent.trim()) els.push({ msg: el.textContent.trim(), class: el.className, tag: el.tagName });
    });
    return els;
  });
  console.log('\n=== VALIDATION ERRORS AFTER EMPTY NEXT ===');
  errors.forEach(e => console.log(JSON.stringify(e)));
  fs.writeFileSync('scripts/corp-validation-errors.json', JSON.stringify(errors, null, 2));

  await browser.close();
  console.log('\nDone.');
})().catch(e => { console.error(e); process.exit(1); });

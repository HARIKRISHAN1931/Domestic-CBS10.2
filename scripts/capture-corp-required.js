/**
 * Captures all required fields (has 'required' attr OR label has '*' OR parent has .required/.mandatory)
 * from all 3 pages of the CORPCUSTOMER form.
 * Run: node scripts/capture-corp-required.js
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.qa' });

const BASE   = process.env.BASE_URL;
const APP    = process.env.CBS_APP_PATH || '/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en';
const MAKER  = process.env.MAKER_USERNAME;
const PASS   = process.env.MAKER_PASSWORD;

async function getRequiredFields(page) {
  const result = await page.evaluate(() => {
    try {
      const results = [];
      document.querySelectorAll('input[required], select[required], textarea[required]').forEach(el => {
        results.push({ id: el.id, name: el.name, tag: el.tagName, type: el.type || '', method: 'required-attr' });
      });
      document.querySelectorAll('label').forEach(lbl => {
        if (lbl.textContent.includes('*')) {
          const forId = lbl.getAttribute('for');
          const el = forId ? document.getElementById(forId) : null;
          results.push({ id: forId || '', labelText: lbl.textContent.trim().replace(/\s+/g,' '), tag: el ? el.tagName : '', method: 'label-asterisk' });
        }
      });
      document.querySelectorAll('.required input, .required select, .mandatory input, .mandatory select').forEach(el => {
        results.push({ id: el.id, name: el.name, tag: el.tagName, method: 'required-class' });
      });
      const seen = new Set();
      return results.filter(r => { const k = r.id || r.labelText || String(Math.random()); if (seen.has(k)) return false; seen.add(k); return true; });
    } catch(e) { return [{ error: e.message }]; }
  }).catch(() => []);
  return result || [];
}

async function getAllVisible(page) {
  const result = await page.evaluate(() => {
    try {
      return Array.from(document.querySelectorAll('input:not([type=hidden]), select, textarea'))
        .filter(el => el.offsetParent !== null)
        .map(el => ({ id: el.id, name: el.name, tag: el.tagName, type: el.type||'', required: el.required, placeholder: el.placeholder||'' }));
    } catch(e) { return [{ error: e.message }]; }
  }).catch(() => []);
  return result || [];
}

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

  // Navigate to CORPCUSTOMER
  await app.locator('a.item-nav').first().click();
  await app.waitForTimeout(400);
  await app.locator('a[href*="corporateCustomerList"]').click({ force: true });
  await app.waitForTimeout(2000);

  // Open create form
  await app.locator('#addButton').waitFor({ state: 'visible', timeout: 15000 });
  await app.locator('#addButton').click();
  await app.locator('#memberFName').waitFor({ state: 'visible', timeout: 20000 });
  await app.waitForTimeout(1000);

  // Select customerCategory first (required to reveal form fields)
  const catContainer = app.locator('#select2-customerCategory-container').first();
  if (await catContainer.isVisible({ timeout: 3000 }).catch(() => false)) {
    await catContainer.click({ force: true });
    await app.waitForTimeout(300);
    const opts = await app.locator('.select2-results__option').all();
    if (opts.length > 0) { await opts[0].click({ force: true }); await app.waitForTimeout(500); }
  }

  const out = {};

  // Page 1 — also dump ALL visible inputs/selects for reference
  const p1required = await getRequiredFields(app);
  const p1all = await getAllVisible(app);
  out.page1 = { required: p1required, allVisible: p1all };
  console.log('\n=== PAGE 1 REQUIRED ===');
  out.page1.required.forEach(f => console.log(JSON.stringify(f)));
  console.log('\n=== PAGE 1 ALL VISIBLE ===');
  out.page1.allVisible.forEach(f => console.log(JSON.stringify(f)));

  // Click Next to Page 2
  const next = app.locator('#nextBtn, #btnNext, button:has-text("Next"), a:has-text("Next"), input[value="Next"]').first();
  await next.waitFor({ state: 'visible', timeout: 15000 });
  await next.click({ force: true });
  await app.waitForTimeout(2000);

  const p2required = await getRequiredFields(app);
  const p2all = await getAllVisible(app);
  out.page2 = { required: p2required, allVisible: p2all };
  console.log('\n=== PAGE 2 REQUIRED ===');
  out.page2.required.forEach(f => console.log(JSON.stringify(f)));
  console.log('\n=== PAGE 2 ALL VISIBLE ===');
  out.page2.allVisible.forEach(f => console.log(JSON.stringify(f)));

  // Click Next to Page 3
  await next.waitFor({ state: 'visible', timeout: 15000 });
  await next.click({ force: true });
  await app.waitForTimeout(2000);

  const p3required = await getRequiredFields(app);
  const p3all = await getAllVisible(app);
  out.page3 = { required: p3required, allVisible: p3all };
  console.log('\n=== PAGE 3 REQUIRED ===');
  out.page3.required.forEach(f => console.log(JSON.stringify(f)));
  console.log('\n=== PAGE 3 ALL VISIBLE ===');
  out.page3.allVisible.forEach(f => console.log(JSON.stringify(f)));

  fs.writeFileSync(path.resolve('scripts/corp-required-fields.json'), JSON.stringify(out, null, 2));
  console.log('\nSaved: scripts/corp-required-fields.json');

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

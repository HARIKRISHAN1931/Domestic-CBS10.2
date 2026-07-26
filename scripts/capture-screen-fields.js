const { chromium } = require('playwright');
const fs   = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.qa') });

const BASE_URL = process.env.BASE_URL;
const APP_PATH = process.env.CBS_APP_PATH;
const USERNAME = process.env.MAKER_USERNAME;
const PASSWORD = process.env.MAKER_PASSWORD;

const SCREENS = [
  { folder: 'TenantGroupMaster',         itemId: 'TENANTGROUPMST',          label: 'Tenant Group Master' },
  { folder: 'TenantMaster',              itemId: 'TENANTMST',               label: 'Tenant Master' },
  { folder: 'BranchManagement',          itemId: 'BRANCHMGMT',              label: 'Branch Management' },
  { folder: 'Subdivisionthana',          itemId: 'AREAMASTER',              label: 'Sub-Division/Thana' },
  { folder: 'BlockmunicipalMaster',      itemId: 'MUNICIPALITYBLOCKMASTER', label: 'Block/Municipal Master' },
  { folder: 'VillageMaster',             itemId: 'VILLAGEMASTER',           label: 'Village Master' },
  { folder: 'UrbanMaster',               itemId: 'URBANMASTER',             label: 'Urban Master' },
  { folder: 'BranchToBranchDataMapping', itemId: 'BRTOBRMAP',               label: 'Branch To Branch Data Mapping' },
  { folder: 'IfscMaster',                itemId: 'IFSCMST',                 label: 'IFSC Master' },
  { folder: 'CountryMaster',             itemId: 'COUNTRYMST',              label: 'Country Master' },
  { folder: 'StateMaster',               itemId: 'STATEMST',                label: 'State Master' },
  { folder: 'DistrictMaster',            itemId: 'DISTRICTMST',             label: 'District Master' },
];

const OUT_DIR = path.join(__dirname, '../captured-screens');
fs.mkdirSync(OUT_DIR, { recursive: true });

async function loginAndGetPage(browser) {
  const context  = await browser.newContext({ baseURL: BASE_URL });
  const loginPg  = await context.newPage();
  await loginPg.goto(`${BASE_URL}${APP_PATH}`);
  await loginPg.waitForLoadState('domcontentloaded');
  const relogin = loginPg.locator('#relogin');
  if (await relogin.isVisible({ timeout: 2000 }).catch(() => false)) await relogin.click();
  await loginPg.locator('#loginId').fill(USERNAME);
  await loginPg.locator('#loginId').press('Tab');
  await loginPg.locator('#uiPwd').fill(PASSWORD);
  const [appPage] = await Promise.all([
    context.waitForEvent('page'),
    loginPg.locator('#userLogin').click(),
  ]);
  await appPage.waitForLoadState('domcontentloaded');
  await appPage.locator('a.item-nav').first().waitFor({ state: 'visible', timeout: 30000 });
  return { context, page: appPage };
}

async function navigate(page, itemId) {
  await page.locator('a.item-nav').first().click();
  await page.waitForTimeout(400);
  const top = page.locator('li#Administration > a.dropnav');
  await top.waitFor({ state: 'visible', timeout: 10000 });
  if (!await top.evaluate(el => el.classList.contains('mn-open'))) await top.click();
  const sub = page.locator('li#setupAdm > a.s-dropnav');
  await sub.waitFor({ state: 'visible', timeout: 10000 });
  const subOpen = await page.locator('li#setupAdm > div.super-sub-nav').evaluate(el => el.classList.contains('ssn-open')).catch(() => false);
  if (!subOpen) await sub.click();
  const item = page.locator(`li#${itemId.replace(/([^\w-])/g, '\\$1')} > a`);
  await item.waitFor({ state: 'visible', timeout: 15000 });
  await item.click();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);
}

async function captureScreen(browser, screen) {
  console.log(`→ ${screen.label}`);
  const { context, page } = await loginAndGetPage(browser);
  try {
    await navigate(page, screen.itemId);

    // Click Add button
    const addBtn = page.locator('button.add, #addButton, a.button.add').first();
    const addOk  = await addBtn.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);
    if (!addOk) {
      await page.screenshot({ path: path.join(OUT_DIR, `${screen.folder}-no-add.png`), fullPage: true });
      console.log(`  ⚠ ${screen.folder}: Add button not visible`);
      fs.writeFileSync(path.join(OUT_DIR, `${screen.folder}.json`), JSON.stringify({ screen: screen.folder, label: screen.label, error: 'Add button not visible', fields: [] }, null, 2));
      return;
    }
    await addBtn.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, `${screen.folder}-form.png`), fullPage: true });

    // Capture fields using Playwright locator API
    const allInputs = page.locator('input:not([type=hidden]), select, textarea');
    const count = await allInputs.count();
    const fields = [];
    for (let i = 0; i < count; i++) {
      const el = allInputs.nth(i);
      const id          = await el.getAttribute('id').catch(() => '') || '';
      const name        = await el.getAttribute('name').catch(() => '') || '';
      if (!id && !name) continue;
      const tag         = await el.evaluate(e => e.tagName.toLowerCase()).catch(() => 'input');
      const type        = tag === 'select' ? 'select' : tag === 'textarea' ? 'textarea' : (await el.getAttribute('type').catch(() => 'text') || 'text');
      const placeholder = await el.getAttribute('placeholder').catch(() => '') || '';
      const disabled    = await el.isDisabled().catch(() => false);
      const maxlength   = await el.getAttribute('maxlength').catch(() => '') || '';
      const label       = await el.evaluate(e => {
        let lbl = e.id ? document.querySelector(`label[for="${e.id}"]`) : null;
        if (!lbl) {
          const p = e.closest('.form-group, .control-group, td, .field-wrap, .col-sm-6, .col-md-6');
          if (p) lbl = p.querySelector('label');
        }
        return lbl ? lbl.innerText.replace(/\*/g, '').trim() : '';
      }).catch(() => '');
      const options = tag === 'select'
        ? await el.evaluate(e => Array.from(e.options).map(o => ({ value: o.value, text: o.text.trim() })).filter(o => o.value && o.value !== '0')).catch(() => [])
        : [];
      fields.push({ id, name, type, placeholder, label, disabled, maxlength, options });
    }

    const result = { screen: screen.folder, label: screen.label, fields };
    fs.writeFileSync(path.join(OUT_DIR, `${screen.folder}.json`), JSON.stringify(result, null, 2));
    console.log(`  ✓ ${screen.folder}: ${fields.length} fields`);
  } catch (e) {
    console.error(`  ✗ ${screen.folder}: ${e.message}`);
    await page.screenshot({ path: path.join(OUT_DIR, `${screen.folder}-error.png`), fullPage: true }).catch(() => {});
    fs.writeFileSync(path.join(OUT_DIR, `${screen.folder}.json`), JSON.stringify({ screen: screen.folder, label: screen.label, error: e.message, fields: [] }, null, 2));
  } finally {
    await context.close().catch(() => {});
  }
}

async function main() {
  const browser = await chromium.launch({ headless: false });
  try {
    // Sequential — CBS server can't handle parallel logins
    for (const s of SCREENS) {
      await captureScreen(browser, s);
    }
    console.log('\n✅ Done. Results in:', OUT_DIR);
  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e); process.exit(1); });

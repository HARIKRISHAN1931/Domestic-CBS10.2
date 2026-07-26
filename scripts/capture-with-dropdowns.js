const { chromium } = require('playwright');
const fs   = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.qa') });

const BASE_URL = process.env.BASE_URL;
const APP_PATH = process.env.CBS_APP_PATH;
const USERNAME = process.env.MAKER_USERNAME;
const PASSWORD = process.env.MAKER_PASSWORD;

const OUT_DIR = path.join(__dirname, '../captured-screens');

async function loginAndGetPage(browser) {
  const context = await browser.newContext({ baseURL: BASE_URL });
  const loginPg = await context.newPage();
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
  const item = page.locator(`li#${itemId} > a`);
  await item.waitFor({ state: 'visible', timeout: 15000 });
  await item.click();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);
}

async function getFirstSelectOption(page, selectId) {
  const opts = await page.locator(`#${selectId} option`).all();
  for (const opt of opts) {
    const val = await opt.getAttribute('value').catch(() => '');
    const txt = await opt.innerText().catch(() => '');
    if (val && val !== '0' && val !== '') return { value: val, text: txt.trim() };
  }
  return null;
}

async function captureWithDropdowns(browser, screen) {
  console.log(`\n→ ${screen.label}`);
  const { context, page } = await loginAndGetPage(browser);
  try {
    await navigate(page, screen.itemId);

    const result = { screen: screen.folder, label: screen.label, preSelects: {}, fields: [] };

    // Pre-select required dropdowns
    for (const dropId of (screen.preDropdowns || [])) {
      const opt = await getFirstSelectOption(page, dropId);
      if (opt) {
        await page.locator(`#${dropId}`).selectOption(opt.value);
        result.preSelects[dropId] = opt.text;
        console.log(`  Selected #${dropId} = "${opt.text}"`);
        await page.waitForTimeout(1000);
      } else {
        console.log(`  ⚠ No options in #${dropId}`);
      }
    }

    // Click Add
    const addBtn = page.locator('#addButton');
    await addBtn.waitFor({ state: 'visible', timeout: 15000 });
    await addBtn.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, `${screen.folder}-form2.png`), fullPage: true });

    // Capture form fields
    const allInputs = page.locator('input:not([type=hidden]), select, textarea');
    const count = await allInputs.count();
    const SKIP = new Set(['menuSearchBox','lockloginId','lockpwd','searchBox','level1','level2','qmenul1l2',
                          'okButtonforShowDiffPopUp','createdBy123','createdDate','createdTime',
                          'lastmodifBy','lastmodifDate','lastmodifTime','status','rev','rejectedReson',
                          'branchCode','branchName']);
    for (let i = 0; i < count; i++) {
      const el = allInputs.nth(i);
      const id = await el.getAttribute('id').catch(() => '') || '';
      if (!id || SKIP.has(id)) continue;
      const tag      = await el.evaluate(e => e.tagName.toLowerCase()).catch(() => 'input');
      const type     = tag === 'select' ? 'select' : tag === 'textarea' ? 'textarea' : (await el.getAttribute('type').catch(() => 'text') || 'text');
      const disabled = await el.isDisabled().catch(() => false);
      const readonly = await el.getAttribute('readonly').catch(() => null);
      const ph       = await el.getAttribute('placeholder').catch(() => '') || '';
      const label    = await el.evaluate(e => {
        let lbl = e.id ? document.querySelector(`label[for="${e.id}"]`) : null;
        if (!lbl) { const p = e.closest('.form-group,.control-group,td,.field-wrap,.col-sm-6,.col-md-6'); if (p) lbl = p.querySelector('label'); }
        return lbl ? lbl.innerText.replace(/\*/g,'').trim() : '';
      }).catch(() => '');
      result.fields.push({ id, type, disabled, readonly: readonly !== null, placeholder: ph, label });
    }

    // Also capture save button selector
    const saveSelectors = ['a.button.sm.btn-save','#btnSave','button#saveCustomer','a.btn-save','button.btn-save','.btn-save'];
    for (const sel of saveSelectors) {
      const visible = await page.locator(sel).first().isVisible().catch(() => false);
      if (visible) { result.saveSelector = sel; console.log(`  Save button: ${sel}`); break; }
    }

    fs.writeFileSync(path.join(OUT_DIR, `${screen.folder}-v2.json`), JSON.stringify(result, null, 2));
    console.log(`  ✓ ${screen.folder}: ${result.fields.length} fields, preSelects: ${JSON.stringify(result.preSelects)}`);
  } catch (e) {
    console.error(`  ✗ ${screen.folder}: ${e.message}`);
    await page.screenshot({ path: path.join(OUT_DIR, `${screen.folder}-error2.png`), fullPage: true }).catch(() => {});
  } finally {
    await context.close().catch(() => {});
  }
}

const SCREENS = [
  { folder: 'Subdivisionthana',       itemId: 'AREAMASTER',              label: 'Sub-Division/Thana',     preDropdowns: ['country','state','cityCd'] },
  { folder: 'BlockmunicipalMaster',   itemId: 'MUNICIPALITYBLOCKMASTER', label: 'Block/Municipal Master', preDropdowns: ['country','state','city'] },
  { folder: 'VillageMaster',          itemId: 'VILLAGEMASTER',           label: 'Village Master',         preDropdowns: ['country','state','city','area'] },
  { folder: 'UrbanMaster',            itemId: 'URBANMASTER',             label: 'Urban Master',           preDropdowns: ['country','state','city','area','municipalityBlock'] },
  { folder: 'IfscMaster',             itemId: 'IFSCMST',                 label: 'IFSC Master',            preDropdowns: [] },
  { folder: 'BranchToBranchDataMapping', itemId: 'BRTOBRMAP',            label: 'Branch To Branch Data Mapping', preDropdowns: [] },
  // Debug save button for these
  { folder: 'TenantMaster',           itemId: 'TENANTMST',               label: 'Tenant Master',          preDropdowns: [] },
  { folder: 'CountryMaster',          itemId: 'COUNTRYMST',              label: 'Country Master',         preDropdowns: [] },
  { folder: 'StateMaster',            itemId: 'STATEMST',                label: 'State Master',           preDropdowns: [] },
  { folder: 'DistrictMaster',         itemId: 'DISTRICTMST',             label: 'District Master',        preDropdowns: ['countryCode','stateCode'] },
  { folder: 'BranchManagement',       itemId: 'BRANCHMGMT',              label: 'Branch Management',      preDropdowns: [] },
  { folder: 'TenantGroupMaster',      itemId: 'TENANTGROUPMST',          label: 'Tenant Group Master',    preDropdowns: [] },
];

async function main() {
  const browser = await chromium.launch({ headless: false });
  try {
    for (const s of SCREENS) {
      await captureWithDropdowns(browser, s);
    }
    console.log('\n✅ Done.');
  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e); process.exit(1); });

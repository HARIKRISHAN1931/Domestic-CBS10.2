/**
 * capture-customer-creation-fields.js
 *
 * Login → Navigate to CUSTOMER → Open CREATE → Capture all 4 tabs
 *
 * Output:
 *   captured-screens/CustomerCreation-fields.json
 *   captured-screens/CustomerCreation-tab1.png  (+ tab2, tab3, tab4)
 *
 * Run: node scripts/capture-customer-creation-fields.js
 */

const { chromium } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.qa') });

const BASE_URL = process.env.BASE_URL       || 'http://172.21.0.39:7999';
const APP_PATH = process.env.CBS_APP_PATH   || '/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en';
const USERNAME = process.env.MAKER_USERNAME || 'demo1';
const PASSWORD = process.env.MAKER_PASSWORD || 'Abcd@1243';
const OUT_DIR  = path.resolve(__dirname, '../captured-screens');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ─── helpers ─────────────────────────────────────────────────────────────────

function newestPage(context) {
  const pages = context.pages().filter(p => !p.isClosed());
  return pages[pages.length - 1];
}

/** Find the frame that actually contains CBS form fields */
function getFormFrame(page) {
  // Search all frames (not just direct children) for one that has form inputs
  const frames = page.frames();
  // Prefer a non-main frame with a real URL
  const content = frames.find(f => f !== page.mainFrame() && f.url() && f.url() !== 'about:blank');
  return content || page.mainFrame();
}

/** Frame-aware locator */
function L(page, sel) {
  return getFormFrame(page).locator(sel);
}

async function waitAjax(page) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.evaluate(() => new Promise(res => {
    let n = 0;
    const t = () => { if (window.jQuery && window.jQuery.active > 0 && n++ < 80) setTimeout(t, 100); else res(); };
    t();
  })).catch(() => {});
}

/**
 * Click a button; if CBS opens a new browser tab, return that new page.
 * Otherwise return the same page after waiting for load.
 */
async function clickMaybeNewTab(context, page, clickFn) {
  const before = context.pages().filter(p => !p.isClosed()).length;
  await clickFn();
  await page.waitForTimeout(1500);
  const after = context.pages().filter(p => !p.isClosed()).length;
  if (after > before) {
    const np = newestPage(context);
    await np.waitForLoadState('domcontentloaded').catch(() => {});
    await waitAjax(np);
    return np;
  }
  await waitAjax(page);
  return page;
}

// ─── DOM field capture (runs inside browser as a real function) ───────────────

function domCapture() {
  var seen = {};
  var fields = [];

  function cleanLabel(t) { return t.replace(/\s*\*\s*$/, '').trim(); }

  function findLabel(el) {
    if (el.id) {
      var lbl = document.querySelector('label[for="' + el.id + '"]');
      if (lbl) return cleanLabel(lbl.innerText);
    }
    var node = el.parentElement;
    for (var i = 0; i < 6 && node; i++) {
      var lbl2 = node.querySelector('label');
      if (lbl2 && lbl2.innerText.trim()) return cleanLabel(lbl2.innerText);
      node = node.parentElement;
    }
    return '';
  }

  function isMandatory(el) {
    if (el.required) return true;
    if (el.getAttribute('aria-required') === 'true') return true;
    if (el.id) {
      var lbl = document.querySelector('label[for="' + el.id + '"]');
      if (lbl && lbl.innerText.indexOf('*') !== -1) return true;
    }
    var p = el.parentElement;
    for (var i = 0; i < 7 && p; i++) {
      var cls = p.className || '';
      if (cls.indexOf('mandatory') !== -1 || cls.indexOf('required') !== -1) return true;
      if (p.querySelector('span.mandatory-star, span.req-star, .text-danger')) return true;
      p = p.parentElement;
    }
    return false;
  }

  function isVis(el) {
    var s = window.getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  var els = document.querySelectorAll('input, select, textarea');
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    var id = el.id || el.name || '';
    if (!id || seen[id]) continue;
    var itype = (el.getAttribute('type') || '').toLowerCase();
    if (itype === 'hidden' || itype === 'submit' || itype === 'button' || itype === 'radio') continue;
    seen[id] = true;

    var tag  = el.tagName.toLowerCase();
    var type = tag === 'select'   ? 'select'
             : tag === 'textarea' ? 'textarea'
             : itype === 'date'     ? 'date'
             : itype === 'checkbox' ? 'checkbox'
             : 'text';

    if (type === 'text') {
      var idl = id.toLowerCase();
      var cls = (el.className || '').toLowerCase();
      if (idl.indexOf('date') !== -1 || cls.indexOf('datepicker') !== -1 || cls.indexOf('date-pick') !== -1)
        type = 'date';
    }

    var opts = [];
    if (tag === 'select') {
      for (var j = 0; j < el.options.length; j++)
        opts.push({ value: el.options[j].value, label: el.options[j].text.trim() });
    }

    fields.push({
      id:           id,
      label:        findLabel(el) || id,
      type:         type,
      mandatory:    isMandatory(el),
      disabled:     el.disabled,
      readonly:     el.hasAttribute('readonly'),
      visible:      isVis(el),
      currentValue: el.value || '',
      maxLength:    el.maxLength > 0 ? el.maxLength : null,
      placeholder:  el.placeholder || null,
      options:      opts,
    });
  }

  var radioGroups = {};
  var radios = document.querySelectorAll('input[type="radio"]');
  for (var i = 0; i < radios.length; i++) {
    var r   = radios[i];
    var key = r.name || r.id;
    if (!key) continue;
    if (!radioGroups[key])
      radioGroups[key] = { groupName: key, mandatory: isMandatory(r), visible: isVis(r), options: [], selected: null };
    var rl = document.querySelector('label[for="' + r.id + '"]');
    radioGroups[key].options.push({ id: r.id, value: r.value, label: rl ? rl.innerText.trim() : r.value, checked: r.checked });
    if (r.checked) radioGroups[key].selected = r.id;
  }

  var checkboxes = [];
  var cbs = document.querySelectorAll('input[type="checkbox"]');
  for (var i = 0; i < cbs.length; i++) {
    var cb  = cbs[i];
    var cid = cb.id || cb.name || '';
    if (!cid || seen[cid]) continue;
    seen[cid] = true;
    var cl = document.querySelector('label[for="' + cid + '"]');
    checkboxes.push({ id: cid, label: cl ? cleanLabel(cl.innerText) : cid, checked: cb.checked, disabled: cb.disabled, visible: isVis(cb) });
  }

  return { fields: fields, radioGroups: radioGroups, checkboxes: checkboxes };
}

async function captureTab(page, tabLabel) {
  // Search every frame in the page — CBS may nest the form inside an iframe
  const allFrames = page.frames();
  console.log(`    [frames] ${allFrames.length} total`);
  allFrames.forEach((f, i) => console.log(`      [${i}] ${f.url()}`));

  let raw = null;
  let src = '';

  for (const f of allFrames) {
    // Pass domCapture as a real function reference — no string escaping issues
    const r = await f.evaluate(domCapture).catch(e => { console.log(`      [frame ${f.url()}] eval error: ${e.message}`); return null; });
    if (r && Array.isArray(r.fields) && r.fields.length > 0) {
      raw = r;
      src = f.url() || ('frame-' + allFrames.indexOf(f));
      break;
    }
  }

  if (!raw) {
    console.error(`    [captureTab] no fields found in any of ${allFrames.length} frames`);
    return { tab: tabLabel, fields: [], radioGroups: {}, checkboxes: [] };
  }

  console.log(`    [captureTab] ${raw.fields.length} fields captured from: ${src}`);
  return { tab: tabLabel, fields: raw.fields, radioGroups: raw.radioGroups, checkboxes: raw.checkboxes };
}

// ─── clickNext: handles same-page or new-tab ──────────────────────────────────

async function clickNext(page, context) {
  const btn = L(page, '#nextBtn');
  await btn.waitFor({ state: 'visible', timeout: 10_000 });
  return clickMaybeNewTab(context, page, () => btn.click());
}

// ─── main ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(' CBS Customer Creation — Field Capture');
  console.log('═══════════════════════════════════════════════════════════════');

  const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
  const context = await browser.newContext({ viewport: null });
  let page = await context.newPage();

  const result = { capturedAt: new Date().toISOString(), screen: 'CustomerCreation_Retail', tabs: [] };

  try {
    // ── 1. Login ────────────────────────────────────────────────────────
    console.log('\n[1] Logging in...');
    await page.goto(`${BASE_URL}${APP_PATH}`);
    await page.waitForLoadState('domcontentloaded');

    const relogin = page.locator('#relogin');
    if (await relogin.isVisible({ timeout: 3000 }).catch(() => false)) {
      await relogin.click();
      await page.waitForLoadState('domcontentloaded');
    }

    await page.locator('#loginId').waitFor({ state: 'visible', timeout: 15_000 });
    await page.locator('#loginId').fill(USERNAME);
    await page.locator('#loginId').press('Tab');
    await page.locator('#uiPwd').fill(PASSWORD);

    // Login always opens a new tab in CBS
    const [appPage] = await Promise.all([
      context.waitForEvent('page', { timeout: 20_000 }),
      page.locator('#userLogin').click(),
    ]);
    await appPage.waitForLoadState('domcontentloaded');
    await waitAjax(appPage);
    page = appPage;
    console.log('    ✅ Logged in →', page.url());
    await page.screenshot({ path: path.join(OUT_DIR, 'CC-00-home.png') });

    // ── 2. Navigate to Customer Creation ────────────────────────────────
    console.log('\n[2] Navigating Masters → Customer Management → CUSTOMER...');

    const hamburger = page.locator('a.item-nav').first();
    await hamburger.waitFor({ state: 'visible', timeout: 10_000 });
    await hamburger.click();
    await page.waitForTimeout(400);

    const mastersToggle = page.locator('li#Masters > a.dropnav');
    await mastersToggle.waitFor({ state: 'visible', timeout: 10_000 });
    const mastersOpen = await mastersToggle.evaluate(el => el.classList.contains('mn-open'));
    if (!mastersOpen) await mastersToggle.click();
    await page.waitForTimeout(400);

    const custMgmtToggle = page.locator('li#customermgmt > a.s-dropnav');
    await custMgmtToggle.waitFor({ state: 'visible', timeout: 10_000 });
    const custMgmtPanel = page.locator('li#customermgmt > div.super-sub-nav');
    const custMgmtOpen  = await custMgmtPanel.evaluate(el => el.classList.contains('ssn-open')).catch(() => false);
    if (!custMgmtOpen) await custMgmtToggle.click();
    await page.waitForTimeout(400);

    const custItem = page.locator('li#CUSTOMER > a');
    await custItem.waitFor({ state: 'visible', timeout: 10_000 });
    page = await clickMaybeNewTab(context, page, () => custItem.click());
    console.log('    ✅ Customer Creation grid →', page.url());
    await page.screenshot({ path: path.join(OUT_DIR, 'CC-01-grid.png'), fullPage: true });

    // ── 3. Open CREATE form ──────────────────────────────────────────────
    console.log('\n[3] Opening CREATE form...');

    const createBtn = L(page, '#createButton, #addButton, button.add-btn, a.add-btn').first();
    await createBtn.waitFor({ state: 'attached', timeout: 15_000 });
    page = await clickMaybeNewTab(context, page, () => createBtn.click({ force: true }));
    console.log('    ✅ Create form page →', page.url());

    // Wait for Tab 1 to be ready — try both frame and main page
    await page.waitForTimeout(1000);
    const tab1Anchor = L(page, '#customerCategory');
    await tab1Anchor.waitFor({ state: 'visible', timeout: 30_000 });
    console.log('    ✅ Tab 1 ready');
    await page.screenshot({ path: path.join(OUT_DIR, 'CC-tab1-blank.png'), fullPage: true });

    // ── 4. Tab 1: Basic Details (blank) ─────────────────────────────────
    console.log('\n[4] Capturing Tab 1 — Basic Details (blank)...');
    const tab1Blank = await captureTab(page, 'Tab1_BasicDetails_Blank');
    result.tabs.push(tab1Blank);
    printSummary(tab1Blank);

    // Select category=1 to reveal dependent fields, then re-capture
    console.log('    Selecting customerCategory=1...');
    const root1 = getFormFrame(page);
    await root1.locator('#customerCategory').selectOption('1').catch(() => {});
    await waitAjax(page);
    await page.waitForTimeout(600);

    const tab1After = await captureTab(page, 'Tab1_BasicDetails_AfterCategory');
    result.tabs.push(tab1After);
    console.log('    (re-captured after category select)');

    // Fill minimum mandatory fields to unlock Tab 2
    await root1.locator('#memberFName').fill('TESTFIRST').catch(() => {});
    await root1.locator('#memberLName').fill('TESTLAST').catch(() => {});
    await root1.locator('#memberDOB').fill('01-01-1990').catch(() => {});
    await root1.locator('#memberDOB').press('Tab');
    await waitAjax(page);
    await page.screenshot({ path: path.join(OUT_DIR, 'CC-tab1-filled.png'), fullPage: true });

    // ── 5. Tab 2: Contact Details ────────────────────────────────────────
    console.log('\n[5] Navigating to Tab 2 — Contact Details...');
    page = await clickNext(page, context);

    const expandAddr = L(page, '#btnExpanBusinComm').first();
    if (await expandAddr.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expandAddr.click();
      await waitAjax(page);
    }
    await page.waitForSelector('#address1, #addressType', { state: 'visible', timeout: 12_000 }).catch(() => {});
    console.log('    ✅ Tab 2 ready →', page.url());
    await page.screenshot({ path: path.join(OUT_DIR, 'CC-tab2.png'), fullPage: true });

    const tab2 = await captureTab(page, 'Tab2_ContactDetails');
    result.tabs.push(tab2);
    printSummary(tab2);

    const root2 = getFormFrame(page);
    await root2.locator('#address1').fill('123 Test Street').catch(() => {});
    await root2.locator('#mobileNo1').fill('9999999999').catch(() => {});

    // ── 6. Tab 3: Additional Details ─────────────────────────────────────
    console.log('\n[6] Navigating to Tab 3 — Additional Details...');
    page = await clickNext(page, context);
    await page.waitForTimeout(1000);
    console.log('    ✅ Tab 3 ready →', page.url());
    await page.screenshot({ path: path.join(OUT_DIR, 'CC-tab3.png'), fullPage: true });

    const tab3 = await captureTab(page, 'Tab3_AdditionalDetails');
    result.tabs.push(tab3);
    printSummary(tab3);

    // ── 7. Tab 4: Document Details ───────────────────────────────────────
    console.log('\n[7] Navigating to Tab 4 — Document Details...');
    page = await clickNext(page, context);
    await page.waitForTimeout(1000);
    console.log('    ✅ Tab 4 ready →', page.url());
    await page.screenshot({ path: path.join(OUT_DIR, 'CC-tab4.png'), fullPage: true });

    const tab4 = await captureTab(page, 'Tab4_DocumentDetails');
    result.tabs.push(tab4);
    printSummary(tab4);

    // ── Save & Report ────────────────────────────────────────────────────
    const outFile = path.join(OUT_DIR, 'CustomerCreation-fields.json');
    fs.writeFileSync(outFile, JSON.stringify(result, null, 2));

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(' ✅  CAPTURE COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(' JSON →', outFile);
    printFullReport(result);

  } catch (err) {
    console.error('\n❌ FAILED:', err.message);
    console.error(err.stack);
    await page.screenshot({ path: path.join(OUT_DIR, 'CC-ERROR.png'), fullPage: true }).catch(() => {});
    fs.writeFileSync(
      path.join(OUT_DIR, 'CustomerCreation-fields.json'),
      JSON.stringify({ error: err.message, partial: result }, null, 2)
    );
  } finally {
    await browser.close();
  }
})();

// ─── report helpers ───────────────────────────────────────────────────────────

function printSummary(tab) {
  const vis  = tab.fields.filter(f => f.visible);
  const mand = vis.filter(f => f.mandatory);
  const dis  = vis.filter(f => f.disabled);
  const sel  = vis.filter(f => f.type === 'select');
  const date = vis.filter(f => f.type === 'date');
  const rg   = Object.keys(tab.radioGroups || {}).length;
  const cb   = (tab.checkboxes || []).filter(c => c.visible).length;
  console.log(`    ▸ ${vis.length} visible | ${mand.length} mandatory | ${dis.length} disabled | ${sel.length} dropdowns | ${date.length} dates | ${rg} radio groups | ${cb} checkboxes`);
}

function printFullReport(result) {
  const MAIN = ['Tab1_BasicDetails_Blank', 'Tab2_ContactDetails', 'Tab3_AdditionalDetails', 'Tab4_DocumentDetails'];

  for (const name of MAIN) {
    const tab = result.tabs.find(t => t.tab === name);
    if (!tab) continue;

    const vis  = tab.fields.filter(f => f.visible);
    const mand = vis.filter(f => f.mandatory);
    const dis  = vis.filter(f => f.disabled);

    console.log('\n' + '═'.repeat(68));
    console.log(' 📑  ' + tab.tab);
    console.log('─'.repeat(68));
    console.log(` Visible: ${vis.length}  Mandatory: ${mand.length}  Disabled: ${dis.length}`);

    if (mand.length) {
      console.log('\n  ✱ MANDATORY:');
      mand.forEach(f => {
        const opts = f.type === 'select' ? ` [${(f.options||[]).length} opts]` : '';
        console.log(`    #${pad(f.id,28)} ${pad(f.type,10)} "${f.label}"${opts}`);
      });
    }

    console.log('\n  ALL VISIBLE FIELDS:');
    vis.forEach(f => {
      const flags = [
        f.mandatory ? '★MAND'    : '',
        f.disabled  ? '⊘DIS'    : '',
        f.readonly  ? '⊘RO'     : '',
        f.type === 'select' ? ('▼' + (f.options||[]).length + 'opts') : '',
        f.type === 'date'   ? '📅' : '',
      ].filter(Boolean).join(' ');
      console.log(`    #${pad(f.id,28)} ${pad(f.type,10)} "${f.label}" ${flags}`);
    });

    const rgs = Object.values(tab.radioGroups || {}).filter(g => g.visible);
    if (rgs.length) {
      console.log('\n  RADIO GROUPS:');
      rgs.forEach(g => {
        const opts = g.options.map(o => `${o.id}="${o.label}"`).join(' | ');
        console.log(`    ${pad(g.groupName,28)} [${opts}]${g.mandatory ? ' ★MAND' : ''}`);
      });
    }

    const selects = vis.filter(f => f.type === 'select' && (f.options||[]).length > 1);
    if (selects.length) {
      console.log('\n  DROPDOWN OPTIONS:');
      selects.forEach(f => {
        console.log(`    #${f.id} "${f.label}":`);
        (f.options || []).forEach(o => {
          if (o.value) console.log(`      ${pad(String(o.value),6)} → ${o.label}`);
        });
      });
    }
  }

  // Show fields that changed state after category selection on Tab 1
  const blank  = result.tabs.find(t => t.tab === 'Tab1_BasicDetails_Blank');
  const filled = result.tabs.find(t => t.tab === 'Tab1_BasicDetails_AfterCategory');
  if (blank && filled) {
    console.log('\n' + '═'.repeat(68));
    console.log(' 🔄  TAB 1 STATE CHANGES AFTER customerCategory SELECTION');
    console.log('─'.repeat(68));
    let any = false;
    for (const after of filled.fields) {
      const before = blank.fields.find(f => f.id === after.id);
      if (!before) { console.log(`  + NEW     #${after.id} "${after.label}"`); any = true; continue; }
      if (before.disabled !== after.disabled) {
        console.log(`  ~ #${pad(after.id,28)} disabled: ${before.disabled} → ${after.disabled}`);
        any = true;
      }
      if (before.visible !== after.visible) {
        console.log(`  ~ #${pad(after.id,28)} visible:  ${before.visible} → ${after.visible}`);
        any = true;
      }
    }
    if (!any) console.log('  (no state changes detected)');
  }
}

function pad(s, n) { return String(s).padEnd(n); }

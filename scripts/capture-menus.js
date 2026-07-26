'use strict';

// ── Load env FIRST — before any other require ─────────────────────────────────
const path   = require('path');
const dotenv = require('dotenv');
const envFile = path.resolve(__dirname, '..', `.env.${(process.env.ENV || 'uat').trim()}`);
dotenv.config({ path: envFile, override: true });

// Verify immediately after load
if (!process.env['BASE_URL']) {
  // dotenv failed — read file manually
  const lines = require('fs').readFileSync(envFile, 'utf8').split('\n');
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

const { chromium } = require('@playwright/test');
const fs           = require('fs');

const BASE_URL = process.env['BASE_URL']      || '';
const APP_PATH = process.env['CBS_APP_PATH']  || '';
const USERNAME = process.env['AUTH_USERNAME'] || '';
const PASSWORD = process.env['AUTH_PASSWORD'] || '';
const FULL_URL = BASE_URL + APP_PATH;

console.log(`\n🔧  ENV file  : ${envFile}`);
console.log(`🌐  BASE_URL  : [${BASE_URL}]`);
console.log(`🌐  APP_PATH  : [${APP_PATH}]`);
console.log(`🌐  FULL_URL  : [${FULL_URL}]`);
console.log(`👤  Username  : [${USERNAME}]\n`);

// ── Helpers ───────────────────────────────────────────────────────────────────
async function waitForAjax(page) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.evaluate(() => new Promise(resolve => {
    const check = () => (window.jQuery && window.jQuery.active > 0)
      ? setTimeout(check, 200) : resolve();
    check();
  })).catch(() => {});
  await page.waitForTimeout(300);
}

// ── Login ─────────────────────────────────────────────────────────────────────
async function login(browser) {
  const context = await browser.newContext({ viewport: null, ignoreHTTPSErrors: true });
  const page    = await context.newPage();

  console.log('[1/4] Navigating to login page...');
  await page.goto(FULL_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(2000);

  // Screenshot for debug
  await page.screenshot({ path: path.join(__dirname, 'debug-login.png') });
  console.log('[1/4] Screenshot saved: scripts/debug-login.png');

  // Handle re-login if already logged in
  const relogin = page.locator('#relogin');
  if (await relogin.isVisible({ timeout: 3_000 }).catch(() => false)) {
    console.log('[1/4] Re-login prompt detected, clicking...');
    await relogin.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  }

  // Fill login ID
  console.log('[2/4] Filling credentials...');
  await page.locator('#loginId').waitFor({ state: 'visible', timeout: 20_000 });
  await page.locator('#loginId').fill(USERNAME);
  await page.locator('#loginId').press('Tab');
  await page.waitForTimeout(500);

  // Fill password
  await page.locator('#uiPwd').fill(PASSWORD);
  await page.waitForTimeout(300);

  // CBS opens a NEW TAB on login click
  console.log('[3/4] Clicking login, waiting for new tab...');
  let appPage;
  try {
    const [newPage] = await Promise.all([
      context.waitForEvent('page', { timeout: 30_000 }),
      page.locator('#userLogin').click(),
    ]);
    appPage = newPage;
    await appPage.waitForLoadState('domcontentloaded', { timeout: 30_000 });
    console.log('[3/4] New tab opened:', appPage.url());
  } catch (e) {
    // Fallback: login may stay on same page
    console.log('[3/4] No new tab — checking same page...');
    appPage = page;
    await page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
  }

  await appPage.waitForTimeout(2000);
  await appPage.screenshot({ path: path.join(__dirname, 'debug-after-login.png') });
  console.log('[3/4] Screenshot saved: scripts/debug-after-login.png');

  // Wait for hamburger menu (confirms successful login)
  console.log('[4/4] Waiting for hamburger menu...');
  await appPage.locator('a.item-nav').first().waitFor({ state: 'visible', timeout: 40_000 });

  await appPage.evaluate(() => {
    try { window.moveTo(0, 0); window.resizeTo(screen.width, screen.height); } catch(e) {}
  }).catch(() => {});

  console.log('✅  Logged in successfully\n');
  return appPage;
}

// ── Menu Crawler ──────────────────────────────────────────────────────────────
async function captureMenus(page) {
  const structure = [];

  // Open sidebar hamburger
  console.log('📂  Opening sidebar...');
  await page.locator('a.item-nav').first().click();
  await page.waitForTimeout(2000);
  await waitForAjax(page);

  // Screenshot of open sidebar
  await page.screenshot({ path: path.join(__dirname, 'debug-sidebar.png') });
  console.log('📂  Sidebar screenshot: scripts/debug-sidebar.png\n');

  // Get all top-level sections
  const topEls = await page.locator('li:has(> a.dropnav)').all();
  console.log(`Found ${topEls.length} top-level sections\n`);

  for (let ti = 0; ti < topEls.length; ti++) {
    const topEl    = topEls[ti];
    const topId    = (await topEl.getAttribute('id').catch(() => '')) ?? '';
    const topLabel = ((await topEl.locator('> a.dropnav').innerText().catch(() => '')) ?? '')
      .trim().replace(/\s+/g, ' ');

    if (!topId || !topLabel) continue;
    console.log(`▶  [${ti + 1}/${topEls.length}] "${topLabel}" (id: ${topId})`);

    const topSection = { id: topId, label: topLabel, subSections: [] };

    // Expand top section
    const topToggle = topEl.locator('> a.dropnav');
    const isOpen = await topToggle.evaluate(el => el.classList.contains('mn-open')).catch(() => false);
    if (!isOpen) {
      await topToggle.click();
      await page.waitForTimeout(800);
      await waitForAjax(page);
    }

    // Get sub-sections
    const subEls = await topEl.locator('li:has(> a.s-dropnav)').all();

    for (const subEl of subEls) {
      const subId    = (await subEl.getAttribute('id').catch(() => '')) ?? '';
      const subLabel = ((await subEl.locator('> a.s-dropnav').innerText().catch(() => '')) ?? '')
        .trim().replace(/\s+/g, ' ');
      if (!subId || !subLabel) continue;

      console.log(`   ├─ "${subLabel}" (id: ${subId})`);
      const subSection = { id: subId, label: subLabel, items: [] };

      // Expand sub-section
      const subToggle = subEl.locator('> a.s-dropnav');
      const subPanel  = subEl.locator('> div.super-sub-nav');
      const subOpen   = await subPanel.evaluate(el => el.classList.contains('ssn-open')).catch(() => false);
      if (!subOpen) {
        await subToggle.click();
        await page.waitForTimeout(500);
      }

      // Get menu items
      const itemEls = await subEl.locator('li:not(:has(a.s-dropnav)):has(> a)').all();
      for (const itemEl of itemEls) {
        const itemId    = (await itemEl.getAttribute('id').catch(() => '')) ?? '';
        const itemLabel = ((await itemEl.locator('> a').innerText().catch(() => '')) ?? '')
          .trim().replace(/\s+/g, ' ');
        if (!itemId || !itemLabel) continue;
        console.log(`   │   └─ "${itemLabel}" (id: ${itemId})`);
        subSection.items.push({ id: itemId, label: itemLabel });
      }

      if (subSection.items.length > 0) topSection.subSections.push(subSection);
    }

    // Collapse top section
    const stillOpen = await topToggle.evaluate(el => el.classList.contains('mn-open')).catch(() => false);
    if (stillOpen) {
      await topToggle.click();
      await page.waitForTimeout(400);
    }

    if (topSection.subSections.length > 0) structure.push(topSection);
    console.log('');
  }

  return structure;
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized', '--disable-web-security'],
  });

  try {
    const page      = await login(browser);
    const structure = await captureMenus(page);

    if (structure.length === 0) {
      console.error('❌  No menu items captured. Check debug screenshots in scripts/');
      process.exit(1);
    }

    const outPath = path.join(__dirname, 'menu-structure.json');
    fs.writeFileSync(outPath, JSON.stringify(structure, null, 2), 'utf-8');

    const totalSubs  = structure.reduce((a, t) => a + t.subSections.length, 0);
    const totalItems = structure.reduce((a, t) =>
      a + t.subSections.reduce((b, s) => b + s.items.length, 0), 0);

    console.log('═'.repeat(50));
    console.log(`✅  Menu capture complete`);
    console.log(`   Top sections  : ${structure.length}`);
    console.log(`   Sub sections  : ${totalSubs}`);
    console.log(`   Menu items    : ${totalItems}`);
    console.log(`   Saved to      : ${outPath}`);
    console.log('═'.repeat(50));

  } catch (err) {
    console.error('\n❌  Fatal error:', err.message);
    await browser.close();
    process.exit(1);
  } finally {
    await browser.close().catch(() => {});
  }
})();

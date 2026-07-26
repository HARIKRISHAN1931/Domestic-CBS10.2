/**
 * scripts/capture-menus.ts
 *
 * Logs into CBS, opens the sidebar, and crawls every
 * top-section → sub-section → menu-item (3 levels).
 * Writes the result to scripts/menu-structure.json
 *
 * Run:
 *   ENV=uat npx ts-node scripts/capture-menus.ts
 *   -- or --
 *   ENV=uat npx playwright test scripts/capture-menus.ts --headed
 */

import { chromium, Browser, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// ── Load env ──────────────────────────────────────────────────────────────────
const env = process.env.ENV ?? 'uat';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });

const BASE_URL  = process.env.BASE_URL  ?? 'http://localhost:8080';
const APP_PATH  = process.env.CBS_APP_PATH ?? '/Kiya.aiCBS-10.2.0/';
const USERNAME  = process.env.AUTH_USERNAME ?? '';
const PASSWORD  = process.env.AUTH_PASSWORD ?? '';

// ── Types ─────────────────────────────────────────────────────────────────────
interface MenuItem {
  id:    string;
  label: string;
}

interface SubSection {
  id:       string;
  label:    string;
  items:    MenuItem[];
}

interface TopSection {
  id:          string;
  label:       string;
  subSections: SubSection[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
async function waitForAjax(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await page.evaluate(() => new Promise<void>(resolve => {
    // @ts-ignore
    const check = () => (window.jQuery?.active > 0) ? setTimeout(check, 150) : resolve();
    check();
  })).catch(() => {});
}

async function login(browser: Browser): Promise<Page> {
  const context = await browser.newContext({ baseURL: BASE_URL, viewport: null });
  const loginPage = await context.newPage();

  console.log(`[LOGIN] Navigating to ${BASE_URL}${APP_PATH}`);
  await loginPage.goto(APP_PATH);
  await loginPage.waitForLoadState('domcontentloaded');

  // Handle re-login prompt if session exists
  const reloginBtn = loginPage.locator('#relogin');
  if (await reloginBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await reloginBtn.click();
    await loginPage.waitForLoadState('domcontentloaded');
  }

  // Fill credentials
  await loginPage.locator('#loginId').fill(USERNAME);
  await loginPage.locator('#loginId').press('Tab');
  await loginPage.locator('#uiPwd').fill(PASSWORD);

  // Login opens a new page/tab
  const [appPage] = await Promise.all([
    context.waitForEvent('page'),
    loginPage.locator('#userLogin').click(),
  ]);

  await appPage.waitForLoadState('domcontentloaded');
  await appPage.evaluate(() => {
    // @ts-ignore
    window.moveTo(0, 0);
    // @ts-ignore
    window.resizeTo(screen.width, screen.height);
  }).catch(() => {});

  // Wait for hamburger to confirm login success
  await appPage.locator('a.item-nav').first().waitFor({ state: 'visible', timeout: 30_000 });
  console.log('[LOGIN] ✅ Logged in successfully');
  return appPage;
}

// ── Menu Crawler ──────────────────────────────────────────────────────────────
async function captureMenus(page: Page): Promise<TopSection[]> {
  const structure: TopSection[] = [];

  // Open sidebar
  const hamburger = page.locator('a.item-nav').first();
  await hamburger.click();
  await page.waitForTimeout(1000);
  await waitForAjax(page);

  // Get all top-level sections (li with dropnav)
  const topSectionEls = await page.locator('li:has(> a.dropnav)').all();
  console.log(`[MENU] Found ${topSectionEls.length} top sections`);

  for (const topEl of topSectionEls) {
    const topId    = await topEl.getAttribute('id').catch(() => '') ?? '';
    const topLabel = (await topEl.locator('> a.dropnav').innerText().catch(() => '')).trim().replace(/\s+/g, ' ');

    if (!topId || !topLabel) continue;
    console.log(`\n[TOP] ${topId} → "${topLabel}"`);

    const topSection: TopSection = { id: topId, label: topLabel, subSections: [] };

    // Expand top section
    const topToggle = topEl.locator('> a.dropnav');
    const isOpen = await topToggle.evaluate((el: any) => el.classList.contains('mn-open')).catch(() => false);
    if (!isOpen) {
      await topToggle.click();
      await page.waitForTimeout(500);
    }

    // Get sub-sections inside this top section
    const subEls = await topEl.locator('li:has(> a.s-dropnav)').all();
    console.log(`  [SUB] ${subEls.length} sub-sections`);

    for (const subEl of subEls) {
      const subId    = await subEl.getAttribute('id').catch(() => '') ?? '';
      const subLabel = (await subEl.locator('> a.s-dropnav').innerText().catch(() => '')).trim().replace(/\s+/g, ' ');

      if (!subId || !subLabel) continue;
      console.log(`  [SUB] ${subId} → "${subLabel}"`);

      const subSection: SubSection = { id: subId, label: subLabel, items: [] };

      // Expand sub-section
      const subToggle = subEl.locator('> a.s-dropnav');
      const subPanel  = subEl.locator('> div.super-sub-nav');
      const subOpen   = await subPanel.evaluate((el: any) => el.classList.contains('ssn-open')).catch(() => false);
      if (!subOpen) {
        await subToggle.click();
        await page.waitForTimeout(400);
      }

      // Get menu items inside sub-section
      const itemEls = await subEl.locator('li:not(:has(a.s-dropnav)):has(> a)').all();

      for (const itemEl of itemEls) {
        const itemId    = await itemEl.getAttribute('id').catch(() => '') ?? '';
        const itemLabel = (await itemEl.locator('> a').innerText().catch(() => '')).trim().replace(/\s+/g, ' ');
        if (!itemId || !itemLabel) continue;
        console.log(`    [ITEM] ${itemId} → "${itemLabel}"`);
        subSection.items.push({ id: itemId, label: itemLabel });
      }

      if (subSection.items.length > 0) topSection.subSections.push(subSection);
    }

    if (topSection.subSections.length > 0) structure.push(topSection);

    // Collapse top section to keep sidebar clean
    const stillOpen = await topToggle.evaluate((el: any) => el.classList.contains('mn-open')).catch(() => false);
    if (stillOpen) {
      await topToggle.click();
      await page.waitForTimeout(300);
    }
  }

  return structure;
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });

  try {
    const page      = await login(browser);
    const structure = await captureMenus(page);

    const outPath = path.join(process.cwd(), 'scripts', 'menu-structure.json');
    fs.writeFileSync(outPath, JSON.stringify(structure, null, 2), 'utf-8');

    const totalItems = structure.reduce((a, t) =>
      a + t.subSections.reduce((b, s) => b + s.items.length, 0), 0);

    console.log(`\n✅ Menu capture complete`);
    console.log(`   Top sections : ${structure.length}`);
    console.log(`   Total items  : ${totalItems}`);
    console.log(`   Saved to     : ${outPath}`);

  } finally {
    await browser.close();
  }
})();

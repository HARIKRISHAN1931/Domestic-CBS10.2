import { test } from '../../../../../framework/fixtures/fixtures';
import path from 'path';

test('debug - capture CBS menu IDs', async ({ authenticatedPage }) => {
  test.setTimeout(60_000);

  // Click hamburger to open menu
  const hamburger = authenticatedPage.locator('a.item-nav').first();
  await hamburger.waitFor({ state: 'visible', timeout: 15_000 });
  await hamburger.click();
  await authenticatedPage.waitForTimeout(2000);

  // Get all top-level li IDs (dropnav items)
  const topIds = await authenticatedPage.locator('li > a.dropnav').evaluateAll(
    (els: Element[]) => els.map(el => ({ id: el.parentElement?.id, text: el.textContent?.trim() }))
  );
  console.log('TOP MENU IDs:', JSON.stringify(topIds, null, 2));

  // Click Masters section
  const mastersToggle = authenticatedPage.locator('li > a.dropnav').filter({ hasText: /master/i }).first();
  const mastersVisible = await mastersToggle.isVisible({ timeout: 3_000 }).catch(() => false);
  if (mastersVisible) {
    await mastersToggle.click();
    await authenticatedPage.waitForTimeout(1000);
  }

  // Get all sub-section li IDs (s-dropnav items)
  const subIds = await authenticatedPage.locator('li > a.s-dropnav').evaluateAll(
    (els: Element[]) => els.map(el => ({ id: el.parentElement?.id, text: el.textContent?.trim() }))
  );
  console.log('SUB MENU IDs:', JSON.stringify(subIds, null, 2));

  // Get all menu item li IDs
  const menuItemIds = await authenticatedPage.locator('li > a').filter({ hasText: /customer/i }).evaluateAll(
    (els: Element[]) => els.map(el => ({ id: el.parentElement?.id, text: el.textContent?.trim() }))
  );
  console.log('CUSTOMER MENU ITEMS:', JSON.stringify(menuItemIds, null, 2));
});

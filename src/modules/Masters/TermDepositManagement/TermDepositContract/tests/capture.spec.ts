/**
 * Term Deposit Management — Full Field Capture
 * Captures: TermDepositContract (TDACNOMST) screen
 * Run: ENV=qa npx playwright test src/modules/Masters/TermDepositManagement/TermDepositContract/tests/capture.spec.ts --headed --workers=1
 */
import { test } from '../../../../../framework/fixtures/fixtures';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

// Helper: get all options via individual nth() — avoids CBS CSP blocking allInnerTexts()
const getOpts = async (page: any, id: string) => {
  const el    = page.locator(`#${id}`).first();
  const count = await el.locator('option').count().catch(() => 0);
  const result: { value: string; text: string }[] = [];
  for (let i = 0; i < count; i++) {
    const opt   = el.locator('option').nth(i);
    const value = await opt.getAttribute('value').catch(() => '') ?? '';
    const text  = (await opt.innerText().catch(() => '')).trim();
    if (value.trim() !== '') result.push({ value, text });
  }
  return result;
};

const waitOpts = async (page: any, id: string, ms = 12_000) => {
  const el = page.locator(`#${id}`).first();
  const dl = Date.now() + ms;
  while (Date.now() < dl) {
    if (await el.locator('option').count().catch(() => 0) > 1) return;
    await page.waitForTimeout(400);
  }
};

test('capture TermDepositContract fields', async ({ authenticatedPage: page }) => {
  test.setTimeout(300_000);

  // ── Find correct menu IDs ─────────────────────────────────────────────────
  await page.locator('a.item-nav').first().click();
  await page.waitForTimeout(1_500);

  // Click Masters
  await page.locator('a.dropnav').filter({ hasText: /^Masters$/i }).first().click().catch(async () => {
    await page.locator('li#Masters > a.dropnav').first().click();
  });
  await page.waitForTimeout(1_000);

  // Find Term Deposit sub-section
  const tdSub = page.locator('a.s-dropnav:visible').filter({ hasText: /term deposit/i }).first();
  const tdSubId = await tdSub.locator('..').getAttribute('id').catch(() => '?');
  console.log(`\nTerm Deposit sub-section: li#${tdSubId}`);
  await tdSub.click();
  await page.waitForTimeout(1_000);

  // Find all menu items under Term Deposit
  console.log('\n══ TERM DEPOSIT MENU ITEMS ══');
  const menuItems = page.locator('li[id] > a:visible');
  const mCount = await menuItems.count();
  for (let i = 0; i < mCount; i++) {
    const id   = await menuItems.nth(i).locator('..').getAttribute('id').catch(() => '');
    const text = (await menuItems.nth(i).innerText().catch(() => '')).trim().slice(0, 60);
    if (id && text) console.log(`  li#${id.padEnd(35)} → "${text}"`);
  }

  // Click Term Deposit Contract
  const tdContractItem = page.locator('li[id] > a:visible').filter({ hasText: /term deposit contract|td contract/i }).first();
  if (await tdContractItem.isVisible({ timeout: 3_000 }).catch(() => false)) {
    const itemId = await tdContractItem.locator('..').getAttribute('id').catch(() => '?');
    console.log(`\nTD Contract menu item: li#${itemId}`);
    await tdContractItem.click();
  } else {
    // Try TDACNOMST directly
    await page.locator('li#TDACNOMST > a').first().click().catch(() => {});
  }
  await page.waitForTimeout(2_000);

  // ── Open create form ──────────────────────────────────────────────────────
  const addBtn = page.locator('a.button.add, button.button.add, #btnAddTD, #addButton').first();
  if (await addBtn.isVisible({ timeout: 10_000 }).catch(() => false)) {
    await addBtn.click({ force: true });
    await page.waitForTimeout(2_000);
  }

  console.log(`\nURL after open: ${page.url()}`);

  // ── Dump all inputs ───────────────────────────────────────────────────────
  console.log('\n══ INPUTS ══');
  const inputs = page.locator('input[id]:visible, textarea[id]:visible');
  for (let i = 0; i < await inputs.count(); i++) {
    const el   = inputs.nth(i);
    const id   = await el.getAttribute('id').catch(() => '');
    const type = await el.getAttribute('type').catch(() => 'text') ?? 'text';
    const ph   = await el.getAttribute('placeholder').catch(() => '') ?? '';
    const dis  = await el.isDisabled().catch(() => false);
    const ro   = await el.getAttribute('readonly').then(v => v !== null).catch(() => false);
    console.log(`[${type.toUpperCase().padEnd(8)}] #${id}  ph="${ph}"  disabled=${dis}  readonly=${ro}`);
  }

  // ── Dump native selects ───────────────────────────────────────────────────
  console.log('\n══ NATIVE SELECTS ══');
  const selects = page.locator('select[id]:visible');
  for (let i = 0; i < await selects.count(); i++) {
    const el  = selects.nth(i);
    const id  = await el.getAttribute('id').catch(() => '');
    const dis = await el.isDisabled().catch(() => false);
    const cnt = await el.locator('option').count().catch(() => 0);
    console.log(`  #${id}  disabled=${dis}  options=${cnt}`);
  }

  // ── Dump F2 buttons ───────────────────────────────────────────────────────
  console.log('\n══ F2 BUTTONS ══');
  const f2 = page.locator('[id$="F2"]:visible');
  for (let i = 0; i < await f2.count(); i++) {
    const btnId   = await f2.nth(i).getAttribute('id').catch(() => '');
    console.log(`  buttonId="${btnId}"  fieldId="${(btnId ?? '').replace('F2', '')}"`);
  }

  // ── Fill customer and capture cascade ─────────────────────────────────────
  console.log('\n══ FILLING CUSTOMER 1395042 ══');
  const custField = page.locator('#customerCode, #customerId, #custCode').first();
  if (await custField.isVisible({ timeout: 3_000 }).catch(() => false)) {
    const custId = await custField.getAttribute('id').catch(() => '');
    console.log(`Customer field: #${custId}`);
    await custField.click({ force: true });
    await custField.fill('1395042');
    await custField.press('Tab');
    await page.waitForTimeout(2_000);
    console.log(`Customer name: ${await page.locator('#accountName, #customerName, #custName').first().inputValue().catch(() => 'N/A')}`);
  }

  // Capture productCode options
  await waitOpts(page, 'productCode');
  const products = await getOpts(page, 'productCode');
  console.log(`\nproductCode (${products.length} options):`);
  products.forEach((p: any) => console.log(`  value="${p.value}"  text="${p.text}"`));

  if (products.length > 0) {
    // Select first product
    await page.locator('#productCode').first().selectOption(products[0].value);
    await page.waitForTimeout(1_000);
    await waitOpts(page, 'schemeCode');
    const schemes = await getOpts(page, 'schemeCode');
    console.log(`\nschemeCode for product ${products[0].value} (${schemes.length} options):`);
    schemes.forEach((s: any) => console.log(`  value="${s.value}"  text="${s.text}"`));

    if (schemes.length > 0) {
      await page.locator('#schemeCode').first().selectOption(schemes[0].value);
      await page.waitForTimeout(1_000);
    }
  }

  // Dump all selects with options after cascade
  console.log('\n══ ALL SELECTS WITH OPTIONS (after cascade) ══');
  for (let i = 0; i < await selects.count(); i++) {
    const el  = selects.nth(i);
    const id  = await el.getAttribute('id').catch(() => '');
    const dis = await el.isDisabled().catch(() => false);
    const opts = await getOpts(page, id ?? '');
    if (opts.length > 0) {
      console.log(`\n[SELECT] #${id}  disabled=${dis}`);
      opts.slice(0, 15).forEach((o: any) => console.log(`  value="${o.value}"  text="${o.text}"`));
    }
  }

  // Dump radios
  console.log('\n══ RADIO BUTTONS ══');
  const radios = page.locator('input[type="radio"][id]:visible');
  for (let i = 0; i < await radios.count(); i++) {
    const el  = radios.nth(i);
    const id  = await el.getAttribute('id').catch(() => '');
    const val = await el.getAttribute('value').catch(() => '');
    console.log(`  #${id}  value="${val}"`);
  }

  console.log('\n══ PAUSED ══\n');
  await page.pause();
});

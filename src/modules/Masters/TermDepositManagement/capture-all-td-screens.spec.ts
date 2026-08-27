/**
 * TD Management — Discover all menu IDs + capture all 5 remaining screens
 * Run: ENV=qa npx playwright test "src/modules/Masters/TermDepositManagement/capture-all-td-screens.spec.ts" --headed --workers=1
 */
import { test } from '../../../framework/fixtures/fixtures';
import { MenuNavigation } from '../../../common/components/MenuNavigation';

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

const dumpForm = async (page: any, label: string) => {
  console.log(`\n${'═'.repeat(60)}\nSCREEN: ${label}\nURL: ${page.url()}\n${'═'.repeat(60)}`);

  console.log('\n── INPUTS ──');
  const inputs = page.locator('input[id]:visible, textarea[id]:visible');
  for (let i = 0; i < await inputs.count(); i++) {
    const el   = inputs.nth(i);
    const id   = await el.getAttribute('id').catch(() => '');
    const type = await el.getAttribute('type').catch(() => 'text') ?? 'text';
    const ph   = await el.getAttribute('placeholder').catch(() => '') ?? '';
    const dis  = await el.isDisabled().catch(() => false);
    const ro   = await el.getAttribute('readonly').then(v => v !== null).catch(() => false);
    console.log(`  [${type.toUpperCase().padEnd(8)}] #${id}  ph="${ph}"  disabled=${dis}  readonly=${ro}`);
  }

  console.log('\n── SELECTS ──');
  const selects = page.locator('select[id]:visible');
  for (let i = 0; i < await selects.count(); i++) {
    const el   = selects.nth(i);
    const id   = await el.getAttribute('id').catch(() => '');
    const dis  = await el.isDisabled().catch(() => false);
    const opts = await getOpts(page, id ?? '');
    console.log(`  #${id}  disabled=${dis}  options=${opts.length}`);
    opts.slice(0, 20).forEach((o: any) => console.log(`    value="${o.value}"  text="${o.text}"`));
  }

  console.log('\n── RADIOS ──');
  const radios = page.locator('input[type="radio"][id]:visible');
  for (let i = 0; i < await radios.count(); i++) {
    const el  = radios.nth(i);
    const id  = await el.getAttribute('id').catch(() => '');
    const val = await el.getAttribute('value').catch(() => '');
    console.log(`  #${id}  value="${val}"`);
  }

  console.log('\n── F2 BUTTONS ──');
  const f2 = page.locator('[id$="F2"]:visible');
  for (let i = 0; i < await f2.count(); i++) {
    const btnId = await f2.nth(i).getAttribute('id').catch(() => '');
    console.log(`  #${btnId}  → field: #${(btnId ?? '').replace('F2', '')}`);
  }

  console.log('\n── ACTION BUTTONS ──');
  const btns = page.locator('a.button[id]:visible, button[id]:visible');
  for (let i = 0; i < await btns.count(); i++) {
    const id  = await btns.nth(i).getAttribute('id').catch(() => '');
    const txt = (await btns.nth(i).innerText().catch(() => '')).trim().slice(0, 40);
    console.log(`  #${id}  text="${txt}"`);
  }
};

// ── Step 1: Discover all TD menu IDs ─────────────────────────────────────────
test('step1 discover TD menu IDs', async ({ authenticatedPage: page }) => {
  test.setTimeout(60_000);

  const nav = new MenuNavigation(page);

  // Open Masters → td to list all items
  const sectionToggle = page.locator('li#Masters > a.dropnav');
  const menuVisible = await sectionToggle.isVisible({ timeout: 1_000 }).catch(() => false);
  if (!menuVisible) {
    await page.locator('a.item-nav').first().click();
    await sectionToggle.waitFor({ state: 'visible', timeout: 10_000 });
  }
  const isOpen = await sectionToggle.getAttribute('class').then(c => (c ?? '').includes('mn-open')).catch(() => false);
  if (!isOpen) await sectionToggle.click();

  const subToggle = page.locator('li#td > a.s-dropnav');
  await subToggle.waitFor({ state: 'visible', timeout: 8_000 });
  const subOpen = await subToggle.getAttribute('class').then(c => (c ?? '').includes('ssn-open')).catch(() => false);
  if (!subOpen) await subToggle.click();
  await page.waitForTimeout(1_000);

  console.log('\n══ ALL TD MENU ITEMS ══');
  const items = page.locator('li#td li[id] > a');
  const count = await items.count();
  for (let i = 0; i < count; i++) {
    const id   = await items.nth(i).locator('..').getAttribute('id').catch(() => '');
    const text = (await items.nth(i).innerText().catch(() => '')).trim().slice(0, 70);
    if (id) console.log(`  li#${id.padEnd(45)} → "${text}"`);
  }

  await page.pause();
});

// ── Step 2: Capture each screen (run after discovering IDs from step 1) ───────
test('step2 capture MaturityDisposalInstructions', async ({ authenticatedPage: page }) => {
  test.setTimeout(180_000);
  const nav = new MenuNavigation(page);

  // Try known-likely IDs first, fallback to text match
  const knownIds = ['TDMATDISPOSINSTR', 'MATDISPOSINSTR', 'TDMATURITYDISPOSAL', 'MATURITYDISPOSAL'];
  let navigated = false;
  for (const id of knownIds) {
    try {
      await nav.navigate('Masters', 'td', id);
      navigated = true;
      console.log(`\nNavigated via li#${id}`);
      break;
    } catch { /* try next */ }
  }
  if (!navigated) {
    // Text-based fallback
    const sectionToggle = page.locator('li#Masters > a.dropnav');
    const menuVisible = await sectionToggle.isVisible({ timeout: 1_000 }).catch(() => false);
    if (!menuVisible) { await page.locator('a.item-nav').first().click(); await sectionToggle.waitFor({ state: 'visible', timeout: 10_000 }); }
    const isOpen = await sectionToggle.getAttribute('class').then(c => (c ?? '').includes('mn-open')).catch(() => false);
    if (!isOpen) await sectionToggle.click();
    const subToggle = page.locator('li#td > a.s-dropnav');
    await subToggle.waitFor({ state: 'visible', timeout: 8_000 });
    const subOpen = await subToggle.getAttribute('class').then(c => (c ?? '').includes('ssn-open')).catch(() => false);
    if (!subOpen) await subToggle.click();
    await page.waitForTimeout(500);
    const item = page.locator('li#td li[id] > a').filter({ hasText: /maturity.*disposal.*instr|disposal.*instr/i }).first();
    const menuId = await item.locator('..').getAttribute('id').catch(() => '?');
    console.log(`\nMaturityDisposalInstructions menu ID: li#${menuId}`);
    await item.click();
    await page.waitForTimeout(2_000);
  }

  await dumpForm(page, 'MaturityDisposalInstructions (list page)');

  const addBtn = page.locator('a.button.add, button.button.add, #addButton, #btnAdd').first();
  if (await addBtn.isVisible({ timeout: 8_000 }).catch(() => false)) {
    await addBtn.click({ force: true });
    await page.waitForTimeout(2_000);
    await dumpForm(page, 'MaturityDisposalInstructions (create form)');
  }

  // Fill primary field
  const primaryField = page.locator('#prdAcctId, #accountId, #tdAccountId, #customerCode, #customerId').first();
  if (await primaryField.isVisible({ timeout: 3_000 }).catch(() => false)) {
    const fid = await primaryField.getAttribute('id').catch(() => '');
    console.log(`\nPrimary field: #${fid}`);
    await primaryField.fill('1395042');
    await primaryField.press('Tab');
    await page.waitForTimeout(2_000);
    await dumpForm(page, 'MaturityDisposalInstructions (after fill)');
  }

  await page.pause();
});

test('step3 capture TdContractCreationForSpecialRate', async ({ authenticatedPage: page }) => {
  test.setTimeout(180_000);
  const nav = new MenuNavigation(page);

  const knownIds = ['TDSPECIALRATE', 'TDCONTRACTSPECIALRATE', 'TDCREATESPECIALRATE', 'SPECIALRATETD'];
  let navigated = false;
  for (const id of knownIds) {
    try {
      await nav.navigate('Masters', 'td', id);
      navigated = true;
      console.log(`\nNavigated via li#${id}`);
      break;
    } catch { /* try next */ }
  }
  if (!navigated) {
    const sectionToggle = page.locator('li#Masters > a.dropnav');
    const menuVisible = await sectionToggle.isVisible({ timeout: 1_000 }).catch(() => false);
    if (!menuVisible) { await page.locator('a.item-nav').first().click(); await sectionToggle.waitFor({ state: 'visible', timeout: 10_000 }); }
    const isOpen = await sectionToggle.getAttribute('class').then(c => (c ?? '').includes('mn-open')).catch(() => false);
    if (!isOpen) await sectionToggle.click();
    const subToggle = page.locator('li#td > a.s-dropnav');
    await subToggle.waitFor({ state: 'visible', timeout: 8_000 });
    const subOpen = await subToggle.getAttribute('class').then(c => (c ?? '').includes('ssn-open')).catch(() => false);
    if (!subOpen) await subToggle.click();
    await page.waitForTimeout(500);
    const item = page.locator('li#td li[id] > a').filter({ hasText: /special rate|special.*contract/i }).first();
    const menuId = await item.locator('..').getAttribute('id').catch(() => '?');
    console.log(`\nTdContractCreationForSpecialRate menu ID: li#${menuId}`);
    await item.click();
    await page.waitForTimeout(2_000);
  }

  await dumpForm(page, 'TdContractCreationForSpecialRate (list page)');

  const addBtn = page.locator('a.button.add, button.button.add, #addButton, #btnAdd').first();
  if (await addBtn.isVisible({ timeout: 8_000 }).catch(() => false)) {
    await addBtn.click({ force: true });
    await page.waitForTimeout(2_000);
    await dumpForm(page, 'TdContractCreationForSpecialRate (create form)');
  }

  const custField = page.locator('#customerCode, #customerId, #custCode').first();
  if (await custField.isVisible({ timeout: 3_000 }).catch(() => false)) {
    const fid = await custField.getAttribute('id').catch(() => '');
    console.log(`\nCustomer field: #${fid}`);
    await custField.fill('1395042');
    await custField.press('Tab');
    await page.waitForTimeout(2_000);
    await waitOpts(page, 'productCode');
    const products = await getOpts(page, 'productCode');
    console.log(`\nproductCode (${products.length} options):`);
    products.forEach((p: any) => console.log(`  value="${p.value}"  text="${p.text}"`));
    if (products.length > 0) {
      await page.locator('#productCode').first().selectOption(products[0].value);
      await page.waitForTimeout(1_000);
      await waitOpts(page, 'schemeCode');
      const schemes = await getOpts(page, 'schemeCode');
      console.log(`\nschemeCode (${schemes.length} options):`);
      schemes.forEach((s: any) => console.log(`  value="${s.value}"  text="${s.text}"`));
    }
    await dumpForm(page, 'TdContractCreationForSpecialRate (after cascade)');
  }

  await page.pause();
});

test('step4 capture TdInterestPayout', async ({ authenticatedPage: page }) => {
  test.setTimeout(180_000);
  const nav = new MenuNavigation(page);

  const knownIds = ['TDINTPAYOUT', 'TDINTERESTPAYOUT', 'TDINTPAY', 'INTERESTPAYOUT'];
  let navigated = false;
  for (const id of knownIds) {
    try {
      await nav.navigate('Masters', 'td', id);
      navigated = true;
      console.log(`\nNavigated via li#${id}`);
      break;
    } catch { /* try next */ }
  }
  if (!navigated) {
    const sectionToggle = page.locator('li#Masters > a.dropnav');
    const menuVisible = await sectionToggle.isVisible({ timeout: 1_000 }).catch(() => false);
    if (!menuVisible) { await page.locator('a.item-nav').first().click(); await sectionToggle.waitFor({ state: 'visible', timeout: 10_000 }); }
    const isOpen = await sectionToggle.getAttribute('class').then(c => (c ?? '').includes('mn-open')).catch(() => false);
    if (!isOpen) await sectionToggle.click();
    const subToggle = page.locator('li#td > a.s-dropnav');
    await subToggle.waitFor({ state: 'visible', timeout: 8_000 });
    const subOpen = await subToggle.getAttribute('class').then(c => (c ?? '').includes('ssn-open')).catch(() => false);
    if (!subOpen) await subToggle.click();
    await page.waitForTimeout(500);
    const item = page.locator('li#td li[id] > a').filter({ hasText: /interest.*payout|payout/i }).first();
    const menuId = await item.locator('..').getAttribute('id').catch(() => '?');
    console.log(`\nTdInterestPayout menu ID: li#${menuId}`);
    await item.click();
    await page.waitForTimeout(2_000);
  }

  await dumpForm(page, 'TdInterestPayout (list page)');

  const addBtn = page.locator('a.button.add, button.button.add, #addButton, #btnAdd').first();
  if (await addBtn.isVisible({ timeout: 8_000 }).catch(() => false)) {
    await addBtn.click({ force: true });
    await page.waitForTimeout(2_000);
    await dumpForm(page, 'TdInterestPayout (create form)');
  }

  const primaryField = page.locator('#prdAcctId, #accountId, #tdAccountId, #customerCode, #customerId').first();
  if (await primaryField.isVisible({ timeout: 3_000 }).catch(() => false)) {
    const fid = await primaryField.getAttribute('id').catch(() => '');
    console.log(`\nPrimary field: #${fid}`);
    await primaryField.fill('1395042');
    await primaryField.press('Tab');
    await page.waitForTimeout(2_000);
    await dumpForm(page, 'TdInterestPayout (after fill)');
  }

  await page.pause();
});

test('step5 capture TdMaturityDisposalNew', async ({ authenticatedPage: page }) => {
  test.setTimeout(180_000);
  const nav = new MenuNavigation(page);

  const knownIds = ['TDMATDISPOSALNEW', 'TDMATURITYDISPOSALNEW', 'MATDISPOSALNEW', 'TDMATDISPOSAL'];
  let navigated = false;
  for (const id of knownIds) {
    try {
      await nav.navigate('Masters', 'td', id);
      navigated = true;
      console.log(`\nNavigated via li#${id}`);
      break;
    } catch { /* try next */ }
  }
  if (!navigated) {
    const sectionToggle = page.locator('li#Masters > a.dropnav');
    const menuVisible = await sectionToggle.isVisible({ timeout: 1_000 }).catch(() => false);
    if (!menuVisible) { await page.locator('a.item-nav').first().click(); await sectionToggle.waitFor({ state: 'visible', timeout: 10_000 }); }
    const isOpen = await sectionToggle.getAttribute('class').then(c => (c ?? '').includes('mn-open')).catch(() => false);
    if (!isOpen) await sectionToggle.click();
    const subToggle = page.locator('li#td > a.s-dropnav');
    await subToggle.waitFor({ state: 'visible', timeout: 8_000 });
    const subOpen = await subToggle.getAttribute('class').then(c => (c ?? '').includes('ssn-open')).catch(() => false);
    if (!subOpen) await subToggle.click();
    await page.waitForTimeout(500);
    const item = page.locator('li#td li[id] > a').filter({ hasText: /maturity.*disposal.*new|maturity.*new/i }).first();
    const menuId = await item.locator('..').getAttribute('id').catch(() => '?');
    console.log(`\nTdMaturityDisposalNew menu ID: li#${menuId}`);
    await item.click();
    await page.waitForTimeout(2_000);
  }

  await dumpForm(page, 'TdMaturityDisposalNew (list page)');

  const addBtn = page.locator('a.button.add, button.button.add, #addButton, #btnAdd').first();
  if (await addBtn.isVisible({ timeout: 8_000 }).catch(() => false)) {
    await addBtn.click({ force: true });
    await page.waitForTimeout(2_000);
    await dumpForm(page, 'TdMaturityDisposalNew (create form)');
  }

  const primaryField = page.locator('#prdAcctId, #accountId, #tdAccountId, #customerCode, #customerId').first();
  if (await primaryField.isVisible({ timeout: 3_000 }).catch(() => false)) {
    const fid = await primaryField.getAttribute('id').catch(() => '');
    console.log(`\nPrimary field: #${fid}`);
    await primaryField.fill('1395042');
    await primaryField.press('Tab');
    await page.waitForTimeout(2_000);
    await dumpForm(page, 'TdMaturityDisposalNew (after fill)');
  }

  await page.pause();
});

test('step6 capture TermDepositReceiptsQuery', async ({ authenticatedPage: page }) => {
  test.setTimeout(180_000);
  const nav = new MenuNavigation(page);

  const knownIds = ['TDRECEIPTSQUERY', 'TDRECEIPTS', 'TERMDEPOSITSRECEIPTSQUERY', 'TDRECEIPTQUERY'];
  let navigated = false;
  for (const id of knownIds) {
    try {
      await nav.navigate('Masters', 'td', id);
      navigated = true;
      console.log(`\nNavigated via li#${id}`);
      break;
    } catch { /* try next */ }
  }
  if (!navigated) {
    const sectionToggle = page.locator('li#Masters > a.dropnav');
    const menuVisible = await sectionToggle.isVisible({ timeout: 1_000 }).catch(() => false);
    if (!menuVisible) { await page.locator('a.item-nav').first().click(); await sectionToggle.waitFor({ state: 'visible', timeout: 10_000 }); }
    const isOpen = await sectionToggle.getAttribute('class').then(c => (c ?? '').includes('mn-open')).catch(() => false);
    if (!isOpen) await sectionToggle.click();
    const subToggle = page.locator('li#td > a.s-dropnav');
    await subToggle.waitFor({ state: 'visible', timeout: 8_000 });
    const subOpen = await subToggle.getAttribute('class').then(c => (c ?? '').includes('ssn-open')).catch(() => false);
    if (!subOpen) await subToggle.click();
    await page.waitForTimeout(500);
    const item = page.locator('li#td li[id] > a').filter({ hasText: /receipt.*query|receipts/i }).first();
    const menuId = await item.locator('..').getAttribute('id').catch(() => '?');
    console.log(`\nTermDepositReceiptsQuery menu ID: li#${menuId}`);
    await item.click();
    await page.waitForTimeout(2_000);
  }

  await dumpForm(page, 'TermDepositReceiptsQuery (query page)');

  await page.pause();
});

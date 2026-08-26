/**
 * Capture: for each module → select first product → capture all schemes
 * Run: ENV=qa npx playwright test src/modules/Masters/AccountsManagement/CustomerAccountCreation/tests/capture.spec.ts --headed --workers=1
 */
import { test } from '../../../../../framework/fixtures/fixtures';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

test('capture one product one scheme per module', async ({ authenticatedPage: page }) => {
  test.setTimeout(600_000);

  await new MenuNavigation(page).navigate('Masters', 'accountmgmt', 'PRDACNOMST');
  await page.waitForTimeout(2_000);

  const addBtn = page.locator('a.button.add, button.button.add, #btnAddAccount').first();
  if (await addBtn.isVisible({ timeout: 10_000 }).catch(() => false)) {
    await addBtn.click({ force: true });
    await page.waitForTimeout(2_000);
  }

  // Fill customer
  const custInput = page.locator('#customerNumber').first();
  await custInput.click({ force: true });
  await custInput.fill('1395042');
  await custInput.press('Tab');

  // Wait up to 20s for moduleCode to load
  const modEl = page.locator('#moduleCode').first();
  const modDeadline = Date.now() + 20_000;
  while (Date.now() < modDeadline) {
    if (await modEl.locator('option').count().catch(() => 0) > 1) break;
    await page.waitForTimeout(500);
  }

  const modCount = await modEl.locator('option').count().catch(() => 0);
  console.log(`\nmoduleCode options loaded: ${modCount}`);

  const getOpts = async (id: string) => {
    const el    = page.locator(`#${id}`).first();
    const count = await el.locator('option').count().catch(() => 0);
    const result: { value: string; text: string }[] = [];
    for (let i = 0; i < count; i++) {
      const opt   = el.locator('option').nth(i);
      const value = await opt.getAttribute('value').catch(() => '') ?? '';
      const text  = (await opt.innerText().catch(() => '')).trim();
      if (value && value.trim() !== '') result.push({ value, text });
    }
    return result;
  };

  const waitOpts = async (id: string, ms = 10_000) => {
    const el = page.locator(`#${id}`).first();
    const dl = Date.now() + ms;
    while (Date.now() < dl) {
      if (await el.locator('option').count().catch(() => 0) > 1) return;
      await page.waitForTimeout(400);
    }
  };

  const modules = await getOpts('moduleCode');
  console.log(`Modules: ${modules.map((m: any) => m.value).join(', ')}\n`);

  const results: any[] = [];

  // Get all products for module 11 specifically
  await modEl.selectOption('11');
  await page.waitForTimeout(500);
  await waitOpts('productCode');
  const mod11Products = await getOpts('productCode');
  console.log(`\nAll products for Module 11 (${mod11Products.length}):`);
  for (const p of mod11Products) {
    await page.locator('#productCode').first().selectOption(p.value);
    await page.waitForTimeout(500);
    await waitOpts('schemeCode');
    const schemes = await getOpts('schemeCode');
    console.log(`  Product ${p.value} (${p.text}) → Schemes: ${schemes.map((s: any) => `${s.value}=${s.text}`).join(' | ')}`);
  }

  for (const mod of modules) {
    // Select module
    await modEl.selectOption(mod.value);
    await page.waitForTimeout(500);
    await waitOpts('productCode');

    const products = await getOpts('productCode');
    if (!products.length) {
      console.log(`Module ${mod.value}: no products — skip`);
      continue;
    }

    // First product
    const prod = products[0];
    await page.locator('#productCode').first().selectOption(prod.value);
    await page.waitForTimeout(500);
    await waitOpts('schemeCode');

    const schemes = await getOpts('schemeCode');
    const scheme  = schemes[0] ?? { value: '', text: '' };

    console.log(`Module ${mod.value} → Product ${prod.value} (${prod.text}) → Schemes: ${schemes.map((s: any) => s.value).join(', ')}`);
    console.log(`  → Using scheme: ${scheme.value} (${scheme.text})`);

    results.push({
      moduleCode:  mod.value,
      moduleName:  mod.text,
      productCode: prod.value,
      productName: prod.text,
      schemeCode:  scheme.value,
      schemeName:  scheme.text,
    });
  }

  console.log('\n══ BUILDER DATA (one per module) ══');
  results.forEach((r: any) =>
    console.log(`  { moduleCode: '${r.moduleCode}', productCode: '${r.productCode}', schemeCode: '${r.schemeCode}' },  // ${r.moduleName} → ${r.productName} → ${r.schemeName}`)
  );

  await page.pause();
});

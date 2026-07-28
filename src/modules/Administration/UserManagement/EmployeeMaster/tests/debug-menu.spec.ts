import { test } from '../../../../../framework/fixtures/fixtures';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Captures the full HTML of the Employee Master create form
 * then parses it to extract all fields, types, options.
 * Saves to debug-form-capture.html for offline analysis.
 */
test('capture: Employee Master create form HTML', async ({ authenticatedPage }) => {
  const page = authenticatedPage;

  await new MenuNavigation(page).navigate('Administration', 'usermgmtAdm', 'EMPLOYEEMST');
  await page.waitForTimeout(1_000);

  await page.locator('#btnAddEmp').waitFor({ state: 'visible', timeout: 15_000 });
  await page.locator('#btnAddEmp').click({ force: true });
  await page.waitForTimeout(2_000);

  // Capture the full page HTML in one shot (fast — single round trip)
  const html = await page.content();

  const outPath = path.join(process.cwd(), 'test-results', 'debug-form-capture.html');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log(`\nSaved form HTML to: ${outPath}`);

  // Also capture just the visible form fields quickly using page.locator().all() in batch
  // Get all input/select IDs in one getAttribute batch
  const inputs  = await page.locator('input[id], select[id], textarea[id]').all();
  const results: string[] = [];

  for (const el of inputs) {
    const [id, name, type, cls] = await Promise.all([
      el.getAttribute('id').catch(() => ''),
      el.getAttribute('name').catch(() => ''),
      el.getAttribute('type').catch(() => ''),
      el.getAttribute('class').catch(() => ''),
    ]);
    if (!id) continue;
    const isS2  = (cls ?? '').includes('select2-hidden-accessible');
    const isHid = type === 'hidden' || type === 'file';
    const tag   = await el.evaluate((e: any) => e.tagName as string).catch(() => '');
    results.push(`${tag}|${id}|${name}|${type}|${isS2 ? 'SELECT2' : isHid ? 'HIDDEN' : 'VISIBLE'}`);
  }

  const summary = results.join('\n');
  const sumPath = path.join(process.cwd(), 'test-results', 'debug-fields.txt');
  fs.writeFileSync(sumPath, summary);
  console.log(`Saved field list to: ${sumPath}`);
  console.log('\n--- VISIBLE FIELDS ---');
  results.filter(r => r.includes('VISIBLE') || r.includes('SELECT2')).forEach(r => console.log(' ', r));
});

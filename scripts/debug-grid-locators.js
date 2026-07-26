const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext();
  const lp = await context.newPage();
  await lp.goto('http://172.21.0.39:7999/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en');
  await lp.locator('#loginId').fill('demo1');
  await lp.locator('#uiPwd').fill('Abcd@1243');
  await lp.locator('#userLogin').click();
  const ap = await context.waitForEvent('page');
  await ap.waitForSelector('a.item-nav', { timeout: 30000 });
  await ap.waitForTimeout(2000);
  await ap.locator('a.item-nav').first().click();
  await ap.waitForTimeout(1000);
  await ap.locator('li#Administration > a.dropnav').waitFor({ state: 'visible', timeout: 10000 });
  await ap.locator('li#Administration > a.dropnav').click();
  await ap.waitForTimeout(500);
  await ap.locator('li#setupAdm > a.s-dropnav').waitFor({ state: 'visible', timeout: 10000 });
  await ap.locator('li#setupAdm > a.s-dropnav').click();
  await ap.waitForTimeout(500);
  await ap.locator('li#COUNTRYMST > a').click();
  await ap.waitForTimeout(3000);

  // Count all rows before search
  const totalRows = await ap.locator('table tbody tr').count();
  console.log('Total rows before search:', totalRows);

  // Get page HTML snippet around tables
  const html = await ap.content();
  const tableMatches = [...html.matchAll(/<table[^>]*id="([^"]*)"[^>]*>/g)];
  console.log('Table IDs:', tableMatches.map(m => m[1]));

  // Try search
  const si = ap.locator('.dataTables_filter input, #searchInput, input[type="search"]').first();
  await si.fill('IND');
  await ap.waitForTimeout(2000);

  const rowsAfter = await ap.locator('table tbody tr').count();
  console.log('Rows after search IND:', rowsAfter);

  // Get first row text
  for (let i = 0; i < Math.min(rowsAfter, 3); i++) {
    const txt = await ap.locator('table tbody tr').nth(i).innerText().catch(() => 'N/A');
    console.log('Row', i, ':', txt.replace(/\s+/g, ' ').trim().substring(0, 100));
  }

  // Check edit button
  const editBtn = ap.locator('table tbody tr').filter({ hasText: 'IND' }).first().locator('a.btn-edit, .edit-btn, a[title="Edit"], a[title="edit"]');
  const editCount = await editBtn.count();
  console.log('Edit buttons in IND row:', editCount);

  // Check all links in IND row
  const links = await ap.locator('table tbody tr').filter({ hasText: 'IND' }).first().locator('a').all();
  for (const link of links) {
    const title = await link.getAttribute('title').catch(() => '');
    const cls   = await link.getAttribute('class').catch(() => '');
    const txt   = await link.innerText().catch(() => '');
    console.log('Link:', { title, cls, txt });
  }

  await ap.waitForTimeout(8000);
  await browser.close();
})();

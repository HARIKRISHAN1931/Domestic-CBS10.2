const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
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

  // Get all table IDs
  const tables = await ap.evaluate(function() {
    return Array.from(document.querySelectorAll('table')).map(function(t) {
      return { id: t.id, classes: t.className.substring(0, 60) };
    });
  });
  console.log('Tables:', JSON.stringify(tables, null, 2));

  // Check search inputs
  const inputs = await ap.evaluate(function() {
    return Array.from(document.querySelectorAll('input[type="search"], #searchInput, .dataTables_filter input')).map(function(el) {
      return { id: el.id, name: el.name, placeholder: el.placeholder };
    });
  });
  console.log('Search inputs:', JSON.stringify(inputs));

  // Fill search
  const si = ap.locator('.dataTables_filter input, #searchInput, input[type="search"]').first();
  const siVisible = await si.isVisible().catch(function() { return false; });
  console.log('Search input visible:', siVisible);
  if (siVisible) {
    await si.fill('IND');
    await ap.waitForTimeout(2000);
    const rows = await ap.locator('table tbody tr').allInnerTexts();
    console.log('Rows after search IND:', rows.slice(0, 5));
  }

  await ap.waitForTimeout(8000);
  await browser.close();
})();

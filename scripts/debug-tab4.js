const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const context = await browser.newContext();
  const page    = await context.newPage();

  await page.goto('http://172.21.0.39:7999/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en');
  await page.waitForLoadState('domcontentloaded');
  await page.fill('#loginId', 'demo1');
  await page.locator('#loginId').press('Tab');
  await page.fill('#uiPwd', 'Abcd@1243');
  const [app] = await Promise.all([
    context.waitForEvent('page', { timeout: 30_000 }),
    page.click('#userLogin'),
  ]);
  await app.waitForLoadState('domcontentloaded');
  await app.locator('a.item-nav').waitFor({ state: 'visible', timeout: 15_000 });

  // Navigate
  await app.locator('a.item-nav').first().click();
  await app.locator('li#Masters > a.dropnav').waitFor({ state: 'visible', timeout: 10_000 });
  await app.locator('li#Masters > a.dropnav').click();
  await app.locator('li#customermgmt > a.s-dropnav').waitFor({ state: 'visible', timeout: 8_000 });
  await app.locator('li#customermgmt > a.s-dropnav').click();
  await app.locator('li#CUSTOMER > a').waitFor({ state: 'visible', timeout: 8_000 });
  await app.locator('li#CUSTOMER > a').click();
  await app.waitForLoadState('networkidle').catch(() => {});

  const addBtn = app.locator('#addButton, button.add').first();
  await addBtn.waitFor({ state: 'visible', timeout: 10_000 });
  await Promise.all([
    app.waitForURL('**/addNewMember**', { timeout: 15_000 }),
    addBtn.click({ force: true }),
  ]);
  await app.locator('#customerCategory').waitFor({ state: 'visible', timeout: 15_000 });

  // Fill Tab 1
  await app.locator('#customerCategory').selectOption('1');
  await app.locator('#memberFName').fill('ISHAN');
  await app.locator('#memberLName').fill('SRI');
  await app.locator('#memberDOB').fill('01-01-1999');
  await app.locator('#memberDOB').press('Tab');
  await app.waitForTimeout(1000);

  // Tab 2
  await app.locator('#nextBtn').click();
  await app.waitForLoadState('domcontentloaded').catch(() => {});
  await app.waitForTimeout(2000);

  // Tab 3
  await app.locator('#nextBtn').click();
  await app.waitForLoadState('domcontentloaded').catch(() => {});
  await app.waitForTimeout(2000);

  // Tab 4
  await app.locator('#nextBtn').click();
  await app.waitForLoadState('domcontentloaded').catch(() => {});
  await app.waitForTimeout(2000);
  await app.screenshot({ path: 'scripts/debug-tab4-blank.png' });
  console.log('Tab 4 URL:', app.url());

  // All inputs/selects
  const fields = await app.evaluate(() =>
    Array.from(document.querySelectorAll('input[id], select[id]')).map(el => ({
      id:      el.id,
      tag:     el.tagName,
      visible: el.offsetParent !== null,
      value:   el.value,
      disabled: el.disabled,
    }))
  );
  console.log('\n=== TAB 4 FIELDS ===');
  console.table(fields);

  // proofType options
  const ptOpts = await app.evaluate(() => {
    const s = document.querySelector('#proofType');
    return s ? Array.from(s.options).map(o => `${o.value}=${o.text}`) : ['NOT FOUND'];
  });
  console.log('\nproofType options:', ptOpts);

  // Try selecting proofType=2
  const ptVisible = await app.locator('#proofType').isVisible({ timeout: 2000 }).catch(() => false);
  console.log(`\n#proofType visible: ${ptVisible}`);
  if (ptVisible) {
    await app.locator('#proofType').selectOption('2');
    await app.waitForTimeout(1000);
    // docType options after selecting proofType
    const dtOpts = await app.evaluate(() => {
      const s = document.querySelector('#docType');
      return s ? Array.from(s.options).map(o => `${o.value}=${o.text}`) : ['NOT FOUND'];
    });
    console.log('docType options after proofType=2:', dtOpts);
    await app.screenshot({ path: 'scripts/debug-tab4-prooftype.png' });
  }

  // Fill document fields
  await app.locator('#idNumber').fill('TEST123').catch(() => console.log('idNumber fill failed'));
  await app.locator('#nameAsInDocument').fill('ISHAN SRI').catch(() => console.log('nameAsInDocument fill failed'));
  await app.locator('#issuedByCountry').selectOption('1').catch(() => console.log('issuedByCountry failed'));

  // Check btnAdd
  const btnAddVis = await app.locator('#btnAdd').isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`\n#btnAdd visible: ${btnAddVis}`);

  if (btnAddVis) {
    await app.locator('#btnAdd').scrollIntoViewIfNeeded();
    await app.locator('#btnAdd').click();
    await app.waitForTimeout(1500);
    await app.screenshot({ path: 'scripts/debug-tab4-after-add.png' });
    console.log('Clicked #btnAdd. Screenshot saved.');

    // Check if a row was added to the document table
    const rows = await app.evaluate(() => {
      const tbody = document.querySelector('#docDetailsTable tbody, table tbody');
      return tbody ? tbody.querySelectorAll('tr').length : 0;
    });
    console.log(`Document table rows after add: ${rows}`);
  }

  await browser.close();
})();

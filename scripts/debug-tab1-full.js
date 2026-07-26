const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
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
  console.log('Tab 1 loaded');

  // Helper: get select options via Playwright
  async function getOptions(id) {
    const opts = await app.locator(`#${id} option`).allInnerTexts().catch(() => []);
    const vals = await app.locator(`#${id} option`).evaluateAll(els => els.map(e => e.value)).catch(() => []);
    return opts.map((t, i) => `${vals[i]}=${t.trim()}`);
  }

  // Helper: check visibility
  async function vis(id) {
    return app.locator(`#${id}`).isVisible({ timeout: 500 }).catch(() => false);
  }

  // All select IDs to check
  const selectIds = [
    'customerCategory','customerType','customerBranch','AMLRating','memRole',
    'nameTitle','memberGender','nationality','mbrMaritalStatus',
    'residentialStatus','docProof'
  ];

  console.log('\n=== DROPDOWN OPTIONS ===');
  for (const id of selectIds) {
    const visible = await vis(id);
    if (visible) {
      const opts = await getOptions(id);
      console.log(`\n${id} (visible): ${JSON.stringify(opts)}`);
    } else {
      console.log(`${id}: NOT VISIBLE`);
    }
  }

  // All input IDs to check
  const inputIds = [
    'memberFName','memberMName','memberLName',
    'motherFname','motherMname','motherLname',
    'spouseFname','spouseMname','spouseLname',
    'memberDOB','pan','idType','memberMonthlyInc'
  ];
  console.log('\n=== INPUT VISIBILITY ===');
  for (const id of inputIds) {
    const visible = await vis(id);
    console.log(`${id}: ${visible ? 'VISIBLE' : 'hidden'}`);
  }

  // Radio buttons
  const radioIds = ['residentY','residentN','form60Y','form60N','disabilityY','disabilityN'];
  console.log('\n=== RADIO VISIBILITY ===');
  for (const id of radioIds) {
    const visible = await vis(id);
    console.log(`${id}: ${visible ? 'VISIBLE' : 'hidden'}`);
  }

  // Now fill customerCategory and check what changes
  console.log('\n--- Selecting customerCategory=1 ---');
  await app.locator('#customerCategory').selectOption('1');
  await app.waitForTimeout(1500);

  console.log('\n=== VISIBLE AFTER customerCategory=1 ===');
  for (const id of [...selectIds, ...inputIds, ...radioIds]) {
    const visible = await vis(id);
    if (visible) console.log(`  ${id}: VISIBLE`);
  }

  await app.screenshot({ path: 'scripts/tab1-filled-cat.png' });

  // Fill all visible fields
  if (await vis('nameTitle'))         await app.locator('#nameTitle').selectOption({ index: 1 });
  await app.locator('#memberFName').fill('ISHAN');
  await app.locator('#memberLName').fill('SRI');
  await app.locator('#memberDOB').fill('01-01-1999');
  await app.locator('#memberDOB').press('Tab');
  await app.waitForTimeout(1000);

  if (await vis('memberGender'))      await app.locator('#memberGender').selectOption({ index: 1 });
  if (await vis('nationality'))       await app.locator('#nationality').selectOption({ index: 1 });
  if (await vis('mbrMaritalStatus'))  await app.locator('#mbrMaritalStatus').selectOption({ index: 1 });
  if (await vis('residentialStatus')) await app.locator('#residentialStatus').selectOption({ index: 1 });
  if (await vis('residentY'))         await app.locator('#residentY').click();
  if (await vis('form60N'))           await app.locator('#form60N').click();
  if (await vis('disabilityN'))       await app.locator('#disabilityN').click();

  await app.screenshot({ path: 'scripts/tab1-filled-all.png' });
  console.log('\nTab 1 filled. Trying Next...');

  // Try clicking Next
  const nextVisible = await app.locator('#nextBtn').isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`#nextBtn visible: ${nextVisible}`);
  if (nextVisible) {
    await app.locator('#nextBtn').click();
    await app.waitForTimeout(3000);
    await app.screenshot({ path: 'scripts/tab2-loaded.png' });
    console.log('After Next URL:', app.url());

    // Check if we moved to Tab 2 or got validation errors
    const errMsgs = await app.locator('.error-msg, .field-error, .alert-danger, .toast-messages .msg-error em')
      .allInnerTexts().catch(() => []);
    if (errMsgs.length) console.log('ERRORS:', errMsgs);
    else console.log('No errors — Tab 2 loaded successfully');
  }

  await browser.close();
})();

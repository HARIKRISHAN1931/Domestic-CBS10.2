const { chromium } = require('@playwright/test');

(async () => {
  const browser  = await chromium.launch({ headless: false, slowMo: 200 });
  const context  = await browser.newContext();
  const loginPage = await context.newPage();

  await loginPage.goto('http://172.21.0.39:7999/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en');
  await loginPage.locator('#loginId').fill('demo1');
  await loginPage.locator('#uiPwd').fill('Abcd@1243');
  await loginPage.locator('#userLogin').click();

  const appPage = await context.waitForEvent('page');
  await appPage.waitForSelector('a.item-nav', { timeout: 30000 });
  await appPage.waitForTimeout(2000);

  await appPage.locator('a.item-nav').first().click();
  await appPage.waitForTimeout(1000);
  const adminToggle = appPage.locator('li#Administration > a.dropnav');
  await adminToggle.waitFor({ state: 'visible', timeout: 10000 });
  await adminToggle.click();
  await appPage.waitForTimeout(500);
  const subToggle = appPage.locator('li#setupAdm > a.s-dropnav');
  await subToggle.waitFor({ state: 'visible', timeout: 10000 });
  await subToggle.click();
  await appPage.waitForTimeout(500);
  await appPage.locator('li#COUNTRYMST > a').click();
  await appPage.waitForTimeout(3000);

  // Read existing records from the grid (authorized tab)
  const rows = await appPage.locator('table tbody tr').allInnerTexts().catch(() => []);
  console.log('Grid rows (first 5):');
  rows.slice(0, 5).forEach((r, i) => console.log(`  [${i}]`, r.replace(/\s+/g, ' ').trim()));

  // Click edit on first row to see what values are used
  const editBtn = appPage.locator('a.btn-edit, .edit-btn, a[title="Edit"]').first();
  const hasEdit = await editBtn.isVisible({ timeout: 3000 }).catch(() => false);
  if (hasEdit) {
    await editBtn.click();
    await appPage.waitForTimeout(2000);

    // Read dropdown selected values
    for (const id of ['countryType','isdCode','zone','region']) {
      const val  = await appPage.locator(`#${id}`).inputValue().catch(() => 'N/A');
      const opts = await appPage.locator(`#${id} option`).allInnerTexts().catch(() => []);
      console.log(`\n${id}: selected="${val}", options=[${opts.join(' | ')}]`);
    }
  } else {
    console.log('No edit button found — checking pending tab');
    // Try pending data table
    const pendingRows = await appPage.locator('#dt-pendingdata tbody tr').allInnerTexts().catch(() => []);
    console.log('Pending rows:', pendingRows.slice(0, 3));
  }

  await appPage.waitForTimeout(8000);
  await browser.close();
})();

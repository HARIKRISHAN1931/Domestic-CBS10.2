import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { CorporateCustomerPage } from '../src/index';

const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'customermgmt', 'CORPCUSTOMER');
const ERR = '.toast-messages .msg-toast.msg-error em, .field-error, .error-msg, .has-error .help-block';

test.describe('Corporate Customer — Negative @regression', () => {

  test('should fail save when all mandatory fields are empty', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const screen = new CorporateCustomerPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    const saveBtn = authenticatedPage.locator('#saveCustomer, #btnSave, button.cnf-btn, button:has-text("Save")').first();
    await saveBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await saveBtn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should fail save when Company Name is missing', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const screen = new CorporateCustomerPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    // Fill everything except memberFName (company name)
    await authenticatedPage.locator('#registrationNo').fill('REG999999').catch(() => {});
    await authenticatedPage.locator('#dateOfEstablishment').fill('01-01-2010').catch(() => {});

    const saveBtn = authenticatedPage.locator('#saveCustomer, #btnSave, button.cnf-btn, button:has-text("Save")').first();
    await saveBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await saveBtn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should fail save when Mobile Number is missing', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const screen = new CorporateCustomerPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    await authenticatedPage.locator('#memberFName').fill('TestCorp').catch(() => {});
    await authenticatedPage.locator('#registrationNo').fill('REG999999').catch(() => {});
    await authenticatedPage.locator('#dateOfEstablishment').fill('01-01-2010').catch(() => {});
    await authenticatedPage.locator('#address1').fill('Test Address').catch(() => {});
    // mobileNo1 intentionally left empty

    const saveBtn = authenticatedPage.locator('#saveCustomer, #btnSave, button.cnf-btn, button:has-text("Save")').first();
    await saveBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await saveBtn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

});

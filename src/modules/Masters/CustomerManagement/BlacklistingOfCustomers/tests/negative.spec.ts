import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { BlacklistingOfCustomersPage } from '../src/BlacklistingOfCustomersPage';

const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'customermgmt', 'BLACKLISTINGOFCUSTOMERS');
const ERR = '.toast-messages .msg-toast.msg-error em, .field-error, .error-msg, .has-error .help-block';

test.describe('Blacklisting Of Customers — Negative @regression', () => {

  test('should fail save when all mandatory fields are empty', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const screen = new BlacklistingOfCustomersPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    const saveBtn = authenticatedPage.locator(
      '#saveBlacklist, #saveCustBlacklist, #saveDepositeparamDetails, #saveCustomerDetails, button[id*="save"], input[id*="save"]'
    ).filter({ visible: true }).first();
    await saveBtn.waitFor({ state: 'attached', timeout: 10_000 });
    await saveBtn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should fail save when Customer Number is missing', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const screen = new BlacklistingOfCustomersPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    // Fill reason and date but leave custNo empty
    await authenticatedPage.locator('#blacklistReason').selectOption({ index: 1 }).catch(() => {});
    await authenticatedPage.locator('#blacklistDate').fill('01-01-2024').catch(() => {});

    const saveBtn = authenticatedPage.locator(
      '#saveBlacklist, #saveCustBlacklist, #saveDepositeparamDetails, #saveCustomerDetails, button[id*="save"], input[id*="save"]'
    ).filter({ visible: true }).first();
    await saveBtn.waitFor({ state: 'attached', timeout: 10_000 });
    await saveBtn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should fail save when Blacklist Reason is missing', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const screen = new BlacklistingOfCustomersPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    // Fill custNo and date but leave reason empty
    const custField = authenticatedPage.locator('#custNo, #customerNo, #customerId').first();
    await custField.fill('999999').catch(() => {});
    await custField.press('Tab').catch(() => {});
    await authenticatedPage.locator('#blacklistDate').fill('01-01-2024').catch(() => {});

    const saveBtn = authenticatedPage.locator(
      '#saveBlacklist, #saveCustBlacklist, #saveDepositeparamDetails, #saveCustomerDetails, button[id*="save"], input[id*="save"]'
    ).filter({ visible: true }).first();
    await saveBtn.waitFor({ state: 'attached', timeout: 10_000 });
    await saveBtn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should fail save when Blacklist Date is missing', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const screen = new BlacklistingOfCustomersPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    // Fill custNo and reason but leave date empty
    const custField = authenticatedPage.locator('#custNo, #customerNo, #customerId').first();
    await custField.fill('999999').catch(() => {});
    await custField.press('Tab').catch(() => {});
    await authenticatedPage.locator('#blacklistReason').selectOption({ index: 1 }).catch(() => {});

    const saveBtn = authenticatedPage.locator(
      '#saveBlacklist, #saveCustBlacklist, #saveDepositeparamDetails, #saveCustomerDetails, button[id*="save"], input[id*="save"]'
    ).filter({ visible: true }).first();
    await saveBtn.waitFor({ state: 'attached', timeout: 10_000 });
    await saveBtn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should fail save with invalid Customer Number', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const screen = new BlacklistingOfCustomersPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    const custField = authenticatedPage.locator('#custNo, #customerNo, #customerId').first();
    await custField.fill('INVALID999').catch(() => {});
    await custField.press('Tab').catch(() => {});

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

});

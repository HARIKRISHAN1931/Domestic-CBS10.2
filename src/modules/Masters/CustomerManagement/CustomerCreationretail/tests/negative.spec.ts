import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { CustomerCreationPage } from '../src/CustomerCreationPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'customermgmt', 'CUSTOMER');

test.describe('Customer Creation — Negative @regression', () => {

  test('should fail save when mandatory fields are empty', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const screen = new CustomerCreationPage(authenticatedPage);

    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    // Attempt save without filling any fields
    const btn = (screen as any).loc('#saveDepositeparamDetails').first();
    await btn.waitFor({ state: 'attached', timeout: 10_000 });
    await btn.evaluate((el: HTMLElement) => el.click());

    // Expect error toast or validation message — no modal should appear
    const errToast = authenticatedPage.locator('.toast-messages .msg-toast.msg-error em, .field-error, .error-msg').first();
    await expect(errToast).toBeVisible({ timeout: 10_000 });
  });

});

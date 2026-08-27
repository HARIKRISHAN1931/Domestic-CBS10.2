import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { CustomerCreationPage } from '../src/CustomerCreationPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'customermgmt', 'CUSTOMER');
const ERR = '.toast-messages .msg-toast.msg-error em, .field-error, .error-msg, .has-error .help-block';

test.describe('Customer Creation — Negative @regression', () => {

  test('should fail save when all mandatory fields are empty', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const screen = new CustomerCreationPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    const btn = (screen as any).loc('#saveDepositeparamDetails').first();
    await btn.waitFor({ state: 'attached', timeout: 10_000 });
    await btn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should show validation when First Name is missing', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const screen = new CustomerCreationPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    // Fill only mandatory fields except First Name
    await (screen as any).sel('customerCategory', '1');
    await (screen as any).inp('memberLName', 'TestLast');
    await (screen as any).inp('memberDOB', '01-01-1990');
    await (screen as any).v('memberDOB').press('Tab');

    const btn = (screen as any).loc('#saveDepositeparamDetails').first();
    await btn.waitFor({ state: 'attached', timeout: 10_000 });
    await btn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should show validation when Last Name is missing', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const screen = new CustomerCreationPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    await (screen as any).sel('customerCategory', '1');
    await (screen as any).inp('memberFName', 'TestFirst');
    await (screen as any).inp('memberDOB', '01-01-1990');
    await (screen as any).v('memberDOB').press('Tab');

    const btn = (screen as any).loc('#saveDepositeparamDetails').first();
    await btn.waitFor({ state: 'attached', timeout: 10_000 });
    await btn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should show validation when Date of Birth is missing', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const screen = new CustomerCreationPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    await (screen as any).sel('customerCategory', '1');
    await (screen as any).inp('memberFName', 'TestFirst');
    await (screen as any).inp('memberLName', 'TestLast');
    // DOB intentionally left empty

    const btn = (screen as any).loc('#saveDepositeparamDetails').first();
    await btn.waitFor({ state: 'attached', timeout: 10_000 });
    await btn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should reject invalid PAN format', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const screen = new CustomerCreationPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    await (screen as any).sel('customerCategory', '1');
    await (screen as any).inp('memberFName', 'TestFirst');
    await (screen as any).inp('memberLName', 'TestLast');
    await (screen as any).inp('memberDOB', '01-01-1990');
    await (screen as any).v('memberDOB').press('Tab');
    await (screen as any).inp('pan', 'INVALID123');  // not AAAAA9999A format

    const btn = (screen as any).loc('#saveDepositeparamDetails').first();
    await btn.waitFor({ state: 'attached', timeout: 10_000 });
    await btn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should reject invalid mobile number (less than 10 digits)', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const screen = new CustomerCreationPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    await (screen as any).sel('customerCategory', '1');
    await (screen as any).inp('memberFName', 'TestFirst');
    await (screen as any).inp('memberLName', 'TestLast');
    await (screen as any).inp('memberDOB', '01-01-1990');
    await (screen as any).v('memberDOB').press('Tab');

    // Navigate to contact tab and enter invalid mobile
    await (screen as any).clickNext('addressType');
    await (screen as any).inp('mobileNo1', '12345');  // too short

    const btn = (screen as any).loc('#saveDepositeparamDetails').first();
    await btn.waitFor({ state: 'attached', timeout: 10_000 });
    await btn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should reject invalid email format', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const screen = new CustomerCreationPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    await (screen as any).sel('customerCategory', '1');
    await (screen as any).inp('memberFName', 'TestFirst');
    await (screen as any).inp('memberLName', 'TestLast');
    await (screen as any).inp('memberDOB', '01-01-1990');
    await (screen as any).v('memberDOB').press('Tab');

    await (screen as any).clickNext('addressType');
    await (screen as any).inp('emailId', 'not-an-email');  // invalid format

    const btn = (screen as any).loc('#saveDepositeparamDetails').first();
    await btn.waitFor({ state: 'attached', timeout: 10_000 });
    await btn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

});

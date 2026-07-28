import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { EmployeeMasterPage } from '../src/EmployeeMasterPage';
import { EmployeeMasterBuilder } from '../src/EmployeeMasterBuilder';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'usermgmtAdm', 'EMPLOYEEMST');
const ERR = (page: any) => page.locator('.toast-messages .msg-toast.msg-error em, .error-msg').first();

test.describe('Employee Master > Negative @regression', () => {

  // ── Mandatory field validations ───────────────────────────────────────────────

  test('should show error when Employee ID is missing', async ({ authenticatedPage }) => {
    const screen = new EmployeeMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    await test.step('Save without empId', async () => {
      await screen.fillForm({ empFName: 'Test', joinDate: '01-01-2020' });
      await authenticatedPage.locator('a.button.sm.btn-save').first().click({ force: true });
      await expect(ERR(authenticatedPage)).toBeVisible({ timeout: 5_000 });
    });
  });

  test('should show error when First Name is missing', async ({ authenticatedPage }) => {
    const screen = new EmployeeMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    await test.step('Save without empFName', async () => {
      await screen.fillForm({ empId: 'EMPNEG01', joinDate: '01-01-2020' });
      await authenticatedPage.locator('a.button.sm.btn-save').first().click({ force: true });
      await expect(ERR(authenticatedPage)).toBeVisible({ timeout: 5_000 });
    });
  });

  test('should show error when Joining Date is missing', async ({ authenticatedPage }) => {
    const screen = new EmployeeMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    await test.step('Save without joinDate', async () => {
      await screen.fillForm({ empId: 'EMPNEG02', empFName: 'Test' });
      await authenticatedPage.locator('a.button.sm.btn-save').first().click({ force: true });
      await expect(ERR(authenticatedPage)).toBeVisible({ timeout: 5_000 });
    });
  });

  // ── Business rule validations ─────────────────────────────────────────────────

  test('should show error for duplicate Employee ID', async ({ authenticatedPage }) => {
    const data   = new EmployeeMasterBuilder().withEmpId('EMP00001').build();
    const screen = new EmployeeMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    await test.step('Try to create duplicate', async () => {
      await screen.fillForm(data);
      await authenticatedPage.locator('a.button.sm.btn-save').first().click({ force: true });
      await expect(ERR(authenticatedPage)).toBeVisible({ timeout: 5_000 });
    });
  });

  test('should show error for invalid mobile number (too short)', async ({ authenticatedPage }) => {
    const data   = new EmployeeMasterBuilder().withMobile('123').build();
    const screen = new EmployeeMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    await test.step('Fill with invalid mobile', async () => {
      await screen.fillForm(data);
      await authenticatedPage.locator('a.button.sm.btn-save').first().click({ force: true });
      await expect(ERR(authenticatedPage)).toBeVisible({ timeout: 5_000 });
    });
  });

  test('should show error for invalid email format', async ({ authenticatedPage }) => {
    const data   = new EmployeeMasterBuilder().withEmail('not-an-email').build();
    const screen = new EmployeeMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    await test.step('Fill with invalid email', async () => {
      await screen.fillForm(data);
      await authenticatedPage.locator('a.button.sm.btn-save').first().click({ force: true });
      await expect(ERR(authenticatedPage)).toBeVisible({ timeout: 5_000 });
    });
  });

  test('should show error for future joining date', async ({ authenticatedPage }) => {
    const data   = new EmployeeMasterBuilder().withJoinDate('01-01-2099').build();
    const screen = new EmployeeMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    await test.step('Fill with future join date', async () => {
      await screen.fillForm(data);
      await authenticatedPage.locator('a.button.sm.btn-save').first().click({ force: true });
      await expect(ERR(authenticatedPage)).toBeVisible({ timeout: 5_000 });
    });
  });

  test('should show error when birth date is after joining date', async ({ authenticatedPage }) => {
    const data   = new EmployeeMasterBuilder()
      .withJoinDate('01-01-2000')
      .withBirthDate('01-01-2010')  // born after joining — invalid
      .build();
    const screen = new EmployeeMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    await test.step('Fill with invalid birth/join dates', async () => {
      await screen.fillForm(data);
      await authenticatedPage.locator('a.button.sm.btn-save').first().click({ force: true });
      await expect(ERR(authenticatedPage)).toBeVisible({ timeout: 5_000 });
    });
  });

  // ── Boundary validations ──────────────────────────────────────────────────────

  test('should show error for Employee ID exceeding max length', async ({ authenticatedPage }) => {
    const data   = new EmployeeMasterBuilder().withEmpId('A'.repeat(51)).build();
    const screen = new EmployeeMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    await test.step('Fill with oversized empId', async () => {
      await screen.fillForm(data);
      await authenticatedPage.locator('a.button.sm.btn-save').first().click({ force: true });
      await expect(ERR(authenticatedPage)).toBeVisible({ timeout: 5_000 });
    });
  });

  test('should show error for mobile number with alphabets', async ({ authenticatedPage }) => {
    const data   = new EmployeeMasterBuilder().withMobile('ABCDEFGHIJ').build();
    const screen = new EmployeeMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    await test.step('Fill with alpha mobile', async () => {
      await screen.fillForm(data);
      await authenticatedPage.locator('a.button.sm.btn-save').first().click({ force: true });
      await expect(ERR(authenticatedPage)).toBeVisible({ timeout: 5_000 });
    });
  });

});

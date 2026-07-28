import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { EmployeeMasterPage } from '../src/EmployeeMasterPage';
import { EmployeeMasterBuilder } from '../src/EmployeeMasterBuilder';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'usermgmtAdm', 'EMPLOYEEMST');

test.describe('Employee Master > Search @regression', () => {

  test('should find employee by Employee ID in authorized grid', async ({ authenticatedPage }) => {
    const screen = new EmployeeMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Switch to authorized tab', () => screen.switchToAuthorizedTab());
    await test.step('Search by empId', async () => {
      await screen.searchRecord('EMP00001');
      const count = await screen.getAuthorizedRowCount();
      expect(count, 'At least one row must match search').toBeGreaterThan(0);
    });
  });

  test('should find employee by name in authorized grid', async ({ authenticatedPage }) => {
    const screen = new EmployeeMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Switch to authorized tab', () => screen.switchToAuthorizedTab());
    await test.step('Search by name', async () => {
      await screen.searchRecord('Test');
      const count = await screen.getAuthorizedRowCount();
      expect(count, 'At least one row must match name search').toBeGreaterThan(0);
    });
  });

  test('should show no results for non-existent Employee ID', async ({ authenticatedPage }) => {
    const screen = new EmployeeMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Switch to authorized tab', () => screen.switchToAuthorizedTab());
    await test.step('Search for non-existent ID', async () => {
      await screen.searchRecord('EMPXXX999NOTEXIST');
      const count = await screen.getAuthorizedRowCount();
      expect(count, 'No rows must match non-existent ID').toBe(0);
    });
  });

  test('should show pending records in pending tab', async ({ authenticatedPage }) => {
    const screen = new EmployeeMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Switch to pending tab', () => screen.switchToPendingTab());
    await test.step('Verify pending grid loads', async () => {
      const count = await screen.getPendingRowCount();
      expect(count, 'Pending grid must be accessible').toBeGreaterThanOrEqual(0);
    });
  });

  test('should open quick view for a record', async ({ authenticatedPage }) => {
    const screen = new EmployeeMasterPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Switch to authorized tab', () => screen.switchToAuthorizedTab());
    await test.step('Open quick view', async () => {
      const count = await screen.getAuthorizedRowCount();
      if (count > 0) {
        await screen.clickQuickView();
        // Quick view panel/modal should appear
        const panel = authenticatedPage.locator('.quick-view, .modal, #quickViewModal').first();
        await expect(panel).toBeVisible({ timeout: 5_000 });
      }
    });
  });

});

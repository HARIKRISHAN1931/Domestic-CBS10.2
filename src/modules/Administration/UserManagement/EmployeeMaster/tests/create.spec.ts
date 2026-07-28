import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { EmployeeMasterPage } from '../src/EmployeeMasterPage';
import { EmployeeMasterBuilder, EmployeeMasterValidator } from '../src/EmployeeMasterBuilder';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'usermgmtAdm', 'EMPLOYEEMST');

test.describe('Employee Master > Create @smoke @regression', () => {
  test.setTimeout(180_000);

  test('should create employee with all fields', async ({ authenticatedPage }) => {
    const data      = new EmployeeMasterBuilder().build();
    const screen    = new EmployeeMasterPage(authenticatedPage);
    const validator = new EmployeeMasterValidator();

    await test.step('Navigate to Employee Master', () => NAV(authenticatedPage));
    await test.step('Open create form',            () => screen.openCreateForm());
    await test.step('Fill all fields',             () => screen.fillForm(data));
    await authenticatedPage.pause(); // DEBUG: check form state before save
    const toast = await test.step('Save',          () => screen.save());
    console.log('Toast:', toast, '| EmpId:', data.empId);
    validator.validateCreated(toast);

    await test.step('Verify record in pending grid', async () => {
      await screen.switchToPendingTab();
      await authenticatedPage.waitForTimeout(500);
      const found = await screen.isRecordInPendingGrid(data.empId!);
      expect(found, `${data.empId} must appear in pending grid`).toBe(true);
    });
  });

});

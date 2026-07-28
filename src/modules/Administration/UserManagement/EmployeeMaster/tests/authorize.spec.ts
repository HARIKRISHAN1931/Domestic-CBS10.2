import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { EmployeeMasterPage, EmployeeMasterData } from '../src/EmployeeMasterPage';
import { EmployeeMasterValidator } from '../src/EmployeeMasterBuilder';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/UserManagement/EmployeeMaster/data/employee-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'usermgmtAdm', 'EMPLOYEEMST');

test.describe('Employee Master > Authorize @regression', () => {

  test('should approve pending employee record', async ({ authenticatedPage }) => {
    const rows      = await ExcelHelper.readSheet<EmployeeMasterData>(DATA_FILE, 'Authorize');
    const data      = rows[0];
    const screen    = new EmployeeMasterPage(authenticatedPage);
    const validator = new EmployeeMasterValidator();

    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Switch to pending tab', () => screen.switchToPendingTab());
    await test.step('Verify record in pending grid', async () => {
      const found = await screen.isRecordInPendingGrid(data.empId!);
      expect(found, `${data.empId} must be in pending grid before approve`).toBe(true);
    });
    const toast = await test.step('Approve', () => screen.approve(data.empId!));
    validator.validateApproved(toast);
    await test.step('Switch to authorized tab', () => screen.switchToAuthorizedTab());
    await test.step('Verify record moved to authorized grid', async () => {
      const found = await screen.isRecordInAuthorizedGrid(data.empId!);
      expect(found, `${data.empId} must appear in authorized grid after approve`).toBe(true);
    });
  });

  test('should reject pending employee record with remark', async ({ authenticatedPage }) => {
    const rows      = await ExcelHelper.readSheet<EmployeeMasterData>(DATA_FILE, 'Authorize');
    const data      = rows[1] ?? rows[0];  // use second row if available
    const screen    = new EmployeeMasterPage(authenticatedPage);
    const validator = new EmployeeMasterValidator();

    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Switch to pending tab', () => screen.switchToPendingTab());
    const toast = await test.step('Reject with remark', () =>
      screen.reject(data.empId!, 'Rejected by automation — invalid data')
    );
    validator.validateRejected(toast);
  });

  test('should verify pending count decreases after approve', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<EmployeeMasterData>(DATA_FILE, 'Authorize');
    const data   = rows[0];
    const screen = new EmployeeMasterPage(authenticatedPage);

    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Switch to pending tab', () => screen.switchToPendingTab());
    const countBefore = await test.step('Get pending count before', () => screen.getPendingRowCount());
    await test.step('Approve', () => screen.approve(data.empId!));
    await test.step('Switch to pending tab again', () => screen.switchToPendingTab());
    const countAfter = await test.step('Get pending count after', () => screen.getPendingRowCount());
    expect(countAfter, 'Pending count must decrease after approve').toBeLessThan(countBefore);
  });

});

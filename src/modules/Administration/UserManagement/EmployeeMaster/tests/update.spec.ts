import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { EmployeeMasterPage, EmployeeMasterData } from '../src/EmployeeMasterPage';
import { EmployeeMasterBuilder, EmployeeMasterValidator } from '../src/EmployeeMasterBuilder';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/UserManagement/EmployeeMaster/data/employee-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'usermgmtAdm', 'EMPLOYEEMST');

test.describe('Employee Master > Update @regression', () => {

  test('should update employee name and contact from Excel', async ({ authenticatedPage }) => {
    const rows      = await ExcelHelper.readSheet<EmployeeMasterData>(DATA_FILE, 'Update');
    const data      = rows[0];
    const screen    = new EmployeeMasterPage(authenticatedPage);
    const validator = new EmployeeMasterValidator();

    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Search, edit and save', () =>
      screen.update(data.empId!, { empFName: data.empFName, email: data.email, mobile: data.mobile })
    );
    validator.validateUpdated(toast);
  });

  test('should update designation and department', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<EmployeeMasterData>(DATA_FILE, 'Update');
    const data   = rows[0];
    const screen = new EmployeeMasterPage(authenticatedPage);
    const validator = new EmployeeMasterValidator();

    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Update designation and dept', () =>
      screen.update(data.empId!, { designation: 'BRANCH MANAGER', dept: 'OPERATIONS' })
    );
    validator.validateUpdated(toast);
  });

  test('should update marital status to married and add spouse name', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<EmployeeMasterData>(DATA_FILE, 'Update');
    const data   = rows[0];
    const screen = new EmployeeMasterPage(authenticatedPage);
    const validator = new EmployeeMasterValidator();

    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Update marital status', () =>
      screen.update(data.empId!, { maritalStatus: 'MARRIED', empSpouseName: 'Spouse Name' })
    );
    validator.validateUpdated(toast);
  });

  test('should update employment type to contract', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<EmployeeMasterData>(DATA_FILE, 'Update');
    const data   = rows[0];
    const screen = new EmployeeMasterPage(authenticatedPage);
    const validator = new EmployeeMasterValidator();

    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Update employment type', () =>
      screen.update(data.empId!, { employmentType: '3' })  // Contract
    );
    validator.validateUpdated(toast);
  });

  test('should update address fields', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<EmployeeMasterData>(DATA_FILE, 'Update');
    const data   = rows[0];
    const screen = new EmployeeMasterPage(authenticatedPage);
    const validator = new EmployeeMasterValidator();

    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Update address', () =>
      screen.update(data.empId!, {
        address1:   '456 New Street',
        address2:   'New Area',
        address3:   'Pune',
        postalCode: '411001',
      })
    );
    validator.validateUpdated(toast);
  });

  test('should update status to suspended', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<EmployeeMasterData>(DATA_FILE, 'Update');
    const data   = rows[0];
    const screen = new EmployeeMasterPage(authenticatedPage);
    const validator = new EmployeeMasterValidator();

    await test.step('Navigate', () => NAV(authenticatedPage));
    const toast = await test.step('Update status to suspended', () =>
      screen.update(data.empId!, { status: '2' })  // Suspended
    );
    validator.validateUpdated(toast);
  });

});

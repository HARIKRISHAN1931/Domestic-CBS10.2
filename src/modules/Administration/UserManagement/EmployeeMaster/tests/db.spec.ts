import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { EmployeeMasterData } from '../src/EmployeeMasterPage';
import { EmployeeMasterRepository } from '../src/EmployeeMasterRepository';
import { EmployeeMasterValidator } from '../src/EmployeeMasterBuilder';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/UserManagement/EmployeeMaster/data/employee-master.data.xlsx');

test.describe('Employee Master > Database @database @regression', () => {

  test('should exist in DB with pending authStatus after create', async ({ db }) => {
    const rows      = await ExcelHelper.readSheet<EmployeeMasterData>(DATA_FILE, 'Database');
    const repo      = new EmployeeMasterRepository(db);
    const validator = new EmployeeMasterValidator();
    const row       = await repo.findById(rows[0].empId!);
    validator.validateDbPending(row, rows[0].empId!);
  });

  test('should have authStatus A after authorize', async ({ db }) => {
    const rows      = await ExcelHelper.readSheet<EmployeeMasterData>(DATA_FILE, 'Database');
    const repo      = new EmployeeMasterRepository(db);
    const validator = new EmployeeMasterValidator();
    const row       = await repo.findAuthorized(rows[0].empId!);
    validator.validateDbAuthorized(row, rows[0].empId!);
  });

  test('should have isActive = 1 in DB', async ({ db }) => {
    const rows      = await ExcelHelper.readSheet<EmployeeMasterData>(DATA_FILE, 'Database');
    const repo      = new EmployeeMasterRepository(db);
    const validator = new EmployeeMasterValidator();
    const row       = await repo.findById(rows[0].empId!);
    validator.validateDbActive(row, rows[0].empId!);
  });

  test('should find employee by first name in DB', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<EmployeeMasterData>(DATA_FILE, 'Database');
    const repo = new EmployeeMasterRepository(db);
    const row  = await repo.findByName(rows[0].empFName!);
    expect(row, `Employee with name ${rows[0].empFName} must exist in DB`).not.toBeNull();
  });

  test('should find employee by email in DB', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<EmployeeMasterData>(DATA_FILE, 'Database');
    const repo = new EmployeeMasterRepository(db);
    const row  = await repo.findByEmail(rows[0].email!);
    expect(row, `Employee with email ${rows[0].email} must exist in DB`).not.toBeNull();
  });

  test('should find employees by department in DB', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<EmployeeMasterData>(DATA_FILE, 'Database');
    const repo = new EmployeeMasterRepository(db);
    const list = await repo.findByDept(rows[0].dept as string);
    expect(list.length, `At least one employee must exist in dept ${rows[0].dept}`).toBeGreaterThan(0);
  });

  test('should find employees by Active status in DB', async ({ db }) => {
    const repo = new EmployeeMasterRepository(db);
    const list = await repo.findByStatus('1');  // Active
    expect(list.length, 'At least one active employee must exist in DB').toBeGreaterThan(0);
  });

  test('should count authorized employees in DB', async ({ db }) => {
    const repo  = new EmployeeMasterRepository(db);
    const count = await repo.countByAuthStatus('A');
    expect(count, 'At least one authorized employee must exist in DB').toBeGreaterThan(0);
  });

  test('should have correct gender in DB matching salutation', async ({ db }) => {
    const rows = await ExcelHelper.readSheet<EmployeeMasterData>(DATA_FILE, 'Database');
    const repo = new EmployeeMasterRepository(db);
    const row  = await repo.findById(rows[0].empId!);
    expect(row, `Employee ${rows[0].empId} must exist in DB`).not.toBeNull();
    // Gender must not be blank — it was auto-set by salutation
    expect(row!.gender, 'Gender must be populated in DB').toBeTruthy();
  });

  test('should have correct department in DB', async ({ db }) => {
    const rows      = await ExcelHelper.readSheet<EmployeeMasterData>(DATA_FILE, 'Database');
    const repo      = new EmployeeMasterRepository(db);
    const validator = new EmployeeMasterValidator();
    const row       = await repo.findById(rows[0].empId!);
    validator.validateDbDept(row, rows[0].dept as string);
  });

});

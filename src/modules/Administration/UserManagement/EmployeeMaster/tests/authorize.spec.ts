import * as fs from 'fs';
import * as path from 'path';
import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { EmployeeMasterPage } from '../src/EmployeeMasterPage';
import { EmployeeMasterValidator } from '../src/EmployeeMasterBuilder';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

const CREATED_FILE = path.resolve(__dirname, '../data/created-employees.json');
const NAV          = (page: any) => new MenuNavigation(page).navigate('Administration', 'usermgmtAdm', 'EMPLOYEEMST');

const loadCreatedEmpIds = (): string[] => {
  if (!fs.existsSync(CREATED_FILE)) throw new Error(`created-employees.json not found — run create tests first`);
  return JSON.parse(fs.readFileSync(CREATED_FILE, 'utf-8'));
};

test.describe('Employee Master > Authorize', () => {

  // ── SANITY: authorize first created employee ──────────────────────────────
  test('should authorize first created employee @sanity @sanity', async ({ checkerAuthenticatedPage }) => {
    test.setTimeout(120_000);
    const empIds = loadCreatedEmpIds();
    const empId  = empIds[0];
    const screen    = new EmployeeMasterPage(checkerAuthenticatedPage);
    const validator = new EmployeeMasterValidator();

    await test.step('Navigate', () => NAV(checkerAuthenticatedPage));
    await test.step('Switch to pending tab', () => screen.switchToPendingTab());
    await test.step('Search record', () => screen.searchPendingRecord(empId));
    await test.step('Verify in pending grid', async () => {
      expect(await screen.isRecordInPendingGrid(empId), `${empId} must be in pending grid`).toBe(true);
    });
    const toast = await test.step('Approve', () => screen.approve(empId));
    validator.validateApproved(toast);
    await test.step('Verify in authorized grid', async () => {
      await screen.switchToAuthorizedTab();
      await screen.searchAuthorizedRecord(empId);
      expect(await screen.isRecordInAuthorizedGrid(empId), `${empId} must be in authorized grid`).toBe(true);
    });
  });

  // ── REGRESSION: authorize all created employees ───────────────────────────
  test('should authorize all created employees @regression', async ({ checkerAuthenticatedPage }) => {
    test.setTimeout(5_400_000);
    const empIds = loadCreatedEmpIds();
    const screen    = new EmployeeMasterPage(checkerAuthenticatedPage);
    const validator = new EmployeeMasterValidator();

    await test.step('Navigate', () => NAV(checkerAuthenticatedPage));

    for (const empId of empIds) {
      await test.step(`Authorize ${empId}`, async () => {
        await screen.switchToPendingTab();
        await screen.searchPendingRecord(empId);
        await checkerAuthenticatedPage.waitForTimeout(500);
        const inPending = await screen.isRecordInPendingGrid(empId);
        if (!inPending) { console.log(`[SKIP] ${empId} not in pending — already authorized`); return; }
        const toast = await screen.approve(empId);
        console.log(`[${empId}] Toast: ${toast}`);
        validator.validateApproved(toast);
      });
    }
  });

});

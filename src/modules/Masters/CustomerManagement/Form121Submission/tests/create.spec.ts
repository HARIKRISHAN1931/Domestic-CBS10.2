import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import { Form121SubmissionPage, Form121SubmissionData } from '../src/Form121SubmissionPage';
import { Form121SubmissionValidator } from '../src/Form121SubmissionBuilder';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Masters/CustomerManagement/Form121Submission/data/Form121Submission.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'customermgmt', '15GSUBMISSION');

test.describe('Form 121 Submission — Create @sanity @regression', () => {

  test('should create Form 121 submission successfully', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const rows      = await ExcelHelper.readSheet<Form121SubmissionData>(DATA_FILE, 'Create');
    const data      = rows[0];
    const screen    = new Form121SubmissionPage(authenticatedPage);
    const validator = new Form121SubmissionValidator();

    await test.step('Navigate to Form 121 Submission', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    await test.step('Fill form', () => screen.fillForm(data));
    const toast = await test.step('Save', () => screen.save());
    validator.validateCreated(toast);

    SharedDataStore.set('Form121Submission.searchKey', data.memberCode!);

    await test.step('Verify in pending grid', async () => {
      await NAV(authenticatedPage);
      await (screen as any).grid.switchTab('pending');
      const row = authenticatedPage.locator('#dt-pendingdata tbody tr').filter({ hasText: data.memberCode! });
      await expect(row.first()).toBeVisible({ timeout: 10_000 });
    });
  });

});

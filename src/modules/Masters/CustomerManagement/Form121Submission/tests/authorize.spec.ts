import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import { Form121SubmissionPage, Form121SubmissionData } from '../src/Form121SubmissionPage';
import { Form121SubmissionValidator } from '../src/Form121SubmissionBuilder';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Masters/CustomerManagement/Form121Submission/data/Form121Submission.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'customermgmt', '15GSUBMISSION');

test.describe('Form 121 Submission — Authorize @regression', () => {

  test('should authorize Form 121 submission', async ({ checkerAuthenticatedPage }) => {
    test.setTimeout(120_000);
    const rows      = await ExcelHelper.readSheet<Form121SubmissionData>(DATA_FILE, 'Auth');
    const data      = rows[0];
    const searchKey = SharedDataStore.get<string>('Form121Submission.searchKey') ?? data.searchKey!;
    const screen    = new Form121SubmissionPage(checkerAuthenticatedPage);
    const validator = new Form121SubmissionValidator();

    await test.step('Navigate', () => NAV(checkerAuthenticatedPage));
    const toast = await test.step(`Approve [${searchKey}]`, () => screen.approve(searchKey, data.tab as string ?? 'pending'));
    validator.validateApproved(toast);

    await test.step('Verify in authorized grid', async () => {
      await NAV(checkerAuthenticatedPage);
      await (screen as any).grid.switchTab('authorized');
      const row = checkerAuthenticatedPage.locator('#dt-authdata tbody tr').filter({ hasText: searchKey });
      await expect(row.first()).toBeVisible({ timeout: 10_000 });
    });
  });

});

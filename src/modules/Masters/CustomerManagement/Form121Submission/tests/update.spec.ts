import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { Form121SubmissionPage, Form121SubmissionData } from '../src/Form121SubmissionPage';
import { Form121SubmissionValidator } from '../src/Form121SubmissionBuilder';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Masters/CustomerManagement/Form121Submission/data/Form121Submission.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'customermgmt', '15GSUBMISSION');

test.describe('Form 121 Submission — Update @regression', () => {

  test('should update Form 121 submission', async ({ authenticatedPage }) => {
    test.setTimeout(180_000);
    const rows      = await ExcelHelper.readSheet<Form121SubmissionData>(DATA_FILE, 'Update');
    const data      = rows[0];
    const screen    = new Form121SubmissionPage(authenticatedPage);
    const validator = new Form121SubmissionValidator();

    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Search and open edit form', async () => {
      await (screen as any).grid.searchAndEdit(data.searchKey!, (data.tab as any) ?? 'authorized');
    });
    await test.step('Fill updated fields', () => screen.fillForm(data));
    const toast = await test.step('Save', () => screen.save());
    validator.validateUpdated(toast);
  });

});

import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import { Form121SubmissionRepository } from '../src/Form121SubmissionRepository';
import { Form121SubmissionValidator } from '../src/Form121SubmissionBuilder';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Masters/CustomerManagement/Form121Submission/data/Form121Submission.xlsx');

test.describe('Form 121 Submission — DB Validation @database @regression', () => {

  test('should have unauthorized record after create', async ({ db }) => {
    const rows       = await ExcelHelper.readSheet(DATA_FILE, 'Database');
    const data       = rows[0] as any;
    const memberCode = SharedDataStore.get<string>('Form121Submission.searchKey') ?? String(data.memberCode);
    const repo       = new Form121SubmissionRepository(db);
    const validator  = new Form121SubmissionValidator();

    const row = await test.step(`Query D020220 for memberCode [${memberCode}]`, () => repo.findByMemberCode(memberCode));
    validator.validateDbRecord(row, memberCode);
  });

  test('should have authorized record after approve', async ({ db }) => {
    const rows       = await ExcelHelper.readSheet(DATA_FILE, 'Database');
    const data       = rows[0] as any;
    const memberCode = SharedDataStore.get<string>('Form121Submission.searchKey') ?? String(data.memberCode);
    const repo       = new Form121SubmissionRepository(db);
    const validator  = new Form121SubmissionValidator();

    const row = await test.step(`Query D020220 for authorized memberCode [${memberCode}]`, () => repo.findByMemberCode(memberCode));
    validator.validateDbAuthorized(row, memberCode);
  });

});

import * as path from 'path';
import * as fs from 'fs';
import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { UserMasterPage, UserMasterData } from '../src/UserMasterPage';
import { UserMasterValidator } from '../src/UserMasterBuilder';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

const DATA_FILE    = path.resolve(__dirname, '../data/user-master.data.xlsx');
const DOC_FILE     = path.resolve(__dirname, '../data/test-doc.png');
const CREATED_FILE = path.resolve(__dirname, '../data/created-users.json');

const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'usermgmtAdm', 'USERMGMT');

const storeCreated = (loginId: string): void => {
  const list: string[] = fs.existsSync(CREATED_FILE)
    ? JSON.parse(fs.readFileSync(CREATED_FILE, 'utf-8')) : [];
  if (!list.includes(loginId)) {
    list.push(loginId);
    fs.writeFileSync(CREATED_FILE, JSON.stringify(list, null, 2));
  }
};

const loadRows = async (): Promise<UserMasterData[]> => {
  const rows = await ExcelHelper.readSheet<UserMasterData>(DATA_FILE, 'Create');
  return rows
    .slice(1)                                                          // skip notes row
    .filter(r => r.loginId && String(r.loginId).trim() !== '')
    .map(r => ({ ...r, docUpload: DOC_FILE }));
};

const createAndVerify = async (page: any, data: UserMasterData, label: string) => {
  const screen    = new UserMasterPage(page);
  const validator = new UserMasterValidator();

  await test.step(`[${label}] Open form`, () => screen.openCreateForm());
  console.log(`[${label}] loginId=${data.loginId} empId=${data.employeeId} branch=${data.userBaseBranchCode}`);
  try {
    await test.step(`[${label}] Fill form`, () => screen.fillForm(data));
    const toast = await test.step(`[${label}] Save`, () => screen.save());
    console.log(`[${label}] Toast: ${toast}`);
    validator.validateCreated(toast);
  } catch (e: any) {
    if (e.message?.startsWith('DUPLICATE:')) {
      console.log(`[${label}] Already exists — skipping`);
    } else {
      throw e;
    }
  }
  storeCreated(String(data.loginId));
};

test.describe('User Master > Create', () => {

  test('should create user - sanity @sanity @sanity', async ({ authenticatedPage }) => {
    test.setTimeout(180_000);
    const rows = await loadRows();
    const already: string[] = fs.existsSync(CREATED_FILE)
      ? JSON.parse(fs.readFileSync(CREATED_FILE, 'utf-8')) : [];
    const data = rows.find(r => !already.includes(String(r.loginId))) ?? rows[0];
    await NAV(authenticatedPage);
    await createAndVerify(authenticatedPage, data, `SANITY-${data.loginId}`);
  });

  test('should create all users @regression', async ({ authenticatedPage }) => {
    test.setTimeout(5_400_000);
    const rows = await loadRows();
    const already: string[] = fs.existsSync(CREATED_FILE)
      ? JSON.parse(fs.readFileSync(CREATED_FILE, 'utf-8')) : [];
    const pending = rows.filter(r => !already.includes(String(r.loginId)));
    console.log(`Total: ${rows.length} | Done: ${already.length} | Pending: ${pending.length}`);
    if (pending.length === 0) { console.log('All users already created.'); return; }
    await NAV(authenticatedPage);
    for (const data of pending) {
      await createAndVerify(authenticatedPage, data, String(data.loginId));
    }
  });

});

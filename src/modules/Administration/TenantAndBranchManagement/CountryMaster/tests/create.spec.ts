import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { CountryMasterPage, CountryMasterData } from '../src/CountryMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/CountryMaster/data/country-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'COUNTRYMST');

test.describe('Country Master > Create @sanity @regression', () => {
  test('should create country master', async ({ authenticatedPage }) => {
    const rows   = await ExcelHelper.readSheet<CountryMasterData>(DATA_FILE, 'Create');
    const data   = rows[0];
    const screen = new CountryMasterPage(authenticatedPage);

    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());
    const toast = await test.step('Fill and save', () => screen.create(data));
    expect(toast).toBeTruthy();

    // Persist created key so Auth spec can pick it up without hardcoding
    SharedDataStore.set('CountryMaster.searchKey', data.countryCode);

    await test.step('Verify record in Pending tab', async () => {
      await NAV(authenticatedPage);
      await (screen as any).grid.switchTab('pending');
      const row = authenticatedPage.locator('#dt-pendingdata tbody tr').filter({ hasText: data.countryCode! });
      await expect(row.first()).toBeVisible({ timeout: 10_000 });
    });
  });
});

import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { CountryMasterPage, CountryMasterData } from '../src/CountryMasterPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { SharedDataStore } from '../../../../../framework/utils/SharedDataStore';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Administration/TenantAndBranchManagement/CountryMaster/data/country-master.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'setupAdm', 'COUNTRYMST');

test.describe('Country Master > Authorize @regression', () => {
  test('should authorize country master', async ({ checkerAuthenticatedPage }) => {
    const rows      = await ExcelHelper.readSheet<CountryMasterData>(DATA_FILE, 'Auth');
    const data      = rows[0];
    // Use key saved by create spec; fall back to Excel value
    const searchKey = SharedDataStore.get<string>('CountryMaster.searchKey') ?? data.searchKey!;
    const screen    = new CountryMasterPage(checkerAuthenticatedPage);

    await test.step('Navigate', () => NAV(checkerAuthenticatedPage));
    const toast = await test.step(`Approve [${searchKey}] from pending tab`, () => screen.approve(searchKey, data.tab));
    expect(toast).toBeTruthy();

    await test.step('Verify record in Authorized tab', async () => {
      await NAV(checkerAuthenticatedPage);
      await screen.grid.switchTab('authorized');
      const row = checkerAuthenticatedPage.locator('#dt-authdata tbody tr').filter({ hasText: searchKey });
      await expect(row.first()).toBeVisible({ timeout: 10_000 });
    });
  });
});

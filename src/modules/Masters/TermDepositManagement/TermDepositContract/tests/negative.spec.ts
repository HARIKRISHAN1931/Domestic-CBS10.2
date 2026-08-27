import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { TermDepositPage } from '../src/TermDepositPage';
import { TermDepositBuilder } from '../src/TermDepositBuilder';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'td', 'TERMDEPOSITCONTRACTD');

test.describe('Term Deposit Contract > Negative', () => {

  test('should fail save without customer code @sanity @regression', async ({ authenticatedPage }) => {
    test.setTimeout(60_000);
    const screen = new TermDepositPage(authenticatedPage);
    await NAV(authenticatedPage);
    await screen.openCreateForm();
    // No customer — save must throw (modal won't appear or toast error)
    await expect(async () => {
      await screen.save();
    }).rejects.toThrow();
  });

  test('should fail save without product code @regression', async ({ authenticatedPage }) => {
    test.setTimeout(60_000);
    const screen = new TermDepositPage(authenticatedPage);
    await NAV(authenticatedPage);
    await screen.openCreateForm();
    // Fill customer only — no product
    await screen.fillForm({ customerCode: '1395042', productCode: '', schemeCode: '', depositAmount: '', depositMonths: '' });
    await expect(async () => {
      await screen.save();
    }).rejects.toThrow();
  });

  test('should fail save without deposit amount @regression', async ({ authenticatedPage }) => {
    test.setTimeout(60_000);
    const screen = new TermDepositPage(authenticatedPage);
    await NAV(authenticatedPage);
    await screen.openCreateForm();
    const data = new TermDepositBuilder().build();
    data.depositAmount = '';
    await screen.fillForm(data);
    await expect(async () => {
      await screen.save();
    }).rejects.toThrow();
  });

  test('should fail save without deposit months @regression', async ({ authenticatedPage }) => {
    test.setTimeout(60_000);
    const screen = new TermDepositPage(authenticatedPage);
    await NAV(authenticatedPage);
    await screen.openCreateForm();
    const data = new TermDepositBuilder().build();
    data.depositMonths = '';
    await screen.fillForm(data);
    await expect(async () => {
      await screen.save();
    }).rejects.toThrow();
  });

});

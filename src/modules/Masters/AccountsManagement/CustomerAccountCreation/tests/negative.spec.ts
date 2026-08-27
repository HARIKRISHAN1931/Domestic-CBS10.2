import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { AccountOpeningPage } from '../src/AccountOpeningPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'accountmgmt', 'PRDACNOMST');

test.describe('Customer Account Creation (PRDACNOMST) > Negative', () => {

  test('should block save with empty customerNumber @regression', async ({ authenticatedPage }) => {
    test.setTimeout(60_000);
    const screen = new AccountOpeningPage(authenticatedPage);
    await NAV(authenticatedPage);
    await screen.openCreateForm();
    // No customerNumber — CBS must block save (modal won't appear)
    await screen.fillForm({ moduleCode: '11', productCode: '15201', schemeCode: '01' });
    await expect(() => screen.save()).rejects.toThrow(/Save confirm modal/i);
  });

  test('should block save with empty moduleCode @regression', async ({ authenticatedPage }) => {
    test.setTimeout(60_000);
    const screen = new AccountOpeningPage(authenticatedPage);
    await NAV(authenticatedPage);
    await screen.openCreateForm();
    // customerNumber filled but no module/product/scheme
    await screen.fillForm({ customerNumber: '1395042' });
    await expect(() => screen.save()).rejects.toThrow(/Save confirm modal/i);
  });

  test('should block save on completely empty form @regression', async ({ authenticatedPage }) => {
    test.setTimeout(60_000);
    const screen = new AccountOpeningPage(authenticatedPage);
    await NAV(authenticatedPage);
    await screen.openCreateForm();
    await expect(() => screen.save()).rejects.toThrow(/Save confirm modal/i);
  });

});

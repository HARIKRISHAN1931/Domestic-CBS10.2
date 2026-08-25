import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { AccountOpeningPage } from '../src/AccountOpeningPage';
import { AccountOpeningBuilder } from '../src/AccountOpeningBuilder';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'accountsMgmt', 'PRDACNOMST');

test.describe('Customer Account Creation (PRDACNOMST) > Negative', () => {

  test('should show error for empty customer ID @regression', async ({ authenticatedPage }) => {
    test.setTimeout(60_000);
    const screen = new AccountOpeningPage(authenticatedPage);
    await NAV(authenticatedPage);
    await screen.openCreateForm();
    // Fill only acType, leave customerId empty — CBS must block save
    await screen.fillForm({ acType: 'SAVINGS', openDate: '01-01-2025', operMode: '1' });
    await expect(async () => {
      await screen.save();
    }).rejects.toThrow();
  });

  test('should show error for empty account type @regression', async ({ authenticatedPage }) => {
    test.setTimeout(60_000);
    const screen = new AccountOpeningPage(authenticatedPage);
    await NAV(authenticatedPage);
    await screen.openCreateForm();
    // Fill customerId only, leave acType empty
    await screen.fillForm({ customerId: 'CUST001', openDate: '01-01-2025', operMode: '1' });
    await expect(async () => {
      await screen.save();
    }).rejects.toThrow();
  });

  test('should show mandatory field error toast @regression', async ({ authenticatedPage }) => {
    test.setTimeout(60_000);
    const screen = new AccountOpeningPage(authenticatedPage);
    await NAV(authenticatedPage);
    await screen.openCreateForm();
    // Submit completely empty form — CBS shows mandatory field error
    await expect(async () => {
      await screen.save();
    }).rejects.toThrow(/mandatory|required|Save confirm modal/i);
  });

});

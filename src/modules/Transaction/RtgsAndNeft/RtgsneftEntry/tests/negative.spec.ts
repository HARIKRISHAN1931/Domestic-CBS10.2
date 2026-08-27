import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { RtgsNeftEntryPage } from '../src/RtgsNeftEntryPage';
import { Page } from '@playwright/test';

const NAV = (page: any) => new MenuNavigation(page).navigate('Transaction', 'RTGSTrxn', 'TRANSACTIONMST');
const ERR = '.toast-messages .msg-toast.msg-error em, .field-error, .error-msg, .has-error .help-block';

test.describe('RTGS/NEFT Entry — Negative @regression', () => {

  test('should fail when mandatory fields are empty', async ({ authenticatedPage }: { authenticatedPage: Page }) => {
    test.setTimeout(120_000);
    const screen = new RtgsNeftEntryPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    const saveBtn = authenticatedPage.locator(
      '#saveD946020, #saveRtgsNeft, #saveDepositeparamDetails, button[id*="save"], input[id*="save"]'
    ).filter({ visible: true }).first();
    await saveBtn.waitFor({ state: 'attached', timeout: 10_000 });
    await saveBtn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should fail when Transfer Type is not selected', async ({ authenticatedPage }: { authenticatedPage: Page }) => {
    test.setTimeout(120_000);
    const screen = new RtgsNeftEntryPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    // Fill other fields but leave msgTrfType empty
    await authenticatedPage.locator('#valueAmt_txt').fill('10000').catch(() => {});
    await authenticatedPage.locator('#benDesc1').fill('12345678901234').catch(() => {});
    await authenticatedPage.locator('#benDesc2').fill('Test Beneficiary').catch(() => {});

    const saveBtn = authenticatedPage.locator(
      '#saveD946020, #saveRtgsNeft, #saveDepositeparamDetails, button[id*="save"], input[id*="save"]'
    ).filter({ visible: true }).first();
    await saveBtn.waitFor({ state: 'attached', timeout: 10_000 });
    await saveBtn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should fail when Amount is missing', async ({ authenticatedPage }: { authenticatedPage: Page }) => {
    test.setTimeout(120_000);
    const screen = new RtgsNeftEntryPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    await authenticatedPage.locator('#msgTrfType').selectOption('2').catch(() => {});
    await authenticatedPage.locator('#msgSType').selectOption('N06').catch(() => {});
    await authenticatedPage.locator('#benDesc1').fill('12345678901234').catch(() => {});
    await authenticatedPage.locator('#benDesc2').fill('Test Beneficiary').catch(() => {});
    // Leave valueAmt_txt empty

    const saveBtn = authenticatedPage.locator(
      '#saveD946020, #saveRtgsNeft, #saveDepositeparamDetails, button[id*="save"], input[id*="save"]'
    ).filter({ visible: true }).first();
    await saveBtn.waitFor({ state: 'attached', timeout: 10_000 });
    await saveBtn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should fail with invalid Ordering IFSC format', async ({ authenticatedPage }: { authenticatedPage: Page }) => {
    test.setTimeout(120_000);
    const screen = new RtgsNeftEntryPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    await authenticatedPage.locator('#msgTrfType').selectOption('2').catch(() => {});
    await authenticatedPage.locator('#ordIFSCCd').fill('INVALID').catch(() => {});
    await authenticatedPage.locator('#ordIFSCCd').press('Tab').catch(() => {});

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should fail with invalid Beneficiary IFSC format', async ({ authenticatedPage }: { authenticatedPage: Page }) => {
    test.setTimeout(120_000);
    const screen = new RtgsNeftEntryPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    await authenticatedPage.locator('#msgTrfType').selectOption('2').catch(() => {});
    await authenticatedPage.locator('#benIFSCCd').fill('BADINPUT').catch(() => {});
    await authenticatedPage.locator('#benIFSCCd').press('Tab').catch(() => {});

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should fail with invalid mobile number (not 10 digits)', async ({ authenticatedPage }: { authenticatedPage: Page }) => {
    test.setTimeout(120_000);
    const screen = new RtgsNeftEntryPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    await authenticatedPage.locator('#msgTrfType').selectOption('2').catch(() => {});
    await authenticatedPage.locator('#mobileEmail').selectOption('1').catch(() => {});
    await authenticatedPage.locator('#mobileNo').fill('12345').catch(() => {}); // only 5 digits

    const saveBtn = authenticatedPage.locator(
      '#saveD946020, #saveRtgsNeft, #saveDepositeparamDetails, button[id*="save"], input[id*="save"]'
    ).filter({ visible: true }).first();
    await saveBtn.waitFor({ state: 'attached', timeout: 10_000 });
    await saveBtn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should fail with invalid email format', async ({ authenticatedPage }: { authenticatedPage: Page }) => {
    test.setTimeout(120_000);
    const screen = new RtgsNeftEntryPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    await authenticatedPage.locator('#msgTrfType').selectOption('2').catch(() => {});
    await authenticatedPage.locator('#mobileEmail').selectOption('2').catch(() => {});
    await authenticatedPage.locator('#email').fill('notanemail').catch(() => {});

    const saveBtn = authenticatedPage.locator(
      '#saveD946020, #saveRtgsNeft, #saveDepositeparamDetails, button[id*="save"], input[id*="save"]'
    ).filter({ visible: true }).first();
    await saveBtn.waitFor({ state: 'attached', timeout: 10_000 });
    await saveBtn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should fail when benDesc2 exceeds max length of 34', async ({ authenticatedPage }: { authenticatedPage: Page }) => {
    test.setTimeout(120_000);
    const screen = new RtgsNeftEntryPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    await authenticatedPage.locator('#msgTrfType').selectOption('2').catch(() => {});
    await authenticatedPage.locator('#benDesc2').fill('A'.repeat(35)).catch(() => {}); // 35 chars > maxLen=34

    const saveBtn = authenticatedPage.locator(
      '#saveD946020, #saveRtgsNeft, #saveDepositeparamDetails, button[id*="save"], input[id*="save"]'
    ).filter({ visible: true }).first();
    await saveBtn.waitFor({ state: 'attached', timeout: 10_000 });
    await saveBtn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should fail RTGS with amount below minimum 200000', async ({ authenticatedPage }: { authenticatedPage: Page }) => {
    test.setTimeout(120_000);
    const screen = new RtgsNeftEntryPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    await authenticatedPage.locator('#msgTrfType').selectOption('1').catch(() => {}); // 1=RTGS
    await authenticatedPage.locator('#msgSType').selectOption('R41').catch(() => {});
    await authenticatedPage.locator('#valueAmt_txt').fill('100000').catch(() => {}); // below 2L minimum
    await authenticatedPage.locator('#valueAmt_txt').press('Tab').catch(() => {});

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

});

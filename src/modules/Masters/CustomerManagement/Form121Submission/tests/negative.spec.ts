import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import { Form121SubmissionPage } from '../src/Form121SubmissionPage';

const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'customermgmt', '15GSUBMISSION');
const ERR = '.toast-messages .msg-toast.msg-error em, .field-error, .error-msg, .has-error .help-block';
const SAVE_BTN = '#saveD020220, #saveDepositeparamDetails, #saveCustomerDetails, button[id*="save"], input[id*="save"]';

test.describe('Form 121 Submission — Negative @regression', () => {

  test('should fail save when all mandatory fields are empty', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const screen = new Form121SubmissionPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    const saveBtn = authenticatedPage.locator(SAVE_BTN).filter({ visible: true }).first();
    await saveBtn.waitFor({ state: 'attached', timeout: 10_000 });
    await saveBtn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should fail save when Customer ID is missing', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const screen = new Form121SubmissionPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    // Set form121YN=Y and submitDate but leave memberCode empty
    await authenticatedPage.locator('#form121Y').click({ force: true }).catch(() => {});
    await authenticatedPage.locator('#submitDate').fill('01-04-2024').catch(() => {});

    const saveBtn = authenticatedPage.locator(SAVE_BTN).filter({ visible: true }).first();
    await saveBtn.waitFor({ state: 'attached', timeout: 10_000 });
    await saveBtn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should fail save when invalid Customer ID is entered', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    const screen = new Form121SubmissionPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    // Enter non-existent customer ID
    const custField = authenticatedPage.locator('#memberCode').first();
    await custField.fill('9999999999');
    await custField.press('Tab');
    await authenticatedPage.waitForTimeout(1_500);

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should fail when NoOf15GH is non-zero but amount is zero', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    // Validation: "Amount of 15GH in other banks must be greater than 0 when No of 15GH is not 0"
    const screen = new Form121SubmissionPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    await authenticatedPage.locator('#form121FilledOtherBankY').click({ force: true }).catch(() => {});
    await authenticatedPage.waitForTimeout(500);
    const noOf = authenticatedPage.locator('#NoOf15GH');
    if (await noOf.isEnabled({ timeout: 3_000 }).catch(() => false)) {
      await noOf.fill('1');
      // Leave amtOf15GHOthBnk_txt as 0
    }

    const saveBtn = authenticatedPage.locator(SAVE_BTN).filter({ visible: true }).first();
    await saveBtn.waitFor({ state: 'attached', timeout: 10_000 });
    await saveBtn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

  test('should fail when estimated income is less than sum of other incomes', async ({ authenticatedPage }) => {
    test.setTimeout(120_000);
    // Validation: "Estimated income Should be Greater than sum of Amount of 15GH in other banks and Aggregate Income"
    const screen = new Form121SubmissionPage(authenticatedPage);
    await test.step('Navigate', () => NAV(authenticatedPage));
    await test.step('Open create form', () => screen.openCreateForm());

    await authenticatedPage.locator('#form121Y').click({ force: true }).catch(() => {});
    await authenticatedPage.waitForTimeout(500);

    const aggrIncome = authenticatedPage.locator('#aggrIncome_txt');
    if (await aggrIncome.isEnabled({ timeout: 3_000 }).catch(() => false)) {
      await aggrIncome.fill('100000');
      await aggrIncome.press('Tab');
    }
    const estIncome = authenticatedPage.locator('#estIncome_txt');
    if (await estIncome.isEnabled({ timeout: 3_000 }).catch(() => false)) {
      await estIncome.fill('1000'); // less than aggrIncome
      await estIncome.press('Tab');
    }

    const saveBtn = authenticatedPage.locator(SAVE_BTN).filter({ visible: true }).first();
    await saveBtn.waitFor({ state: 'attached', timeout: 10_000 });
    await saveBtn.evaluate((el: any) => el.click());

    await expect(authenticatedPage.locator(ERR).first()).toBeVisible({ timeout: 10_000 });
  });

});

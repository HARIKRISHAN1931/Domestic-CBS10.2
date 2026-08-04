import { test, expect } from '../../../../../framework/fixtures/fixtures';
import { UserMasterPage } from '../src/UserMasterPage';
import { UserMasterBuilder, UserMasterValidator } from '../src/UserMasterBuilder';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';

const NAV = (page: any) => new MenuNavigation(page).navigate('Administration', 'usermgmtAdm', 'USERMGMT');

const createAndVerify = async (
  page: any,
  data: ReturnType<UserMasterBuilder['build']>,
  label: string
) => {
  const screen    = new UserMasterPage(page);
  const validator = new UserMasterValidator();

  await test.step(`[${label}] Navigate`,    () => NAV(page));
  await test.step(`[${label}] Open form`,   () => screen.openCreateForm());
  await test.step(`[${label}] Fill form`,   () => screen.fillForm(data));
  const toast = await test.step(`[${label}] Save`, () => screen.save());
  console.log(`[${label}] Toast: ${toast} | LoginId: ${data.loginId}`);
  validator.validateCreated(toast);

  await test.step(`[${label}] Verify pending grid`, async () => {
    await screen.switchToPendingTab();
    await page.waitForTimeout(500);
    expect(
      await screen.isRecordInPendingGrid(data.loginId!),
      `${data.loginId} must appear in pending grid`
    ).toBe(true);
  });
};

test.describe('User Master > Create', () => {
  test.setTimeout(180_000);

  // ── SANITY: mandatory fields only ────────────────────────────────────────────
  test('should create user with mandatory fields @sanity @smoke', async ({ authenticatedPage }) => {
    const data = new UserMasterBuilder().buildMandatoryOnly();
    await createAndVerify(authenticatedPage, data, 'SANITY');
  });

  // ── REGRESSION: all scenarios ────────────────────────────────────────────────
  test('should create users across all scenarios @regression', async ({ authenticatedPage }) => {
    const builder = new UserMasterBuilder();
    const scenarios = [
      { label: 'All fields',    data: builder.build()           },
      { label: 'Female (MRS)',  data: builder.buildFemale()     },
      { label: 'External user', data: builder.buildExternal()   },
      { label: 'VIP user',      data: builder.buildVip()        },
    ];
    for (const { label, data } of scenarios) {
      await createAndVerify(authenticatedPage, data, label);
    }
  });
});

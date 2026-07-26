# CBS Page Automation Rules

## CBS Navigation Behaviour (CRITICAL)
- Login click opens a **new browser tab** — use `context.waitForEvent('page', { timeout: 30_000 })`
- Menu item click navigates the **same tab** via full page load — use `page.waitForURL()`
- Add/Create button navigates the **same tab** — use `page.waitForURL()` then wait for anchor field
- Next button navigates the **same tab** (SPA) — click then wait for anchor field
- **No iframes** — all CBS content is in the main frame, always use `page.locator()` directly

## BasePage Rules
- `BasePage.loc()` uses `page.locator()` directly — no iframe detection
- `BasePage.fill()` uses `locator.evaluate()` — **do NOT use for login page inputs**, use `locator.fill()` directly
- `LoginPage` locators must use `this.page.locator()`, not `this.loc()`

## Debug Before Fix
- Always write a debug script in `scripts/` first to confirm selectors, navigation behaviour, and frame structure
- Check `context.pages().length` before and after every click to detect new tab vs same-tab navigation
- Check `page.url()` after navigation to confirm the correct URL

## Selector Priority (CBS)
- Prefer `#id` selectors — CBS uses consistent IDs
- Add button: `#addButton` (visible) — `button.add` may be invisible
- Save button: `#saveDepositeparamDetails`
- Next button: `#nextBtn`
- Login: `#loginId`, `#uiPwd`, `#userLogin`

## waitForAjax
- CBS uses jQuery AJAX — `waitForAjax()` polls `jQuery.active === 0`
- Always call after `selectOption`, dropdown changes, and tab navigation

## Test Data
- Excel file: `data/customer-creation.data.xlsx`
- Read with `ExcelHelper.readSheet<T>(DATA_FILE, 'SheetName')`
- Sheet names: `Create`, `Auth`, `Update`, `Database`, `Negative`

## Running Tests
```bash
# Always set ENV before running
set ENV=qa && npx playwright test <spec-path> --headed --project=chromium

# Customer Creation
set ENV=qa && npx playwright test src/modules/Masters/CustomerManagement/CustomerCreationretail/tests/create.spec.ts --headed --project=chromium
```

## Debug Scripts
- Always save to `scripts/` folder
- Use plain `.js` (not TypeScript) — no `as Type` casts in `page.evaluate()`
- Login pattern for debug scripts:
```js
await page.fill('#loginId', 'demo1');
await page.locator('#loginId').press('Tab');
await page.fill('#uiPwd', 'Abcd@1243');
const [appPage] = await Promise.all([
  context.waitForEvent('page', { timeout: 30_000 }),
  page.click('#userLogin'),
]);
await appPage.waitForLoadState('domcontentloaded');
```

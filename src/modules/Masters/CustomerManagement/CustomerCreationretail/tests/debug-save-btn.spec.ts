import { test } from '../../../../../framework/fixtures/fixtures';
import { ExcelHelper } from '../../../../../common/helpers/ExcelHelper';
import { CustomerCreationPage, CustomerData } from '../src/CustomerCreationPage';
import { MenuNavigation } from '../../../../../common/components/MenuNavigation';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/modules/Masters/CustomerManagement/CustomerCreationretail/data/customer-creation.data.xlsx');
const NAV = (page: any) => new MenuNavigation(page).navigate('Masters', 'customermgmt', 'CUSTOMER');

test('debug - find save button after doc details', async ({ authenticatedPage }) => {
  test.setTimeout(180_000);
  const rows   = await ExcelHelper.readSheet<CustomerData>(DATA_FILE, 'Create');
  const data   = rows[0];
  const screen = new CustomerCreationPage(authenticatedPage);

  await NAV(authenticatedPage);
  await screen.openCreateForm();
  await screen.fillBasicDetails(data);
  await screen.fillContactDetails(data);
  await screen.fillAdditionalDetails(data);
  await screen.fillDocumentDetails(data);

  await authenticatedPage.waitForTimeout(2000);

  // Check showingStep
  const step = await authenticatedPage.locator('#showingStep').innerText().catch(() => '');
  console.log(`showingStep: "${step}"`);

  // Check proofType visible (Tab 4 indicator)
  const proofVis = await authenticatedPage.locator('#proofType').isVisible().catch(() => false);
  console.log(`#proofType visible: ${proofVis}`);

  // Check all buttons - visible and hidden - look for save
  const allBtns = authenticatedPage.locator('button');
  const abCount = await allBtns.count();
  console.log(`ALL buttons: ${abCount}`);
  for (let i = 0; i < abCount; i++) {
    const id  = await allBtns.nth(i).getAttribute('id').catch(() => '');
    const vis = await allBtns.nth(i).isVisible().catch(() => false);
    const txt = await allBtns.nth(i).innerText().catch(() => '');
    const cls = await allBtns.nth(i).getAttribute('class').catch(() => '');
    if (vis || id?.toLowerCase().includes('save') || txt?.toLowerCase().includes('save')) {
      console.log(`  BTN id=${id} visible=${vis} text=${txt?.trim().slice(0,30)} cls=${cls?.slice(0,50)}`);
    }
  }

  // Check mandatory fields on current tab
  const mandatoryDivs = authenticatedPage.locator('.control-mandatory').filter({ visible: true });
  const mdCount = await mandatoryDivs.count();
  console.log(`Visible mandatory fields: ${mdCount}`);
  for (let i = 0; i < mdCount; i++) {
    const inp = mandatoryDivs.nth(i).locator('input, select').first();
    const id  = await inp.getAttribute('id').catch(() => '');
    const val = await inp.inputValue().catch(() => '');
    console.log(`  #${id} = "${val}"`);
  }
});

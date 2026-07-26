import { Page } from '@playwright/test';
import { CBS_SELECTORS } from '../../framework/config/selectors';
import { CBS_TIMEOUTS } from '../../framework/config/timeouts';

export class ModalComponent {
  constructor(private readonly page: Page) {}

  private loc(selector: string) { return this.page.locator(selector); }

  async confirmSave(): Promise<void> {
    await this.page.waitForSelector(CBS_SELECTORS.CONFIRM_SAVE_BTN, { state: 'attached', timeout: CBS_TIMEOUTS.SAVE });
    await this.page.evaluate((sel: string) => {
      const el = document.querySelector<HTMLElement>(sel);
      if (el) el.click();
    }, CBS_SELECTORS.CONFIRM_SAVE_BTN);
  }

  async confirmApprove(): Promise<void> {
    const approve = this.loc(CBS_SELECTORS.APPROVE_BTN);
    await approve.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    await approve.click();
    const confirm = this.loc(CBS_SELECTORS.CONFIRM_APPROVE);
    await confirm.waitFor({ state: 'attached', timeout: CBS_TIMEOUTS.ELEMENT });
    await this.page.evaluate((sel: string) => {
      const el = document.querySelector<HTMLElement>(sel);
      if (el) el.click();
    }, CBS_SELECTORS.CONFIRM_APPROVE);
  }

  async confirmReject(remark = 'Rejected by automation'): Promise<void> {
    const reject = this.loc(CBS_SELECTORS.REJECT_BTN);
    await reject.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    await reject.click();
    const remarkLoc = this.loc(CBS_SELECTORS.REJECT_REMARK);
    if (await remarkLoc.isVisible({ timeout: CBS_TIMEOUTS.SHORT }).catch(() => false)) {
      await remarkLoc.clear();
      await remarkLoc.fill(remark);
    }
    const confirm = this.loc(CBS_SELECTORS.CONFIRM_REJECT);
    await confirm.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    await confirm.click();
  }
}

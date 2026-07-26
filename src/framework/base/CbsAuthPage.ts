import { Page } from '@playwright/test';
import { CbsBasePage } from './CbsBasePage';
import { CBS_SELECTORS } from '../config/selectors';

export abstract class CbsAuthPage extends CbsBasePage {
  protected approveBtnSel:     string = CBS_SELECTORS.APPROVE_BTN;
  protected confirmApproveSel: string = CBS_SELECTORS.CONFIRM_APPROVE;
  protected rejectBtnSel:      string = CBS_SELECTORS.REJECT_BTN;
  protected rejectRemarkSel:   string = CBS_SELECTORS.REJECT_REMARK;
  protected confirmRejectSel:  string = CBS_SELECTORS.CONFIRM_REJECT;

  constructor(page: Page) { super(page); }

  async goto(): Promise<void> {
    await this.menu.navigate(this.menuPath[0], this.menuPath[1], this.menuPath[2]);
    await this.waitForAjax();
  }

  async selectPendingRecord(searchText = ''): Promise<void> {
    await this.grid.clickAuthorize(searchText);
  }

  async approve(searchText = ''): Promise<string> {
    await this.goto();
    await this.selectPendingRecord(searchText);
    await this.modal.confirmApprove();
    return this.toast.getSuccess();
  }

  async reject(searchText = '', remark = 'Rejected by automation'): Promise<string> {
    await this.goto();
    await this.selectPendingRecord(searchText);
    await this.modal.confirmReject(remark);
    return this.toast.getSuccess();
  }
}

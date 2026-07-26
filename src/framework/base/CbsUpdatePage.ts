import { Page } from '@playwright/test';
import { CbsBasePage } from './CbsBasePage';

export abstract class CbsUpdatePage extends CbsBasePage {
  constructor(page: Page) { super(page); }

  async searchRecord(searchText: string): Promise<void> {
    await this.waitForAjax();
    await this.grid.searchAndEdit(searchText);
  }

  async openEditForm(searchText = ''): Promise<void> {
    if (searchText) await this.grid.searchAndEdit(searchText);
  }

  async save(): Promise<string> {
    await this.click(this.saveBtn());
    await this.modal.confirmSave();
    return this.toast.getSuccess();
  }
}

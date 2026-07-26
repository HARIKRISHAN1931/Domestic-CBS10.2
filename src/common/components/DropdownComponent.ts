import { Page, Locator, expect } from '@playwright/test';
import { BaseComponent } from '../../framework/base/BaseComponent';

export class DropdownComponent extends BaseComponent {
  constructor(page: Page, root: Locator) {
    super(page, root);
  }

  async selectByText(optionText: string): Promise<void> {
    await this.root.selectOption({ label: optionText });
  }

  async selectByValue(value: string): Promise<void> {
    await this.root.selectOption({ value });
  }

  async getSelectedText(): Promise<string> { return this.root.inputValue(); }

  async getAllOptions(): Promise<string[]> { return this.root.locator('option').allTextContents(); }

  async verifyOptionExists(optionText: string): Promise<void> {
    expect(await this.getAllOptions()).toContain(optionText);
  }

  async verifySelectedValue(expectedText: string): Promise<void> {
    await expect(this.root).toHaveValue(expectedText);
  }
}

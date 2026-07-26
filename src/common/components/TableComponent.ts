import { Page, Locator } from '@playwright/test';
import { BaseComponent } from '../../framework/base/BaseComponent';

export class TableComponent extends BaseComponent {
  constructor(page: Page, root: Locator) {
    super(page, root);
  }

  private get rows(): Locator { return this.root.locator('tbody tr'); }
  private get headers(): Locator { return this.root.locator('thead th'); }

  async getRowCount(): Promise<number> { return this.rows.count(); }

  async getHeaderNames(): Promise<string[]> { return this.headers.allTextContents(); }

  async getCellValue(rowIndex: number, columnName: string): Promise<string> {
    const headers = await this.getHeaderNames();
    const colIndex = headers.findIndex((h) => h.trim() === columnName);
    if (colIndex === -1) throw new Error(`Column "${columnName}" not found`);
    return (await this.rows.nth(rowIndex).locator('td').nth(colIndex).textContent()) ?? '';
  }

  async clickRowAction(rowIndex: number, actionName: string): Promise<void> {
    await this.rows.nth(rowIndex).getByRole('button', { name: actionName }).click();
  }

  async findRowByColumnValue(columnName: string, value: string): Promise<number> {
    const count = await this.getRowCount();
    for (let i = 0; i < count; i++) {
      if ((await this.getCellValue(i, columnName)).trim() === value) return i;
    }
    return -1;
  }

  async getAllRowData(): Promise<Record<string, string>[]> {
    const headers = await this.getHeaderNames();
    const rowCount = await this.getRowCount();
    const data: Record<string, string>[] = [];
    for (let i = 0; i < rowCount; i++) {
      const row: Record<string, string> = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j].trim()] = (await this.rows.nth(i).locator('td').nth(j).textContent()) ?? '';
      }
      data.push(row);
    }
    return data;
  }
}

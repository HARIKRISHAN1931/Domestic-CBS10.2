import * as ExcelJS from 'exceljs';
import * as path from 'path';

export class ExcelHelper {
  static async readSheet<T extends Record<string, unknown>>(
    filePath: string,
    sheetName: string,
  ): Promise<T[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path.resolve(filePath));
    const sheet = workbook.getWorksheet(sheetName);
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found in ${filePath}`);

    const headers: string[] = [];
    const rows: T[] = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        row.eachCell((cell) => headers.push(String(cell.value ?? '')));
        return;
      }
      const record: Record<string, unknown> = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) record[header] = cell.value != null ? String(cell.value) : '';
      });
      if (Object.values(record).some((v) => v !== '')) rows.push(record as T);
    });

    return rows;
  }

  static async readRow<T extends Record<string, unknown>>(
    filePath: string,
    sheetName: string,
    rowIndex: number,
  ): Promise<T> {
    const rows = await this.readSheet<T>(filePath, sheetName);
    if (rowIndex >= rows.length) throw new Error(`Row ${rowIndex} not found in sheet "${sheetName}"`);
    return rows[rowIndex];
  }
}

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

    const cellText = (cell: ExcelJS.Cell): string => {
      const v = cell.value;
      if (!v) return '';
      if (typeof v === 'object' && 'richText' in (v as any))
        return (v as any).richText.map((r: any) => r.text ?? '').join('');
      return String(v);
    };

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        row.eachCell((cell) => headers.push(cellText(cell).trim()));
        return;
      }
      const record: Record<string, unknown> = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) record[header] = cellText(cell) || '';
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

  // Append a raw row of values to a sheet (used to store created accounts)
  static async appendRow(filePath: string, sheetName: string, values: (string | number)[]): Promise<void> {
    const fp = path.resolve(filePath);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(fp);
    const sheet = workbook.getWorksheet(sheetName);
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found in ${fp}`);
    sheet.addRow(values);
    await workbook.xlsx.writeFile(fp);
  }

  // Move a row from one sheet to another (used after authorization)
  static async moveRow(
    filePath:   string,
    fromSheet:  string,
    toSheet:    string,
    matchCol:   string,
    matchValue: string,
    extraValues: Record<string, string> = {},
  ): Promise<void> {
    const fp = path.resolve(filePath);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(fp);

    const src  = workbook.getWorksheet(fromSheet);
    const dest = workbook.getWorksheet(toSheet);
    if (!src)  throw new Error(`Sheet "${fromSheet}" not found`);
    if (!dest) throw new Error(`Sheet "${toSheet}" not found`);

    const cellText = (cell: ExcelJS.Cell): string => {
      const v = cell.value;
      if (!v) return '';
      if (typeof v === 'object' && 'richText' in (v as any))
        return (v as any).richText.map((r: any) => r.text ?? '').join('');
      return String(v);
    };

    // Find header row in source
    const srcHeaders: string[] = [];
    src.getRow(1).eachCell(c => srcHeaders.push(cellText(c).trim()));
    const matchColIdx = srcHeaders.indexOf(matchCol) + 1;
    if (!matchColIdx) throw new Error(`Column "${matchCol}" not found in sheet "${fromSheet}"`);

    // Find matching row
    let matchRowNum = -1;
    src.eachRow((row, i) => {
      if (i === 1) return;
      if (cellText(row.getCell(matchColIdx)) === matchValue) matchRowNum = i;
    });
    if (matchRowNum === -1) return; // row not found — already moved or not present

    // Copy row values to destination
    const srcRow   = src.getRow(matchRowNum);
    const rowVals  = srcHeaders.map((_, i) => cellText(srcRow.getCell(i + 1)));
    // Apply extra values (e.g. authStatus, authorizedAt)
    const destHeaders: string[] = [];
    dest.getRow(1).eachCell(c => destHeaders.push(cellText(c).trim()));
    const destVals = destHeaders.map(h => extraValues[h] ?? rowVals[srcHeaders.indexOf(h)] ?? '');
    dest.addRow(destVals);

    // Remove from source by splicing rows up
    src.spliceRows(matchRowNum, 1);

    await workbook.xlsx.writeFile(fp);
  }
}

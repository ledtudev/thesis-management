import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelService {
  async createExcelFile(
    columns: Partial<ExcelJS.Column>[],
    data: any[][],
    sheetName: string = 'Sheet',
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);
    sheet.columns = columns;
    sheet.addRows(data);

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
  }
}

import "server-only";
import ExcelJS from "exceljs";
import { EXPORT_COLUMNS } from "../lib/to-rows";
import type { ExportRequest } from "../schema";

const ACCENT = "FFFF7A1A";
const HEADER_BG = "FF0E141C";
const STRIPE = "FFF4F6F9";

/** สร้างไฟล์ .xlsx จริง (ไม่ใช่ CSV เปลี่ยนนามสกุล) พร้อมหัวตารางตรึงและฟิลเตอร์ */
export async function buildFleetXlsx(payload: ExportRequest): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TrackMate";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("รายงานกองรถ", {
    views: [{ state: "frozen", ySplit: 4 }],
    pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1 },
  });

  sheet.columns = EXPORT_COLUMNS.map((column) => ({
    key: column.key,
    width: column.width,
  }));

  const lastColumn = EXPORT_COLUMNS.length;

  const title = sheet.getCell(1, 1);
  title.value = "รายงานสถานะกองรถ · TrackMate";
  title.font = { size: 15, bold: true, color: { argb: "FF0E141C" } };
  sheet.mergeCells(1, 1, 1, lastColumn);
  sheet.getRow(1).height = 24;

  const meta = sheet.getCell(2, 1);
  meta.value = `ออกรายงานเมื่อ ${payload.generatedAt} · ทั้งหมด ${payload.rows.length} คัน`;
  meta.font = { size: 10, color: { argb: "FF67717F" } };
  sheet.mergeCells(2, 1, 2, lastColumn);

  const filters = sheet.getCell(3, 1);
  filters.value = payload.filterSummary || "เงื่อนไข: ทั้งหมด";
  filters.font = { size: 10, color: { argb: "FF67717F" } };
  sheet.mergeCells(3, 1, 3, lastColumn);

  const header = sheet.getRow(4);
  EXPORT_COLUMNS.forEach((column, index) => {
    const cell = header.getCell(index + 1);
    cell.value = column.header;
    cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG } };
    cell.alignment = { vertical: "middle", horizontal: column.align ?? "left" };
    cell.border = { bottom: { style: "medium", color: { argb: ACCENT } } };
  });
  header.height = 20;

  payload.rows.forEach((row, index) => {
    const line = sheet.addRow(row);
    line.height = 17;
    line.eachCell((cell, column) => {
      const spec = EXPORT_COLUMNS[column - 1];
      cell.font = { size: 10 };
      cell.alignment = { vertical: "middle", horizontal: spec?.align ?? "left" };
      if (index % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: STRIPE } };
      }
    });
  });

  sheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4, column: lastColumn } };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

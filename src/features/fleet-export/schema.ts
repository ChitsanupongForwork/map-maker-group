import { z } from "zod";

export const exportRowSchema = z.object({
  plate: z.string().max(32),
  label: z.string().max(64),
  status: z.string().max(32),
  dataStatus: z.string().max(32),
  speedKph: z.number().int().min(0).max(400),
  lastUpdate: z.string().max(32),
  driverName: z.string().max(64),
  groupName: z.string().max(64),
  areaName: z.string().max(64),
  address: z.string().max(160),
  odometerKm: z.number().min(0),
  fuelPct: z.number().min(0).max(100),
  position: z.string().max(40),
});

export const exportRequestSchema = z.object({
  format: z.enum(["xlsx", "pdf"]),
  /** สรุปเงื่อนไขที่ผู้ใช้กรองอยู่ตอนกดปุ่ม เอาไปพิมพ์บนหัวรายงาน */
  filterSummary: z.string().max(300).default(""),
  generatedAt: z.string().max(40),
  // กันไฟล์ใหญ่เกินจนเซิร์ฟเวอร์ค้าง
  rows: z.array(exportRowSchema).min(1).max(5000),
});

export type ExportRow = z.infer<typeof exportRowSchema>;
export type ExportRequest = z.infer<typeof exportRequestSchema>;

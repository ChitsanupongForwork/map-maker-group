import { z } from "zod";

export const vehicleStatusSchema = z.enum(["running", "parking", "engine-on", "offline"]);
export const dataStatusSchema = z.enum(["realtime", "delayed", "stale"]);

/** query string ของ /api/fleet/export — ใช้ตรวจก่อนสร้างไฟล์เสมอ */
export const exportQuerySchema = z.object({
  format: z.enum(["xlsx", "pdf"]),
  status: z.union([vehicleStatusSchema, z.literal("all")]).catch("all"),
  dataStatus: z.union([dataStatusSchema, z.literal("all")]).catch("all"),
  groupId: z.string().min(1).max(64).catch("all"),
  driverId: z.string().min(1).max(64).catch("all"),
  areaId: z.string().min(1).max(64).catch("all"),
  search: z.string().max(64).catch(""),
});

export type ExportQuery = z.infer<typeof exportQuerySchema>;

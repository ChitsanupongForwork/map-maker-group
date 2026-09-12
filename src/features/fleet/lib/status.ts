import { site } from "@/config/site";
import type { DataStatus, Vehicle, VehicleStatus } from "../types";

export const VEHICLE_STATUSES = [
  "running",
  "parking",
  "engine-on",
  "offline",
] as const satisfies readonly VehicleStatus[];

export const DATA_STATUSES = [
  "realtime",
  "delayed",
  "stale",
] as const satisfies readonly DataStatus[];

type Meta = { label: string; short: string; color: string };

export const STATUS_META: Record<VehicleStatus, Meta> = {
  running: { label: "กำลังวิ่ง", short: "Running", color: "var(--running)" },
  parking: { label: "จอด", short: "Parking", color: "var(--parking)" },
  "engine-on": { label: "จอดติดเครื่อง", short: "Engine On", color: "var(--engine)" },
  offline: { label: "ออฟไลน์", short: "Offline", color: "var(--offline)" },
};

export const DATA_STATUS_META: Record<DataStatus, Meta> = {
  realtime: { label: "เรียลไทม์", short: "Realtime", color: "var(--running)" },
  delayed: { label: "ไม่เรียลไทม์", short: "Not Realtime", color: "var(--engine)" },
  stale: { label: "ไม่อัพเดต", short: "Not Updated", color: "var(--offline)" },
};

/** สีจริง (ไม่ใช่ CSS var) สำหรับ canvas/สไปรท์บนแผนที่ */
export const STATUS_HEX: Record<VehicleStatus, string> = {
  running: "#22c55e",
  parking: "#3b82f6",
  "engine-on": "#f59e0b",
  offline: "#78859a",
};

/**
 * สถานะข้อมูลคำนวณจากอายุของข้อมูลล่าสุดเสมอ — ไม่เก็บเป็นฟิลด์
 * เพื่อไม่ให้ค่าค้างเมื่อเวลาเดินไปข้างหน้า
 */
export function deriveDataStatus(lastUpdate: number, now: number): DataStatus {
  const ageSec = (now - lastUpdate) / 1000;
  if (ageSec <= site.realtimeWindowSec) return "realtime";
  if (ageSec <= site.staleWindowSec) return "delayed";
  return "stale";
}

export const vehicleDataStatus = (vehicle: Vehicle, now: number) =>
  deriveDataStatus(vehicle.lastUpdate, now);

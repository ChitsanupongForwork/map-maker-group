// ── ประตูเดียวของฟีเจอร์ fleet ────────────────────────────────────────────
// ฟีเจอร์อื่นเห็นได้แค่สิ่งที่อยู่ในไฟล์นี้เท่านั้น

// state ของกองรถ (ตัวกรอง, การเลือกคัน, ข้อมูลสด)
export { FleetProvider, useFleet, useFleetActions } from "./hooks/fleet-provider";

// UI ที่หน้าอื่นเอาไปวางได้
export { FleetFilterBar } from "./components/fleet-filter-bar";
export { FleetStatsGrid } from "./components/fleet-stats-grid";
export { FleetSummaryCard } from "./components/fleet-summary-card";
export {
  DataStatusBadge,
  FilterChip,
  StatusDot,
  VehicleStatusLabel,
} from "./components/status-chip";

// ข้อมูล — ฝั่งเซิร์ฟเวอร์อยู่ที่ @/features/fleet/server
export { createMockFleet } from "./lib/mock-fleet";

// ตรรกะที่ใช้ร่วมกัน
export {
  DATA_STATUSES,
  DATA_STATUS_META,
  STATUS_HEX,
  STATUS_META,
  VEHICLE_STATUSES,
  deriveDataStatus,
} from "./lib/status";
export { buildFleetView, EMPTY_FILTER, sortVehicles } from "./lib/filter";
export { exportQuerySchema } from "./schema";

// type สาธารณะ
export type {
  DataStatus,
  FleetFilter,
  FleetOption,
  FleetSnapshot,
  SortKey,
  Vehicle,
  VehicleStatus,
} from "./types";
export type { ExportQuery } from "./schema";
export type { FleetView } from "./lib/filter";

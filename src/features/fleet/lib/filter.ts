import type {
  DataStatus,
  FleetCounts,
  FleetFilter,
  SortKey,
  Vehicle,
  VehicleStatus,
} from "../types";
import { deriveDataStatus } from "./status";

export const EMPTY_FILTER: FleetFilter = {
  status: "all",
  dataStatus: "all",
  groupId: "all",
  driverId: "all",
  areaId: "all",
  search: "",
};

export const isFilterActive = (filter: FleetFilter) =>
  filter.status !== "all" ||
  filter.dataStatus !== "all" ||
  filter.groupId !== "all" ||
  filter.driverId !== "all" ||
  filter.areaId !== "all" ||
  filter.search.trim() !== "";

/** ทะเบียนพิมพ์มาแบบไม่มีเว้นวรรคก็ต้องเจอ */
const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, "");

function matchesSearch(vehicle: Vehicle, needle: string) {
  if (!needle) return true;
  return (
    normalize(vehicle.plate).includes(needle) ||
    normalize(vehicle.driverName).includes(needle) ||
    normalize(vehicle.label).includes(needle)
  );
}

const matchesScope = (vehicle: Vehicle, filter: FleetFilter, needle: string) =>
  (filter.groupId === "all" || vehicle.groupId === filter.groupId) &&
  (filter.driverId === "all" || vehicle.driverId === filter.driverId) &&
  (filter.areaId === "all" || vehicle.areaId === filter.areaId) &&
  matchesSearch(vehicle, needle);

export type FleetView = {
  /** รถที่ผ่านทุกเงื่อนไข — ใช้วาดทั้งแผนที่และรายการ */
  vehicles: Vehicle[];
  /** ตัวเลขบนชิปสถานะรถ: นับโดยไม่สนใจตัวกรองสถานะรถเอง */
  statusCounts: FleetCounts["status"] & { all: number };
  /** ตัวเลขบนชิปสถานะข้อมูล: นับโดยไม่สนใจตัวกรองสถานะข้อมูลเอง */
  dataCounts: FleetCounts["data"] & { all: number };
  /** สถานะข้อมูลของแต่ละคัน ณ เวลานี้ — คำนวณรอบเดียวแล้วส่งต่อ */
  dataStatusById: Map<string, DataStatus>;
};

/**
 * เดินรายการรถรอบเดียว แล้วได้ทั้งผลกรองและตัวเลขทุกชิป
 * (แยกเป็นหลายรอบจะอ่านง่ายกว่า แต่ที่ 1,000+ คันมันคือการวน 1,000 ครั้งเพิ่มต่อชิป)
 */
export function buildFleetView(
  vehicles: readonly Vehicle[],
  filter: FleetFilter,
  now: number,
): FleetView {
  const needle = normalize(filter.search.trim());

  const statusCounts = {
    all: 0,
    running: 0,
    parking: 0,
    "engine-on": 0,
    offline: 0,
  } as FleetView["statusCounts"];
  const dataCounts = { all: 0, realtime: 0, delayed: 0, stale: 0 } as FleetView["dataCounts"];
  const dataStatusById = new Map<string, DataStatus>();
  const result: Vehicle[] = [];

  for (const vehicle of vehicles) {
    const dataStatus = deriveDataStatus(vehicle.lastUpdate, now);
    dataStatusById.set(vehicle.id, dataStatus);

    if (!matchesScope(vehicle, filter, needle)) continue;

    const statusOk = filter.status === "all" || vehicle.status === filter.status;
    const dataOk = filter.dataStatus === "all" || dataStatus === filter.dataStatus;

    if (dataOk) {
      statusCounts.all += 1;
      statusCounts[vehicle.status] += 1;
    }
    if (statusOk) {
      dataCounts.all += 1;
      dataCounts[dataStatus] += 1;
    }
    if (statusOk && dataOk) result.push(vehicle);
  }

  return { vehicles: result, statusCounts, dataCounts, dataStatusById };
}

const STATUS_RANK: Record<VehicleStatus, number> = {
  running: 0,
  "engine-on": 1,
  parking: 2,
  offline: 3,
};

export function sortVehicles(vehicles: Vehicle[], key: SortKey) {
  const sorted = [...vehicles];
  switch (key) {
    case "plate":
      return sorted.sort((a, b) => a.plate.localeCompare(b.plate, "th"));
    case "speed":
      return sorted.sort((a, b) => b.speedKph - a.speedKph);
    case "status":
      return sorted.sort(
        (a, b) =>
          STATUS_RANK[a.status] - STATUS_RANK[b.status] || b.lastUpdate - a.lastUpdate,
      );
    default:
      return sorted.sort((a, b) => b.lastUpdate - a.lastUpdate);
  }
}

import {
  DATA_STATUS_META,
  STATUS_META,
  type DataStatus,
  type FleetOption,
  type Vehicle,
} from "@/features/fleet";
import { formatDateTime, formatLatLng } from "@/shared/lib/format";
import type { ExportRow } from "../schema";

const labelOf = (options: readonly FleetOption[], value: string) =>
  options.find((option) => option.value === value)?.label ?? value;

/** แปลงรถที่กรองไว้เป็นแถวของไฟล์ — ทำฝั่ง client เพื่อให้ไฟล์ตรงกับที่เห็นบนจอเป๊ะ */
export function toExportRows(
  vehicles: readonly Vehicle[],
  dataStatusById: ReadonlyMap<string, DataStatus>,
  lookups: { groups: readonly FleetOption[]; areas: readonly FleetOption[] },
): ExportRow[] {
  return vehicles.map((vehicle) => ({
    plate: vehicle.plate,
    label: vehicle.label,
    status: STATUS_META[vehicle.status].label,
    dataStatus: DATA_STATUS_META[dataStatusById.get(vehicle.id) ?? "realtime"].label,
    speedKph: Math.round(vehicle.speedKph),
    lastUpdate: formatDateTime(vehicle.lastUpdate),
    driverName: vehicle.driverName,
    groupName: labelOf(lookups.groups, vehicle.groupId),
    areaName: labelOf(lookups.areas, vehicle.areaId),
    address: vehicle.address,
    odometerKm: Math.round(vehicle.odometerKm),
    fuelPct: vehicle.fuelPct,
    position: formatLatLng(vehicle.lat, vehicle.lng),
  }));
}

export type ExportColumn = {
  key: keyof ExportRow;
  header: string;
  width: number;
  align?: "left" | "right";
};

/** คำนิยามคอลัมน์ชุดเดียว ใช้ร่วมกันทั้ง Excel และ PDF จะได้ไม่หลุดกัน */
export const EXPORT_COLUMNS: readonly ExportColumn[] = [
  { key: "plate", header: "ทะเบียน", width: 14 },
  { key: "label", header: "รุ่นรถ", width: 20 },
  { key: "status", header: "สถานะรถ", width: 16 },
  { key: "dataStatus", header: "สถานะข้อมูล", width: 15 },
  { key: "speedKph", header: "ความเร็ว (km/h)", width: 15, align: "right" },
  { key: "lastUpdate", header: "อัพเดตล่าสุด", width: 18 },
  { key: "driverName", header: "คนขับ", width: 20 },
  { key: "groupName", header: "กลุ่ม", width: 16 },
  { key: "areaName", header: "พื้นที่", width: 16 },
  { key: "odometerKm", header: "เลขไมล์ (km)", width: 14, align: "right" },
  { key: "fuelPct", header: "น้ำมัน (%)", width: 11, align: "right" },
  { key: "position", header: "พิกัด", width: 22 },
  { key: "address", header: "ตำแหน่งล่าสุด", width: 46 },
];

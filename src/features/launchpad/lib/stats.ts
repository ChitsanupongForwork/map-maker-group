import {
  buildFleetView,
  EMPTY_FILTER,
  STATUS_META,
  VEHICLE_STATUSES,
  type FleetSnapshot,
} from "@/features/fleet";

export type LaunchpadStat = { label: string; value: number; color: string };

/** ตัวเลขสรุปบนหน้าแรก — คำนวณจาก snapshot เดียวกับที่หน้าอื่นใช้ */
export function toLaunchpadStats(snapshot: FleetSnapshot): LaunchpadStat[] {
  const view = buildFleetView(snapshot.vehicles, EMPTY_FILTER, snapshot.generatedAt);

  return [
    { label: "รถทั้งหมด", value: view.statusCounts.all, color: "var(--accent)" },
    ...VEHICLE_STATUSES.map((status) => ({
      label: STATUS_META[status].label,
      value: view.statusCounts[status],
      color: STATUS_META[status].color,
    })),
  ];
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { site } from "@/config/site";
import { buildFleetView, EMPTY_FILTER, sortVehicles, type FleetView } from "../lib/filter";
import { deriveDataStatus } from "../lib/status";
import type {
  DataStatus,
  FleetFilter,
  FleetSnapshot,
  SortKey,
  Vehicle,
  VehicleStatus,
} from "../types";

type FleetState = {
  snapshot: FleetSnapshot;
  vehicles: Vehicle[];
  /** "ตอนนี้" ของ UI — เริ่มจาก generatedAt เพื่อให้ server กับ client ตรงกัน */
  now: number;
  filter: FleetFilter;
  sort: SortKey;
  selectedId: string | null;
  live: boolean;
};

type FleetActions = {
  setStatus: (status: VehicleStatus | "all") => void;
  setDataStatus: (status: DataStatus | "all") => void;
  setScope: (patch: Partial<FleetFilter>) => void;
  setSearch: (search: string) => void;
  setSort: (sort: SortKey) => void;
  select: (id: string | null) => void;
  resetFilter: () => void;
  toggleLive: () => void;
};

type FleetContextValue = FleetState & {
  view: FleetView;
  /** รายการที่เรียงแล้ว — ใช้ร่วมกันทั้งตารางและการเลื่อนหาในแผนที่ */
  sorted: Vehicle[];
  selected: Vehicle | null;
};

const StateContext = createContext<FleetContextValue | null>(null);
const ActionsContext = createContext<FleetActions | null>(null);

const EARTH_DEG_PER_KM = 1 / 111.32;

/**
 * ขยับรถที่กำลังวิ่งไปตามหัวรถ และเลื่อนเวลาข้อมูลล่าสุดของคันที่ยังส่งข้อมูลอยู่
 * คำนวณเป็น loop เดียวบนอาเรย์เดิม — ไม่มีการ clone ทั้งก้อนโดยไม่จำเป็น
 */
function advanceFleet(vehicles: Vehicle[], elapsedMs: number, now: number): Vehicle[] {
  const hours = elapsedMs / 3_600_000;
  // สลับให้รถบางคันหลุดสัญญาณ/กลับมาออนไลน์ สัดส่วนสถานะข้อมูลจะได้ไม่ไหลไปทางเดียว
  const dropoutIndex = Math.random() < 0.1 ? Math.floor(Math.random() * vehicles.length) : -1;
  const reconnectIndex = Math.random() < 0.1 ? Math.floor(Math.random() * vehicles.length) : -1;

  return vehicles.map((vehicle, index) => {
    const dataStatus = deriveDataStatus(vehicle.lastUpdate, now);
    const reconnecting = index === reconnectIndex && dataStatus !== "realtime";
    const droppingOut = index === dropoutIndex && dataStatus === "realtime";
    const reporting = (dataStatus === "realtime" && !droppingOut) || reconnecting;

    if (!reporting && vehicle.status !== "running") return vehicle;

    const next: Vehicle = { ...vehicle };

    if (reporting) {
      next.lastUpdate = now;
    } else if (droppingOut) {
      // ดันเวลาข้อมูลให้ถอยออกนอกกรอบเรียลไทม์ทันที
      next.lastUpdate = now - (site.realtimeWindowSec + 30) * 1000;
    }

    if (vehicle.status === "running" && reporting) {
      const heading = (vehicle.headingDeg + (Math.random() - 0.5) * 14 + 360) % 360;
      const km = vehicle.speedKph * hours;
      const rad = (heading * Math.PI) / 180;
      next.headingDeg = Math.round(heading);
      next.lat = vehicle.lat + Math.cos(rad) * km * EARTH_DEG_PER_KM;
      next.lng =
        vehicle.lng +
        (Math.sin(rad) * km * EARTH_DEG_PER_KM) /
          Math.max(0.2, Math.cos((vehicle.lat * Math.PI) / 180));
      next.speedKph = Math.max(
        8,
        Math.min(118, vehicle.speedKph + Math.round((Math.random() - 0.5) * 10)),
      );
      next.todayDistanceKm = vehicle.todayDistanceKm + km;
    }

    return next;
  });
}

export function FleetProvider({
  snapshot,
  children,
}: {
  snapshot: FleetSnapshot;
  children: ReactNode;
}) {
  const [vehicles, setVehicles] = useState(snapshot.vehicles);
  const [now, setNow] = useState(snapshot.generatedAt);
  const [filter, setFilter] = useState<FleetFilter>(EMPTY_FILTER);
  const [sort, setSort] = useState<SortKey>("lastUpdate");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [live, setLive] = useState(true);
  const lastTick = useRef(snapshot.generatedAt);

  useEffect(() => {
    if (!live) return;
    lastTick.current = Date.now();
    const id = window.setInterval(() => {
      const stamp = Date.now();
      const elapsed = stamp - lastTick.current;
      lastTick.current = stamp;
      setNow(stamp);
      setVehicles((current) => advanceFleet(current, elapsed, stamp));
    }, site.liveTickMs);
    return () => window.clearInterval(id);
  }, [live]);

  // หยุดสตรีมเมื่อแท็บถูกซ่อน: ไม่มีใครดู ก็ไม่ต้องเผา CPU
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") lastTick.current = Date.now();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const view = useMemo(() => buildFleetView(vehicles, filter, now), [vehicles, filter, now]);
  const sorted = useMemo(() => sortVehicles(view.vehicles, sort), [view.vehicles, sort]);
  const selected = useMemo(
    () => (selectedId ? (vehicles.find((item) => item.id === selectedId) ?? null) : null),
    [vehicles, selectedId],
  );

  const actions = useMemo<FleetActions>(
    () => ({
      setStatus: (status) => setFilter((current) => ({ ...current, status })),
      setDataStatus: (dataStatus) => setFilter((current) => ({ ...current, dataStatus })),
      setScope: (patch) => setFilter((current) => ({ ...current, ...patch })),
      setSearch: (search) => setFilter((current) => ({ ...current, search })),
      setSort,
      select: setSelectedId,
      resetFilter: () => setFilter(EMPTY_FILTER),
      toggleLive: () => setLive((current) => !current),
    }),
    [],
  );

  const value = useMemo<FleetContextValue>(
    () => ({ snapshot, vehicles, now, filter, sort, selectedId, live, view, sorted, selected }),
    [snapshot, vehicles, now, filter, sort, selectedId, live, view, sorted, selected],
  );

  return (
    <ActionsContext.Provider value={actions}>
      <StateContext.Provider value={value}>{children}</StateContext.Provider>
    </ActionsContext.Provider>
  );
}

export function useFleet() {
  const value = useContext(StateContext);
  if (!value) throw new Error("useFleet ต้องอยู่ภายใต้ <FleetProvider>");
  return value;
}

/** แยก context ของ action ออกมา ปุ่มต่าง ๆ จะได้ไม่ re-render ตามข้อมูลสด */
export function useFleetActions() {
  const value = useContext(ActionsContext);
  if (!value) throw new Error("useFleetActions ต้องอยู่ภายใต้ <FleetProvider>");
  return value;
}

/** ใช้กับปุ่มที่ต้อง "เลือกรถแล้วเลื่อนแผนที่ไปหา" */
export function useSelectVehicle() {
  const { select } = useFleetActions();
  return useCallback((id: string | null) => select(id), [select]);
}

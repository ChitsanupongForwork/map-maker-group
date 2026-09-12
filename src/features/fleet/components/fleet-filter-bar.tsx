"use client";

import { Boxes, MapPin, RotateCcw, Truck, User } from "lucide-react";
import { memo, useMemo } from "react";
import { Dropdown } from "@/shared/ui/dropdown";
import { cn } from "@/shared/lib/cn";
import { useFleet, useFleetActions } from "../hooks/fleet-provider";
import { DATA_STATUSES, DATA_STATUS_META, STATUS_META, VEHICLE_STATUSES } from "../lib/status";
import { isFilterActive } from "../lib/filter";
import { FilterChip } from "./status-chip";

function FilterCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("panel flex min-w-0 flex-col gap-2 px-3 py-2.5", className)}>
      <span className="text-[11px] font-medium tracking-wide text-dim">{title}</span>
      <div className="flex min-w-0 items-center gap-2">{children}</div>
    </div>
  );
}

const ALL = "all" as const;

export const FleetFilterBar = memo(function FleetFilterBar() {
  const { filter, view, snapshot } = useFleet();
  const { setStatus, setDataStatus, setScope, resetFilter } = useFleetActions();

  const groupOptions = useMemo(
    () => [{ value: ALL, label: "All Groups" }, ...snapshot.groups],
    [snapshot.groups],
  );
  const driverOptions = useMemo(
    () => [{ value: ALL, label: "All Drivers" }, ...snapshot.drivers],
    [snapshot.drivers],
  );
  const areaOptions = useMemo(
    () => [{ value: ALL, label: "All Areas" }, ...snapshot.areas],
    [snapshot.areas],
  );

  const dirty = isFilterActive(filter);

  return (
    // การ์ดสองใบแรกกว้างเท่าชิปที่อยู่ข้างใน ที่เหลือยกให้ช่อง dropdown ทั้งหมด
    <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,auto)_minmax(0,auto)_minmax(0,1fr)]">
      <FilterCard title="สถานะรถ · Vehicle Status" className="overflow-x-auto">
        <FilterChip
          label="All"
          count={view.statusCounts.all}
          active={filter.status === ALL}
          icon={<Truck className="size-3.5" />}
          onClick={() => setStatus(ALL)}
        />
        {VEHICLE_STATUSES.map((status) => (
          <FilterChip
            key={status}
            label={STATUS_META[status].short}
            count={view.statusCounts[status]}
            color={STATUS_META[status].color}
            active={filter.status === status}
            onClick={() => setStatus(filter.status === status ? ALL : status)}
          />
        ))}
      </FilterCard>

      <FilterCard title="สถานะข้อมูล · Data Status" className="overflow-x-auto">
        {DATA_STATUSES.map((status) => (
          <FilterChip
            key={status}
            label={DATA_STATUS_META[status].short}
            count={view.dataCounts[status]}
            color={DATA_STATUS_META[status].color}
            active={filter.dataStatus === status}
            onClick={() => setDataStatus(filter.dataStatus === status ? ALL : status)}
          />
        ))}
      </FilterCard>

      <div className="panel flex min-w-0 items-end gap-2 px-3 py-2.5">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-[11px] font-medium tracking-wide text-dim">Group</span>
          <Dropdown
            label="เลือกกลุ่มรถ"
            icon={<Boxes className="size-3" />}
            options={groupOptions}
            value={filter.groupId}
            onChange={(groupId) => setScope({ groupId })}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-[11px] font-medium tracking-wide text-dim">Driver</span>
          <Dropdown
            label="เลือกคนขับ"
            icon={<User className="size-3" />}
            searchPlaceholder="ค้นหาชื่อคนขับ…"
            options={driverOptions}
            value={filter.driverId}
            onChange={(driverId) => setScope({ driverId })}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-[11px] font-medium tracking-wide text-dim">Area / Zone</span>
          <Dropdown
            label="เลือกพื้นที่"
            icon={<MapPin className="size-3" />}
            options={areaOptions}
            value={filter.areaId}
            onChange={(areaId) => setScope({ areaId })}
          />
        </div>
        <button
          type="button"
          onClick={resetFilter}
          disabled={!dirty}
          className={cn(
            "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] px-2.5 text-[12px] font-medium transition-colors",
            dirty
              ? "text-[var(--accent)] hover:bg-[var(--accent-soft)]"
              : "text-dim/60 cursor-not-allowed",
          )}
        >
          <RotateCcw className="size-3.5" />
          Reset
        </button>
      </div>
    </div>
  );
});

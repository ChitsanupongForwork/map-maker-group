"use client";

import { Car, ChevronRight } from "lucide-react";
import { memo } from "react";
import {
  DataStatusBadge,
  STATUS_META,
  StatusDot,
  type DataStatus,
  type Vehicle,
} from "@/features/fleet";
import { cn } from "@/shared/lib/cn";
import { formatTime } from "@/shared/lib/format";

export const ROW_HEIGHT = 60;

type Props = {
  vehicle: Vehicle;
  dataStatus: DataStatus;
  selected: boolean;
  onSelect: (id: string) => void;
};

/**
 * แถวเดียวของรายการรถ
 * memo ไว้เพราะข้อมูลสดเข้ามาทุก 3 วินาที — คันที่ไม่มีอะไรเปลี่ยนจะไม่วาดใหม่
 */
export const VehicleRow = memo(function VehicleRow({
  vehicle,
  dataStatus,
  selected,
  onSelect,
}: Props) {
  const meta = STATUS_META[vehicle.status];

  return (
    <button
      type="button"
      onClick={() => onSelect(vehicle.id)}
      aria-current={selected}
      style={{ height: ROW_HEIGHT - 6 }}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-[10px] border px-2.5 text-left",
        "transition-[background-color,border-color] duration-150",
        selected
          ? "border-[var(--accent-line)] bg-[var(--accent-soft)]"
          : "border-transparent hover:border-line hover:bg-surface-2/70",
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg border",
          selected
            ? "border-[var(--accent-line)] bg-[rgba(255,122,26,0.14)] text-[var(--accent)]"
            : "border-line bg-surface-2 text-muted",
        )}
      >
        <Car className="size-4" />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-[13px] font-semibold tracking-tight text-content">
          {vehicle.plate}
        </span>
        <span className="flex items-center gap-1.5 text-[11px]">
          <StatusDot color={meta.color} pulse={vehicle.status === "running"} />
          <span className="text-muted">{meta.short}</span>
        </span>
      </span>

      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-[11px] text-dim tabular-nums">
          {formatTime(vehicle.lastUpdate)}
        </span>
        {dataStatus === "realtime" ? (
          <span className="text-[11px] text-muted tabular-nums">{vehicle.speedKph} km/h</span>
        ) : (
          <DataStatusBadge status={dataStatus} />
        )}
      </span>

      <ChevronRight
        className={cn(
          "size-4 shrink-0 transition-colors",
          selected ? "text-[var(--accent)]" : "text-dim group-hover:text-muted",
        )}
      />
    </button>
  );
});

"use client";

import { STATUS_META, StatusDot, type Vehicle } from "@/features/fleet";
import { formatTime } from "@/shared/lib/format";

/** ป้ายข้อมูลย่อที่ลอยอยู่เหนือหมุดของรถที่ถูกเลือก */
export function VehicleCallout({ vehicle }: { vehicle: Vehicle }) {
  const meta = STATUS_META[vehicle.status];

  return (
    <div className="w-[168px]">
      <div className="panel bg-[rgba(11,16,23,0.94)] px-3 py-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[13px] font-semibold tracking-tight text-content">
            {vehicle.plate}
          </span>
          <StatusDot color={meta.color} pulse={vehicle.status === "running"} />
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px]">
          <span className="text-content tabular-nums">{vehicle.speedKph} km/h</span>
          <span className="text-dim">·</span>
          <span style={{ color: meta.color }}>{meta.short}</span>
        </div>
        <div className="mt-0.5 text-[11px] text-dim">
          อัพเดตล่าสุด {formatTime(vehicle.lastUpdate)}
        </div>
      </div>
    </div>
  );
}

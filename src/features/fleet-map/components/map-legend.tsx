"use client";

import { memo } from "react";
import { STATUS_META, StatusDot, VEHICLE_STATUSES } from "@/features/fleet";

/** คำอธิบายสีหมุด มุมบนซ้ายใต้ปุ่มสลับชนิดแผนที่ */
export const MapLegend = memo(function MapLegend() {
  return (
    <div className="pointer-events-none absolute top-[52px] left-3 z-10">
      <div className="panel flex flex-col gap-1.5 px-3 py-2.5 backdrop-blur-md">
        {VEHICLE_STATUSES.map((status) => (
          <span key={status} className="flex items-center gap-2 text-[11px] text-muted">
            <StatusDot color={STATUS_META[status].color} />
            {STATUS_META[status].short}
          </span>
        ))}
      </div>
    </div>
  );
});

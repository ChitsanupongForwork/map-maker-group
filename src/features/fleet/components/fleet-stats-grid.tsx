"use client";

import { memo } from "react";
import { formatNumber } from "@/shared/lib/format";
import { useFleet } from "../hooks/fleet-provider";
import {
  DATA_STATUSES,
  DATA_STATUS_META,
  STATUS_META,
  VEHICLE_STATUSES,
} from "../lib/status";

function StatCard({
  label,
  sub,
  value,
  total,
  color,
}: {
  label: string;
  sub: string;
  value: number;
  total: number;
  color: string;
}) {
  const percent = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div className="panel flex flex-col gap-2.5 px-3.5 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[12px] text-muted">
          <span
            className="size-1.5 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}80` }}
          />
          {label}
        </span>
        <span className="text-[11px] text-dim tabular-nums">{percent}%</span>
      </div>
      <span className="text-[26px] leading-none font-semibold tracking-tight text-content tabular-nums">
        {formatNumber(value)}
      </span>
      <span className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
        <span
          className="block h-full rounded-full transition-[width] duration-500"
          style={{ width: `${percent}%`, background: color }}
        />
      </span>
      <span className="text-[11px] text-dim">{sub}</span>
    </div>
  );
}

/** ตารางสรุปสัดส่วนสถานะรถและสถานะข้อมูล ใช้บนหน้ารายงาน */
export const FleetStatsGrid = memo(function FleetStatsGrid() {
  const { view } = useFleet();
  const total = view.statusCounts.all;

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-2.5">
        <h2 className="text-[13px] font-semibold tracking-tight text-content">
          สัดส่วนสถานะรถ
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {VEHICLE_STATUSES.map((status) => (
            <StatCard
              key={status}
              label={STATUS_META[status].label}
              sub={STATUS_META[status].short}
              value={view.statusCounts[status]}
              total={total}
              color={STATUS_META[status].color}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <h2 className="text-[13px] font-semibold tracking-tight text-content">
          สัดส่วนสถานะข้อมูล
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DATA_STATUSES.map((status) => (
            <StatCard
              key={status}
              label={DATA_STATUS_META[status].label}
              sub={DATA_STATUS_META[status].short}
              value={view.dataCounts[status]}
              total={view.dataCounts.all}
              color={DATA_STATUS_META[status].color}
            />
          ))}
        </div>
      </section>
    </div>
  );
});

"use client";

import { TrendingUp } from "lucide-react";
import { memo } from "react";
import { formatNumber } from "@/shared/lib/format";
import { useFleet, useFleetActions } from "../hooks/fleet-provider";
import { STATUS_META, VEHICLE_STATUSES } from "../lib/status";
import { StatusDot } from "./status-chip";

/** การ์ดสรุปมุมล่างซ้ายของแผนที่ */
export const FleetSummaryCard = memo(function FleetSummaryCard() {
  const { view, filter } = useFleet();
  const { setStatus } = useFleetActions();

  return (
    <div className="panel w-[180px] overflow-hidden backdrop-blur-md">
      <div className="border-b border-line px-3 py-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-dim">Total Vehicles</span>
          <TrendingUp className="size-3.5 text-[var(--running)]" />
        </div>
        <span className="text-[26px] leading-tight font-semibold tracking-tight text-content tabular-nums">
          {formatNumber(view.statusCounts.all)}
        </span>
      </div>
      <ul className="p-1.5">
        {VEHICLE_STATUSES.map((status) => {
          const meta = STATUS_META[status];
          const active = filter.status === status;
          return (
            <li key={status}>
              <button
                type="button"
                onClick={() => setStatus(active ? "all" : status)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                  active ? "bg-[var(--accent-soft)]" : "hover:bg-surface-2"
                }`}
              >
                <StatusDot color={meta.color} />
                <span className="flex-1 truncate text-[12px] text-muted">{meta.short}</span>
                <span className="text-[12px] font-medium text-content tabular-nums">
                  {formatNumber(view.statusCounts[status])}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
});

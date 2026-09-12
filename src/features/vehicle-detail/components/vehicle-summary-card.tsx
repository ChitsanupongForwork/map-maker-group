"use client";

import { Clock3, History, MapPin, MoreHorizontal, Navigation, Wifi, WifiOff } from "lucide-react";
import {
  DATA_STATUS_META,
  STATUS_META,
  StatusDot,
  type DataStatus,
  type Vehicle,
} from "@/features/fleet";
import { cn } from "@/shared/lib/cn";
import { formatTime } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";

function CarArt({ status }: { status: Vehicle["status"] }) {
  const color = STATUS_META[status].color;
  return (
    <div className="relative grid h-[68px] w-[104px] shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-[radial-gradient(120%_90%_at_50%_0%,#1b2532,#0d131b)]">
      <svg viewBox="0 0 120 56" className="w-[92px]" aria-hidden>
        <path
          d="M8 40h104"
          stroke="var(--line-strong)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 38c0-6 2-9 6-10l10-12c2-2 4-3 7-3h28c3 0 5 1 7 3l10 12c4 1 6 4 6 10z"
          fill="#e8edf4"
          opacity="0.92"
        />
        <path
          d="M38 18h20l8 10H31z"
          fill="#0d131b"
          opacity="0.55"
        />
        <circle cx="35" cy="39" r="7" fill="#0b1017" stroke={color} strokeWidth="2.5" />
        <circle cx="85" cy="39" r="7" fill="#0b1017" stroke={color} strokeWidth="2.5" />
      </svg>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-[11px] text-dim">{label}</span>
      <span className="truncate text-[13px] font-medium text-content">{children}</span>
    </div>
  );
}

export function VehicleSummaryCard({
  vehicle,
  dataStatus,
}: {
  vehicle: Vehicle;
  dataStatus: DataStatus;
}) {
  const meta = STATUS_META[vehicle.status];
  const dataMeta = DATA_STATUS_META[dataStatus];
  const online = dataStatus !== "stale";

  return (
    <section className="panel flex min-w-0 flex-col gap-3 p-3.5">
      <div className="flex items-start gap-3">
        <CarArt status={vehicle.status} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[18px] font-semibold tracking-tight text-content">
              {vehicle.plate}
            </h3>
            <span
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium"
              style={{ background: `color-mix(in srgb, ${meta.color} 14%, transparent)`, color: meta.color }}
            >
              <StatusDot color={meta.color} pulse={vehicle.status === "running"} />
              {meta.short}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
            <Field label="ความเร็ว">
              <span className="tabular-nums">{vehicle.speedKph} km/h</span>
            </Field>
            <Field label="สถานะเครื่องยนต์">
              <span className="inline-flex items-center gap-1.5" style={{ color: meta.color }}>
                <StatusDot color={meta.color} />
                {vehicle.status === "offline" ? "ไม่ทราบ" : meta.label}
              </span>
            </Field>
            <Field label="อัพเดตล่าสุด">
              <span className="inline-flex items-center gap-1.5">
                <span className="tabular-nums">{formatTime(vehicle.lastUpdate)}</span>
                <span
                  className="text-[11px] font-normal"
                  style={{ color: dataMeta.color }}
                >
                  ({dataMeta.label})
                </span>
                {online ? (
                  <Wifi className="size-3.5 text-[var(--running)]" />
                ) : (
                  <WifiOff className="size-3.5 text-[var(--offline)]" />
                )}
              </span>
            </Field>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 items-start gap-2 rounded-[10px] border border-line bg-surface-2/60 px-3 py-2.5">
        <MapPin className="mt-0.5 size-3.5 shrink-0 text-[var(--accent)]" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[11px] text-dim">ตำแหน่งปัจจุบัน</span>
          <span className="line-clamp-2 text-[12px] leading-snug text-content">
            {vehicle.address}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <Clock3 className="size-3.5" />
          View Details
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <History className="size-3.5" />
          History
        </Button>
        <Button variant="primary" size="sm" className="flex-1">
          <Navigation className="size-3.5" />
          Navigate
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-label="ตัวเลือกเพิ่มเติม"
          className={cn("w-9 px-0")}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    </section>
  );
}

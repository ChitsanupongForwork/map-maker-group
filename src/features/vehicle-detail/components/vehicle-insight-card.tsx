"use client";

import { Compass, Fuel, Gauge as GaugeIcon, Route, Timer } from "lucide-react";
import { useMemo, useState } from "react";
import { STATUS_META, type Vehicle } from "@/features/fleet";
import { formatLatLng, formatNumber } from "@/shared/lib/format";
import { Gauge } from "@/shared/ui/gauge";
import { Sparkline } from "@/shared/ui/sparkline";
import { Tabs } from "@/shared/ui/tabs";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "speed", label: "Speed" },
  { value: "engine", label: "Engine" },
  { value: "location", label: "Location" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

const HOUR_LABELS = ["00:00", "06:00", "12:00", "18:00", "24:00"] as const;

function Stat({
  icon,
  label,
  value,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-muted">
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-[11px] text-dim">{label}</span>
        {value ? (
          <span className="truncate text-[13px] font-medium text-content tabular-nums">
            {value}
          </span>
        ) : null}
        {children}
      </div>
    </div>
  );
}

function FuelBar({ percent }: { percent: number }) {
  return (
    <>
      <span className="text-[13px] font-medium text-content tabular-nums">{percent}%</span>
      <span className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
        <span
          className="block h-full rounded-full bg-[linear-gradient(90deg,var(--accent),#ffb066)]"
          style={{ width: `${percent}%` }}
        />
      </span>
    </>
  );
}

export function VehicleInsightCard({ vehicle }: { vehicle: Vehicle }) {
  const [tab, setTab] = useState<TabValue>("overview");
  const meta = STATUS_META[vehicle.status];

  const stats = useMemo(() => {
    const history = vehicle.speedHistory;
    const max = Math.max(...history);
    const avg = Math.round(history.reduce((sum, value) => sum + value, 0) / history.length);
    const moving = history.filter((value) => value > 5).length;
    return { max, avg, movingPct: Math.round((moving / history.length) * 100) };
  }, [vehicle.speedHistory]);

  return (
    <section className="panel flex min-h-0 min-w-0 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 border-b border-line px-2.5 py-2">
        <Tabs items={TABS} value={tab} onChange={setTab} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-[132px_minmax(0,1fr)_minmax(0,1.25fr)]">
        <Gauge
          value={vehicle.speedKph}
          caption="Current Speed"
          color={meta.color}
          className="justify-self-center"
        />

        <div className="flex flex-col justify-center gap-3 rounded-[10px] border border-line bg-surface-2/50 px-3 py-3">
          {tab === "location" ? (
            <>
              <Stat
                icon={<Compass className="size-3.5" />}
                label="พิกัด"
                value={formatLatLng(vehicle.lat, vehicle.lng)}
              />
              <Stat
                icon={<Route className="size-3.5" />}
                label="ทิศทาง"
                value={`${vehicle.headingDeg}°`}
              />
              <Stat
                icon={<Timer className="size-3.5" />}
                label="ระยะทางวันนี้"
                value={`${formatNumber(Math.round(vehicle.todayDistanceKm))} km`}
              />
            </>
          ) : tab === "engine" ? (
            <>
              <Stat
                icon={<GaugeIcon className="size-3.5" />}
                label="สถานะเครื่องยนต์"
                value={<span style={{ color: meta.color }}>{meta.label}</span>}
              />
              <Stat
                icon={<Timer className="size-3.5" />}
                label="ชั่วโมงเครื่องยนต์"
                value={`${formatNumber(vehicle.engineHours)} ชม.`}
              />
              <Stat icon={<Fuel className="size-3.5" />} label="Fuel">
                <FuelBar percent={vehicle.fuelPct} />
              </Stat>
            </>
          ) : tab === "speed" ? (
            <>
              <Stat
                icon={<GaugeIcon className="size-3.5" />}
                label="ความเร็วสูงสุด 24 ชม."
                value={`${stats.max} km/h`}
              />
              <Stat
                icon={<Route className="size-3.5" />}
                label="ความเร็วเฉลี่ย"
                value={`${stats.avg} km/h`}
              />
              <Stat
                icon={<Timer className="size-3.5" />}
                label="สัดส่วนเวลาที่วิ่ง"
                value={`${stats.movingPct}%`}
              />
            </>
          ) : (
            <>
              <Stat
                icon={<GaugeIcon className="size-3.5" />}
                label="Engine"
                value={<span style={{ color: meta.color }}>{meta.short}</span>}
              />
              <Stat icon={<Fuel className="size-3.5" />} label="Fuel">
                <FuelBar percent={vehicle.fuelPct} />
              </Stat>
              <Stat
                icon={<Route className="size-3.5" />}
                label="Odometer"
                value={`${formatNumber(vehicle.odometerKm)} km`}
              />
            </>
          )}
        </div>

        <div className="flex min-w-0 flex-col rounded-[10px] border border-line bg-surface-2/50 px-3 py-2.5">
          <span className="mb-1 text-[12px] font-medium text-content">Last 24 Hours</span>
          <Sparkline
            values={vehicle.speedHistory}
            labels={HOUR_LABELS}
            color={meta.color}
            className="min-h-[92px] flex-1"
          />
        </div>
      </div>
    </section>
  );
}

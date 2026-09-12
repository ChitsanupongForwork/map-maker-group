import { cn } from "@/shared/lib/cn";
import { formatNumber } from "@/shared/lib/format";
import { DATA_STATUS_META, STATUS_META } from "../lib/status";
import type { DataStatus, VehicleStatus } from "../types";

export function StatusDot({
  color,
  className,
  pulse,
}: {
  color: string;
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span className={cn("relative flex size-2 shrink-0", className)}>
      {pulse ? (
        <span
          className="absolute inset-0 animate-ping rounded-full opacity-60"
          style={{ background: color }}
        />
      ) : null}
      <span
        className="relative size-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}80` }}
      />
    </span>
  );
}

/** ป้ายสถานะในแถวรายการรถ */
export function VehicleStatusLabel({
  status,
  className,
}: {
  status: VehicleStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px]", className)}>
      <StatusDot color={meta.color} pulse={status === "running"} />
      <span className="text-muted">{meta.short}</span>
    </span>
  );
}

export function DataStatusBadge({
  status,
  className,
}: {
  status: DataStatus;
  className?: string;
}) {
  if (status === "realtime") return null;
  const meta = DATA_STATUS_META[status];
  const stale = status === "stale";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-[3px] text-[10px] font-medium",
        stale
          ? "border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.12)] text-[#f87171]"
          : "border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.12)] text-[#fbbf24]",
        className,
      )}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: stale ? "#f87171" : "#fbbf24" }}
      />
      {meta.label}
    </span>
  );
}

/** ชิปตัวกรองด้านบน: จุดสี + ชื่อสถานะ + จำนวน */
export function FilterChip({
  label,
  count,
  color,
  active,
  icon,
  onClick,
}: {
  label: string;
  count: number;
  color?: string;
  active: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group flex h-[46px] min-w-[86px] items-center gap-2 rounded-[10px] border px-2.5 text-left",
        "transition-[background-color,border-color] duration-150",
        active
          ? "border-[var(--accent-line)] bg-[var(--accent-soft)]"
          : "border-line bg-surface-2/60 hover:border-line-strong hover:bg-surface-2",
      )}
    >
      {icon ? (
        <span
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-lg transition-colors",
            active
              ? "bg-[var(--accent)] text-[#160800]"
              : "bg-surface-3 text-muted group-hover:text-content",
          )}
        >
          {icon}
        </span>
      ) : (
        <StatusDot color={color ?? "var(--offline)"} className="ml-1" />
      )}
      <span className="flex min-w-0 flex-col leading-tight">
        <span
          className={cn(
            "truncate text-[11px]",
            active ? "text-[var(--accent)]" : "text-muted",
          )}
        >
          {label}
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-content tabular-nums">
          {formatNumber(count)}
        </span>
      </span>
    </button>
  );
}

"use client";

import { Bell, ChevronDown, Pause, Play } from "lucide-react";
import { site } from "@/config/site";
import { useFleet, useFleetActions } from "@/features/fleet";
import { cn } from "@/shared/lib/cn";
import { formatClock } from "@/shared/lib/format";

/** สถานะสตรีมข้อมูลสด — กดเพื่อหยุด/เล่นต่อได้ */
function LivePill() {
  const { live, now } = useFleet();
  const { toggleLive } = useFleetActions();

  return (
    <button
      type="button"
      onClick={toggleLive}
      aria-pressed={live}
      className={cn(
        "group flex h-9 items-center gap-2 rounded-full border py-1 pr-3 pl-1.5 transition-colors duration-150",
        live
          ? "border-[rgba(34,197,94,0.28)] bg-[rgba(34,197,94,0.1)]"
          : "border-line bg-surface-2",
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium",
          live ? "bg-[rgba(34,197,94,0.16)] text-[#4ade80]" : "bg-surface-3 text-muted",
        )}
      >
        {live ? (
          <span className="relative flex size-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#4ade80] opacity-70" />
            <span className="relative size-1.5 rounded-full bg-[#4ade80]" />
          </span>
        ) : (
          <Pause className="size-3" />
        )}
        {live ? "Live" : "Paused"}
      </span>
      <span className="text-[11px] text-muted tabular-nums">
        Last update {formatClock(now)}
      </span>
      {live ? null : <Play className="size-3 text-dim group-hover:text-content" />}
    </button>
  );
}

/**
 * แถบบน — ไม่มีช่องค้นหาแล้ว (ย้ายไปอยู่หัวตารางรายการรถ)
 * เหลือแบรนด์ สถานะสตรีม การแจ้งเตือน และบัญชีผู้ใช้
 */
export function Topbar() {
  return (
    <header className="flex h-[var(--header-h)] shrink-0 items-center justify-between gap-4 border-b border-line bg-[rgba(9,13,19,0.72)] px-4 backdrop-blur-xl">
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[15px] leading-tight font-semibold tracking-tight text-content">
          {site.name}
        </span>
        <span className="truncate text-[11px] text-dim">{site.tagline}</span>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <LivePill />

        <button
          type="button"
          aria-label="การแจ้งเตือน"
          className="relative grid size-9 place-items-center rounded-[10px] border border-line bg-surface-2/80 text-muted transition-colors hover:border-line-strong hover:text-content"
        >
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[var(--accent)] ring-2 ring-[#0b1017]" />
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-line bg-surface-2/80 py-1 pr-2 pl-1 transition-colors hover:border-line-strong"
        >
          <span className="grid size-7 place-items-center rounded-full bg-[linear-gradient(145deg,#ff9145,#e2620a)] text-[12px] font-semibold text-[#160800]">
            C
          </span>
          <ChevronDown className="size-3.5 text-dim" />
        </button>
      </div>
    </header>
  );
}

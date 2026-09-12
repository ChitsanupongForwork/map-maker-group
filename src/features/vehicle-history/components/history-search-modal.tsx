"use client";

import { CalendarRange, Clock3, History, Search, Sparkles, Truck, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Vehicle } from "@/features/fleet";
import { Button } from "@/shared/ui/button";
import { HistoryDateTimePicker, HistoryVehicleSelect } from "./history-filter-controls";

export type RecentHistorySearch = {
  id: string;
  vehicleId: string;
  start: string;
  end: string;
  searchedAt: number;
};

function compactDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function HistorySearchModal({
  open,
  canClose,
  vehicles,
  vehicleId,
  start,
  end,
  recentSearches,
  onVehicleChange,
  onStartChange,
  onEndChange,
  onSearch,
  onRecentSearch,
  onClose,
}: {
  open: boolean;
  canClose: boolean;
  vehicles: Vehicle[];
  vehicleId: string;
  start: string;
  end: string;
  recentSearches: RecentHistorySearch[];
  onVehicleChange: (value: string) => void;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onSearch: () => void;
  onRecentSearch: (search: RecentHistorySearch) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>("[role='combobox']")?.focus();
    }, 0);
    return () => {
      window.clearTimeout(timer);
      previous?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open || !canClose) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [canClose, onClose, open]);

  if (!open) return null;

  const invalid = !start || !end || start >= end;

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-[rgba(3,6,10,.66)] px-4 py-8 backdrop-blur-[9px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && canClose) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-search-title"
        className="relative max-w-[830px] overflow-visible rounded-[20px] border border-line-strong bg-[rgba(11,16,23,.98)] shadow-[0_38px_100px_-24px_rgba(0,0,0,.98),0_0_0_1px_rgba(255,122,26,.05)]"
      >
        <div className="pointer-events-none absolute inset-x-14 -top-px h-px bg-[linear-gradient(90deg,transparent,var(--accent),transparent)] opacity-80" />

        <header className="flex items-start gap-4 border-b border-line px-5 py-5 sm:px-6">
          <span className="grid size-11 shrink-0 place-items-center rounded-[13px] border border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_12px_28px_-14px_rgba(255,122,26,.8)]">
            <CalendarRange className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold tracking-[.14em] text-[var(--accent)] uppercase"><Sparkles className="size-3" /> Route intelligence</div>
            <h2 id="history-search-title" className="text-[20px] font-semibold tracking-tight text-content">ค้นหาประวัติเส้นทาง</h2>
            <p className="mt-1 text-[12px] leading-5 text-muted">เลือกทะเบียนรถและช่วงเวลา ระบบจะแสดงเส้นทางพร้อม Playback บนแผนที่</p>
          </div>
          {canClose ? (
            <button type="button" aria-label="ปิดหน้าต่างค้นหา" onClick={onClose} className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-[10px] border border-line bg-surface-2 text-muted transition-colors hover:border-line-strong hover:bg-surface-3 hover:text-content"><X className="size-4" /></button>
          ) : null}
        </header>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.1fr_1fr_1fr]">
            <HistoryVehicleSelect vehicles={vehicles} value={vehicleId} onChange={onVehicleChange} />
            <HistoryDateTimePicker label="วันเวลาเริ่มต้น" value={start} max={end} onChange={onStartChange} />
            <HistoryDateTimePicker label="วันเวลาสิ้นสุด" value={end} min={start} onChange={onEndChange} />
          </div>

          {invalid ? <p className="mt-3 text-[11px] text-danger">เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น</p> : null}

          <Button variant="primary" onClick={onSearch} disabled={invalid} className="mt-4 h-12 w-full cursor-pointer rounded-[12px] text-[13px] font-semibold">
            <Search className="size-4" /> ค้นหาและแสดงเส้นทาง
          </Button>

          <section className="mt-6 border-t border-line pt-5" aria-labelledby="recent-searches-title">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><History className="size-4 text-[var(--accent)]" /><h3 id="recent-searches-title" className="text-[12px] font-semibold text-content">ค้นหาล่าสุด</h3></div>
              <span className="text-[10px] text-dim">บันทึกในอุปกรณ์นี้สูงสุด 4 รายการ</span>
            </div>

            {recentSearches.length ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {recentSearches.map((item) => {
                  const vehicle = vehicles.find((candidate) => candidate.id === item.vehicleId);
                  if (!vehicle) return null;
                  return (
                    <button key={item.id} type="button" onClick={() => onRecentSearch(item)} className="group flex min-h-[68px] cursor-pointer items-center gap-3 rounded-[12px] border border-line bg-surface-2/70 px-3 py-2.5 text-left transition-colors duration-200 hover:border-[var(--accent-line)] hover:bg-[rgba(255,122,26,.06)]">
                      <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-line bg-[#090d13] text-muted transition-colors group-hover:text-[var(--accent)]"><Truck className="size-4" /></span>
                      <span className="min-w-0 flex-1"><strong className="block truncate text-[12px] font-semibold text-content">{vehicle.plate}</strong><span className="mt-0.5 flex items-center gap-1 truncate font-mono text-[9px] text-dim"><Clock3 className="size-3 shrink-0" /> {compactDate(item.start)} → {compactDate(item.end)}</span></span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid min-h-20 place-items-center rounded-[12px] border border-dashed border-line-strong bg-[#090d13]/60 text-center">
                <div><History className="mx-auto mb-1.5 size-4 text-dim" /><p className="text-[11px] text-muted">ยังไม่มีประวัติการค้นหา</p><p className="mt-0.5 text-[10px] text-dim">รายการแรกจะปรากฏหลังจากค้นหา</p></div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

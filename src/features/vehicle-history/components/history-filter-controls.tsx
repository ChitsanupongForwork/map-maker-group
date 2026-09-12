"use client";

import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Search,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { STATUS_HEX, type Vehicle } from "@/features/fleet";
import { cn } from "@/shared/lib/cn";

const WEEKDAYS = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];
const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toLocalValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function useCloseOnOutside(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open, onClose]);
  return ref;
}

export function HistoryDateTimePicker({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}) {
  const selected = useMemo(() => new Date(value), [value]);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const close = () => setOpen(false);
  const rootRef = useCloseOnOutside(open, close);

  const monthDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const count = new Date(year, month + 1, 0).getDate();
    return [...Array(firstWeekday).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)];
  }, [viewMonth]);

  const selectDay = (day: number) => {
    const next = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day, selected.getHours(), selected.getMinutes());
    onChange(toLocalValue(next));
  };

  const setTime = (part: "hour" | "minute", raw: string) => {
    const next = new Date(selected);
    const numeric = Number(raw.replace(/\D/g, ""));
    if (part === "hour") next.setHours(Math.max(0, Math.min(23, Number.isFinite(numeric) ? numeric : 0)));
    else next.setMinutes(Math.max(0, Math.min(59, Number.isFinite(numeric) ? numeric : 0)));
    onChange(toLocalValue(next));
  };

  const isDisabled = (day: number) => {
    const candidate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day, selected.getHours(), selected.getMinutes()).getTime();
    return (min ? candidate < new Date(min).getTime() : false) || (max ? candidate > new Date(max).getTime() : false);
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-dim">
        <CalendarDays className="size-3.5" /> {label}
      </span>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setViewMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
          setOpen((current) => !current);
        }}
        className={cn(
          "group flex h-11 w-full cursor-pointer items-center rounded-[11px] border bg-surface-2 px-2.5 text-left transition-colors duration-200",
          open ? "border-[var(--accent-line)] bg-[rgba(255,122,26,.06)]" : "border-line hover:border-line-strong hover:bg-surface-3",
        )}
      >
        <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg", open ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-surface-3 text-muted")}>
          <CalendarDays className="size-3.5" />
        </span>
        <span className="ml-2 min-w-0 flex-1 truncate text-[12px] font-medium text-content">
          {selected.getDate()} {THAI_MONTHS[selected.getMonth()].slice(0, 3)} {selected.getFullYear() + 543}
        </span>
        <span className="rounded-md border border-line bg-[#090d13] px-2 py-1 font-mono text-[11px] tabular-nums text-[var(--accent)]">
          {pad(selected.getHours())}:{pad(selected.getMinutes())}
        </span>
        <ChevronDown className={cn("ml-1.5 size-3.5 text-dim transition-transform duration-200", open && "rotate-180 text-[var(--accent)]")} />
      </button>

      {open ? (
        <div role="dialog" aria-label={label} className="absolute top-[calc(100%+8px)] left-0 z-50 w-[min(330px,calc(100vw-112px))] overflow-hidden rounded-[14px] border border-line-strong bg-[rgba(11,16,23,.98)] shadow-[0_28px_70px_-20px_rgba(0,0,0,.95)] backdrop-blur-xl">
          <div className="flex h-12 items-center justify-between border-b border-line px-2.5">
            <button type="button" aria-label="เดือนก่อนหน้า" onClick={() => setViewMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))} className="grid size-9 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-surface-3 hover:text-content"><ChevronLeft className="size-4" /></button>
            <strong className="text-[13px] font-semibold text-content">{THAI_MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear() + 543}</strong>
            <button type="button" aria-label="เดือนถัดไป" onClick={() => setViewMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))} className="grid size-9 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-surface-3 hover:text-content"><ChevronRight className="size-4" /></button>
          </div>
          <div className="p-3">
            <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-medium text-dim">{WEEKDAYS.map((day) => <span key={day} className="py-1">{day}</span>)}</div>
            <div className="grid grid-cols-7 gap-0.5">
              {monthDays.map((day, index) => day === null ? <span key={`blank-${index}`} /> : (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled(day)}
                  aria-label={`${day} ${THAI_MONTHS[viewMonth.getMonth()]}`}
                  aria-pressed={sameDay(selected, new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day))}
                  onClick={() => selectDay(day)}
                  className={cn(
                    "grid aspect-square min-h-9 cursor-pointer place-items-center rounded-lg text-[12px] transition-colors disabled:cursor-not-allowed disabled:opacity-25",
                    sameDay(selected, new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day))
                      ? "bg-[var(--accent)] font-semibold text-[#160800] shadow-[0_6px_18px_-8px_rgba(255,122,26,.9)]"
                      : "text-muted hover:bg-surface-3 hover:text-content",
                  )}
                >{day}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-line bg-[#090d13] px-3 py-3">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted"><Clock3 className="size-3.5 text-[var(--accent)]" /> เวลา</span>
            <div className="ml-auto flex h-10 items-center rounded-[10px] border border-line-strong bg-surface-2 px-1 font-mono text-[14px] text-content focus-within:border-[var(--accent-line)]">
              <input aria-label="ชั่วโมง" inputMode="numeric" value={pad(selected.getHours())} onFocus={(event) => event.currentTarget.select()} onChange={(event) => setTime("hour", event.target.value)} className="h-8 w-9 bg-transparent text-center outline-none" />
              <span className="text-[var(--accent)]">:</span>
              <input aria-label="นาที" inputMode="numeric" value={pad(selected.getMinutes())} onFocus={(event) => event.currentTarget.select()} onChange={(event) => setTime("minute", event.target.value)} className="h-8 w-9 bg-transparent text-center outline-none" />
            </div>
            <button type="button" onClick={close} className="h-10 cursor-pointer rounded-[10px] bg-[var(--accent)] px-4 text-[12px] font-semibold text-[#160800] transition-colors hover:bg-[var(--accent-hover)]">ตกลง</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function HistoryVehicleSelect({ vehicles, value, onChange }: { vehicles: Vehicle[]; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const close = () => setOpen(false);
  const rootRef = useCloseOnOutside(open, close);
  const selected = vehicles.find((vehicle) => vehicle.id === value) ?? vehicles[0];
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("th");
    if (!term) return vehicles;
    return vehicles.filter((vehicle) => `${vehicle.plate} ${vehicle.make} ${vehicle.model} ${vehicle.driverName}`.toLocaleLowerCase("th").includes(term));
  }, [query, vehicles]);

  if (!selected) return null;

  return (
    <div ref={rootRef} className="relative min-w-0">
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-dim"><Truck className="size-3.5" /> ทะเบียนรถ · Vehicle</span>
      <button type="button" role="combobox" aria-label="เลือกทะเบียนรถ" aria-expanded={open} aria-controls="history-vehicle-list" onClick={() => setOpen((current) => !current)} className={cn("group flex h-11 w-full cursor-pointer items-center rounded-[11px] border bg-surface-2 px-2.5 text-left transition-colors duration-200", open ? "border-[var(--accent-line)] bg-[rgba(255,122,26,.06)]" : "border-line hover:border-line-strong hover:bg-surface-3")}>
        <span className="relative grid size-7 shrink-0 place-items-center rounded-lg bg-surface-3 text-muted"><Truck className="size-3.5" /><i className="absolute right-0.5 bottom-0.5 size-1.5 rounded-full ring-2 ring-surface-3" style={{ backgroundColor: STATUS_HEX[selected.status] }} /></span>
        <span className="ml-2 min-w-0 flex-1"><strong className="block truncate text-[12px] font-semibold text-content">{selected.plate}</strong><span className="block truncate text-[10px] text-dim">{selected.make} {selected.model}</span></span>
        <span className="hidden max-w-28 truncate text-[10px] text-muted 2xl:block">{selected.driverName}</span>
        <ChevronDown className={cn("ml-2 size-3.5 shrink-0 text-dim transition-transform duration-200", open && "rotate-180 text-[var(--accent)]")} />
      </button>

      {open ? (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-[min(390px,calc(100vw-112px))] overflow-hidden rounded-[14px] border border-line-strong bg-[rgba(11,16,23,.98)] shadow-[0_28px_70px_-20px_rgba(0,0,0,.95)] backdrop-blur-xl">
          <div className="border-b border-line p-2.5">
            <div className="flex h-10 items-center gap-2 rounded-[10px] border border-line bg-[#090d13] px-3 focus-within:border-[var(--accent-line)]">
              <Search className="size-3.5 shrink-0 text-dim" />
              <input autoFocus aria-label="ค้นหาทะเบียนรถ" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาทะเบียน รุ่น หรือคนขับ…" className="min-w-0 flex-1 bg-transparent text-[12px] text-content outline-none placeholder:text-dim" />
              {query ? <button type="button" aria-label="ล้างคำค้นหา" onClick={() => setQuery("")} className="grid size-7 cursor-pointer place-items-center rounded-md text-dim hover:bg-surface-3 hover:text-content"><X className="size-3.5" /></button> : null}
            </div>
          </div>
          <div id="history-vehicle-list" role="listbox" className="scroll-fade max-h-72 p-1.5">
            {filtered.length ? filtered.map((vehicle) => {
              const active = vehicle.id === value;
              return <button key={vehicle.id} type="button" role="option" aria-selected={active} onClick={() => { onChange(vehicle.id); setQuery(""); close(); }} className={cn("group flex min-h-12 w-full cursor-pointer items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left transition-colors", active ? "bg-[var(--accent-soft)]" : "hover:bg-surface-2")}>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-surface-2"><Truck className="size-3.5" style={{ color: STATUS_HEX[vehicle.status] }} /></span>
                <span className="min-w-0 flex-1"><strong className={cn("block truncate text-[12px] font-semibold", active ? "text-[var(--accent)]" : "text-content")}>{vehicle.plate}</strong><span className="block truncate text-[10px] text-dim">{vehicle.make} {vehicle.model} · {vehicle.driverName}</span></span>
                {active ? <Check className="size-4 shrink-0 text-[var(--accent)]" /> : null}
              </button>;
            }) : <div className="grid min-h-24 place-items-center text-[11px] text-dim">ไม่พบทะเบียนที่ค้นหา</div>}
          </div>
          <div className="border-t border-line px-3 py-2 text-[10px] text-dim">พบ {filtered.length} จาก {vehicles.length} คัน</div>
        </div>
      ) : null}
    </div>
  );
}

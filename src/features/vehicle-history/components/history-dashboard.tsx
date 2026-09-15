"use client";

import {
  CalendarRange,
  ChevronRight,
  CircleStop,
  Clock3,
  Gauge,
  Info,
  Loader2,
  MapPin,
  MapPinOff,
  Pause,
  Play,
  RotateCcw,
  Route,
  Search,
  SkipBack,
  SkipForward,
  Timer,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { env } from "@/env";
import { useFleet } from "@/features/fleet";
import { cn } from "@/shared/lib/cn";
import { Button, IconButton } from "@/shared/ui/button";
import { fetchHistory } from "../lib/fetch-history";
import { buildMockHistory, pointAtProgress } from "../lib/mock-history";
import type { HistoryEvent, HistoryTrip } from "../types";
import { HistoryMapPanel } from "./history-map-panel";
import { HistorySearchModal, type RecentHistorySearch } from "./history-search-modal";

const PLAYBACK_DURATION_MS = 45_000;
const SPEEDS = [0.5, 1, 2, 4] as const;
const RECENT_SEARCHES_KEY = "map-maker:history-recent-searches:v1";

/** ผลของคำขอล่าสุดไปที่ Go API — key บอกว่าเป็นของรถ + ช่วงเวลาไหน */
type RemoteTrip = { key: string; trip: HistoryTrip | null; error: string | null };

function inputDateTime(timestamp: number) {
  const date = new Date(timestamp);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(timestamp - offset).toISOString().slice(0, 16);
}

function clock(timestamp: number) {
  return new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(timestamp);
}

function shortDate(timestamp: number) {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "2-digit" }).format(timestamp);
}

function rangeDate(value: number) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(value);
}

function durationLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours} ชม. ${rest} นาที` : `${rest} นาที`;
}

function EventIcon({ type }: { type: HistoryEvent["type"] }) {
  if (type === "start") return <Play className="size-3.5" />;
  if (type === "end") return <CircleStop className="size-3.5" />;
  if (type === "stop") return <Pause className="size-3.5" />;
  return <ChevronRight className="size-3.5" />;
}

export function HistoryDashboard() {
  const { snapshot } = useFleet();
  const defaultEnd = snapshot.generatedAt;
  const defaultStartDate = new Date(defaultEnd);
  defaultStartDate.setHours(0, 0, 0, 0);
  const defaultStart = defaultStartDate.getTime();
  const [vehicleId, setVehicleId] = useState(snapshot.vehicles[0]?.id ?? "");
  const [draftStart, setDraftStart] = useState(inputDateTime(defaultStart));
  const [draftEnd, setDraftEnd] = useState(inputDateTime(defaultEnd));
  const [range, setRange] = useState({ start: defaultStart, end: defaultEnd });
  const [searchOpen, setSearchOpen] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentHistorySearch[]>([]);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [remote, setRemote] = useState<RemoteTrip>({ key: "", trip: null, error: null });
  const previousFrame = useRef<number | null>(null);

  const vehicle = snapshot.vehicles.find((item) => item.id === vehicleId) ?? snapshot.vehicles[0];
  const targetId = vehicle?.id;
  const requestKey = `${targetId}|${range.start}|${range.end}`;

  // โหมดข้อมูลจำลอง: สร้างเส้นทางในเครื่องทันที
  const mockTrip = useMemo(
    () => (!env.fleetApiUrl && vehicle ? buildMockHistory(vehicle, range.start, range.end) : null),
    [vehicle, range],
  );

  // โหมด Go API: โหลดใหม่ทุกครั้งที่เปลี่ยนรถหรือช่วงเวลา และยกเลิกคำขอเก่าที่ยังไม่กลับมา
  useEffect(() => {
    if (!env.fleetApiUrl || !targetId) return;
    const controller = new AbortController();
    fetchHistory(targetId, range.start, range.end, controller.signal)
      .then((trip) => setRemote({ key: requestKey, trip, error: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setRemote({ key: requestKey, trip: null, error: error instanceof Error ? error.message : "โหลดประวัติไม่สำเร็จ" });
      });
    return () => controller.abort();
  }, [requestKey, targetId, range.start, range.end]);

  const settled = remote.key === requestKey;
  const trip = env.fleetApiUrl ? (settled ? remote.trip : null) : mockTrip;
  const loadError = env.fleetApiUrl && settled ? remote.error : null;
  const loading = Boolean(env.fleetApiUrl && targetId) && !settled;
  const current = useMemo(() => (trip ? pointAtProgress(trip.points, progress) : null), [trip, progress]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]") as unknown;
      if (Array.isArray(stored)) {
        setRecentSearches(stored.filter((item): item is RecentHistorySearch => {
          if (!item || typeof item !== "object") return false;
          const entry = item as Partial<RecentHistorySearch>;
          return typeof entry.id === "string" && typeof entry.vehicleId === "string" && typeof entry.start === "string" && typeof entry.end === "string" && typeof entry.searchedAt === "number";
        }).slice(0, 4));
      }
    } catch {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    }
  }, []);

  useEffect(() => {
    if (!playing) { previousFrame.current = null; return; }
    let frame = 0;
    const tick = (time: number) => {
      if (previousFrame.current !== null) {
        const delta = ((time - previousFrame.current) / PLAYBACK_DURATION_MS) * speed;
        setProgress((value) => {
          const next = value + delta;
          if (next >= 1) { setPlaying(false); return 1; }
          return next;
        });
      }
      previousFrame.current = time;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed]);

  if (!vehicle) return null;

  const commitSearch = (nextVehicleId: string, nextStart: string, nextEnd: string) => {
    const start = new Date(nextStart).getTime();
    const end = new Date(nextEnd).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) return;
    setVehicleId(nextVehicleId);
    setDraftStart(nextStart);
    setDraftEnd(nextEnd);
    setRange({ start, end });
    setProgress(0);
    setPlaying(false);
    setHasSearched(true);
    setSearchOpen(false);

    const entry: RecentHistorySearch = {
      id: `${nextVehicleId}|${nextStart}|${nextEnd}`,
      vehicleId: nextVehicleId,
      start: nextStart,
      end: nextEnd,
      searchedAt: Date.now(),
    };
    setRecentSearches((currentSearches) => {
      const next = [entry, ...currentSearches.filter((item) => item.id !== entry.id)].slice(0, 4);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const applySearch = () => commitSearch(vehicleId, draftStart, draftEnd);
  const selectableVehicles = snapshot.vehicles.slice(0, 30);

  const summaryBar = (
    <section className="panel flex shrink-0 flex-col gap-3 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between" aria-label="เงื่อนไขประวัติเส้นทางปัจจุบัน">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)]"><CalendarRange className="size-4" /></span>
        <div className="min-w-0"><p className="truncate text-[12px] font-semibold text-content">{vehicle.plate} · {vehicle.make} {vehicle.model}</p><p className="mt-0.5 truncate font-mono text-[10px] text-dim">{rangeDate(range.start)} → {rangeDate(range.end)}</p></div>
      </div>
      <Button variant="soft" onClick={() => { setPlaying(false); setSearchOpen(true); }} className="h-9 cursor-pointer"><Search className="size-3.5" /> ค้นหาใหม่</Button>
    </section>
  );

  const searchModal = (
    <HistorySearchModal
      open={searchOpen}
      canClose={hasSearched}
      vehicles={selectableVehicles}
      vehicleId={vehicleId}
      start={draftStart}
      end={draftEnd}
      recentSearches={recentSearches}
      onVehicleChange={setVehicleId}
      onStartChange={setDraftStart}
      onEndChange={setDraftEnd}
      onSearch={applySearch}
      onRecentSearch={(item) => commitSearch(item.vehicleId, item.start, item.end)}
      onClose={() => setSearchOpen(false)}
    />
  );

  // ยังโหลดอยู่ โหลดพัง หรือช่วงเวลานั้นรถไม่ได้ส่งตำแหน่งเลย — ไม่มีเส้นทางให้เล่น
  if (!trip || !current) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-3">
        {summaryBar}
        <section className="panel grid min-h-[500px] flex-1 place-items-center px-6 text-center" aria-live="polite">
          {loading ? (
            <div className="flex items-center gap-2 text-[12px] text-dim"><Loader2 className="size-4 animate-spin" /> กำลังโหลดเส้นทาง…</div>
          ) : loadError ? (
            <div><p className="text-[13px] font-semibold text-danger">โหลดประวัติเส้นทางไม่สำเร็จ</p><p className="mt-1 text-[11px] text-dim">{loadError}</p></div>
          ) : (
            <div><MapPinOff className="mx-auto mb-2 size-5 text-dim" /><p className="text-[13px] font-semibold text-content">ไม่มีข้อมูลตำแหน่งในช่วงเวลานี้</p><p className="mt-1 text-[11px] text-dim">{vehicle.plate} ไม่ได้ส่งตำแหน่งเข้ามาระหว่าง {rangeDate(range.start)} – {rangeDate(range.end)} ลองเลือกช่วงเวลาอื่น</p></div>
          )}
        </section>
        {searchModal}
      </div>
    );
  }

  const seekToEvent = (event: HistoryEvent) => {
    const total = trip.points.at(-1)!.timestamp - trip.points[0].timestamp;
    setProgress((event.timestamp - trip.points[0].timestamp) / Math.max(1, total));
    setPlaying(false);
  };

  const elapsed = current.timestamp - trip.points[0].timestamp;
  const total = trip.points.at(-1)!.timestamp - trip.points[0].timestamp;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-3 xl:overflow-hidden">
      {summaryBar}

      <div className="grid min-h-[700px] flex-1 grid-cols-1 gap-3 xl:min-h-0 xl:grid-cols-[minmax(0,1fr)_350px]">
        <section className="relative min-h-[500px] xl:min-h-0" aria-label="แผนที่ประวัติเส้นทาง">
          <HistoryMapPanel points={trip.points} progress={progress} />

          <div className="pointer-events-auto absolute right-3 bottom-3 left-3 z-20 rounded-[14px] border border-[rgba(255,122,26,0.24)] bg-[rgba(9,13,19,0.92)] p-3 shadow-[0_20px_50px_-18px_rgba(0,0,0,0.95)] backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="size-2 shrink-0 rounded-full bg-[var(--accent)] shadow-[0_0_14px_rgba(255,122,26,.8)]" />
                <span className="truncate font-mono text-[12px] text-content">{clock(current.timestamp)}</span>
                <span className="hidden truncate text-[11px] text-dim sm:inline">{shortDate(current.timestamp)} · {current.address}</span>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-dim">{Math.round(progress * 100)}%</span>
            </div>
            <input aria-label="เลื่อนเวลาเล่นเส้นทาง" type="range" min="0" max="1000" value={Math.round(progress * 1000)} onChange={(event) => { setProgress(Number(event.target.value) / 1000); setPlaying(false); }} className="history-range block h-4 w-full cursor-pointer accent-[var(--accent)]" />
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <IconButton label="ย้อนกลับ 10%" onClick={() => { setProgress((value) => Math.max(0, value - 0.1)); setPlaying(false); }}><SkipBack className="size-4" /></IconButton>
                <button type="button" aria-label={playing ? "หยุดเล่น" : "เล่นเส้นทาง"} onClick={() => { if (progress >= 1) setProgress(0); setPlaying((value) => !value); }} className="grid size-11 cursor-pointer place-items-center rounded-full bg-[var(--accent)] text-[#160800] shadow-[0_8px_28px_-8px_rgba(255,122,26,.9)] transition-colors hover:bg-[var(--accent-hover)]">
                  {playing ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}
                </button>
                <IconButton label="เดินหน้า 10%" onClick={() => { setProgress((value) => Math.min(1, value + 0.1)); setPlaying(false); }}><SkipForward className="size-4" /></IconButton>
                <IconButton label="เริ่มใหม่" onClick={() => { setProgress(0); setPlaying(false); }}><RotateCcw className="size-4" /></IconButton>
              </div>
              <div className="flex items-center gap-1 rounded-[9px] border border-line bg-surface-2 p-1" aria-label="ความเร็ว playback">
                {SPEEDS.map((item) => <button key={item} type="button" onClick={() => setSpeed(item)} className={cn("h-7 min-w-9 cursor-pointer rounded-md px-2 font-mono text-[11px] transition-colors", speed === item ? "bg-surface-3 text-[var(--accent)]" : "text-dim hover:text-content")}>{item}×</button>)}
              </div>
              <span className="hidden shrink-0 font-mono text-[11px] text-dim md:block">{durationLabel(Math.round(elapsed / 60_000))} / {durationLabel(Math.round(total / 60_000))}</span>
            </div>
          </div>
        </section>

        <aside className="panel flex min-h-0 flex-col overflow-hidden">
          <header className="border-b border-line px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-[11px] font-medium tracking-[.12em] text-[var(--accent)] uppercase">Trip history</p><h1 className="mt-1 text-[18px] font-semibold tracking-tight text-content">{vehicle.plate}</h1><p className="mt-0.5 text-[12px] text-muted">{vehicle.make} {vehicle.model} · {vehicle.driverName}</p></div>
              <span className="rounded-full border border-[rgba(34,197,94,.25)] bg-[rgba(34,197,94,.1)] px-2.5 py-1 text-[11px] font-medium text-[#4ade80]">ข้อมูลพร้อม</span>
            </div>
          </header>

          <div className="grid grid-cols-2 gap-px border-b border-line bg-line">
            {[
              { icon: Route, label: "ระยะทาง", value: `${trip.distanceKm.toFixed(1)} กม.` },
              { icon: Timer, label: "เวลาเดินทาง", value: durationLabel(trip.movingMinutes) },
              { icon: Gauge, label: "ความเร็วเฉลี่ย", value: `${trip.averageSpeedKph} กม./ชม.` },
              { icon: Clock3, label: "เวลาจอด", value: durationLabel(trip.stoppedMinutes) },
            ].map((stat) => <div key={stat.label} className="bg-surface px-3.5 py-3"><span className="flex items-center gap-1.5 text-[10px] text-dim"><stat.icon className="size-3.5" /> {stat.label}</span><strong className="mt-1 block text-[14px] font-semibold text-content">{stat.value}</strong></div>)}
          </div>

          <div className="border-b border-line bg-[linear-gradient(135deg,rgba(255,122,26,.09),transparent_65%)] px-4 py-3">
            <div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-medium text-muted">ข้อมูล ณ เวลาที่เล่น</span><span className="font-mono text-[11px] text-[var(--accent)]">{clock(current.timestamp)}</span></div>
            <div className="flex items-end justify-between gap-3"><div><span className="text-[10px] text-dim">ความเร็วปัจจุบัน</span><p className="mt-0.5 text-[24px] leading-none font-semibold tracking-tight text-content">{current.speedKph}<span className="ml-1 text-[11px] font-normal text-muted">กม./ชม.</span></p></div><span className="font-mono text-[10px] text-dim">{current.lat.toFixed(5)}, {current.lng.toFixed(5)}</span></div>
            <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-5 text-muted"><MapPin className="mt-0.5 size-3.5 shrink-0 text-[var(--accent)]" />{current.address}</p>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5"><span className="text-[12px] font-semibold text-content">เหตุการณ์ในเส้นทาง</span><span className="text-[10px] text-dim">{trip.events.length} รายการ</span></div>
            <div className="scroll-fade min-h-[220px] flex-1 px-2 py-2">
              {trip.events.map((event, index) => {
                const passed = event.timestamp <= current.timestamp;
                return <button key={event.id} type="button" onClick={() => seekToEvent(event)} className="group relative flex w-full cursor-pointer gap-3 rounded-[10px] px-2 py-2.5 text-left transition-colors hover:bg-surface-2">
                  {index < trip.events.length - 1 ? <span className={cn("absolute top-8 bottom-[-12px] left-[19px] w-px", passed ? "bg-[var(--accent-line)]" : "bg-line-strong")} /> : null}
                  <span className={cn("relative z-10 grid size-7 shrink-0 place-items-center rounded-full border transition-colors", passed ? "border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-line-strong bg-surface-2 text-dim")}><EventIcon type={event.type} /></span>
                  <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className={cn("truncate text-[11px] font-medium", passed ? "text-content" : "text-muted")}>{event.title}</strong><time className="shrink-0 font-mono text-[10px] text-dim">{clock(event.timestamp)}</time></span><span className="mt-0.5 block truncate text-[10px] text-dim">{event.detail}</span></span>
                </button>;
              })}
            </div>
          </div>

          <div className="m-3 mt-0 flex items-start gap-2 rounded-[10px] border border-line bg-surface-2/70 p-2.5 text-[10px] leading-4 text-dim"><Info className="mt-0.5 size-3.5 shrink-0 text-muted" /><span>Playback จำลองเวลาในช่วงที่เลือก แล้วคำนวณตำแหน่งระหว่าง GPS แต่ละจุดตาม timestamp</span></div>
        </aside>
      </div>

      {searchModal}
    </div>
  );
}

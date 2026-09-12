"use client";

import { ListFilter } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFleet, useFleetActions, type SortKey } from "@/features/fleet";
import { cn } from "@/shared/lib/cn";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { formatNumber } from "@/shared/lib/format";
import { SearchInput } from "@/shared/ui/search-input";
import { Dropdown } from "@/shared/ui/dropdown";
import { useVirtualRows } from "../hooks/use-virtual-rows";
import { ROW_HEIGHT, VehicleRow } from "./vehicle-row";

const SORT_OPTIONS = [
  { value: "lastUpdate", label: "Sort by: Last Update" },
  { value: "plate", label: "Sort by: ทะเบียน" },
  { value: "speed", label: "Sort by: ความเร็ว" },
  { value: "status", label: "Sort by: สถานะ" },
] as const;

export function VehicleListPanel({ className }: { className?: string }) {
  const { sorted, view, sort, selectedId } = useFleet();
  const { setSort, setSearch, select } = useFleetActions();

  const [term, setTerm] = useState("");
  const debounced = useDebouncedValue(term, 160);
  useEffect(() => setSearch(debounced), [debounced, setSearch]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const { start, end, totalHeight, offsetY } = useVirtualRows(scrollRef, {
    count: sorted.length,
    rowHeight: ROW_HEIGHT,
  });

  // เลือกรถจากแผนที่แล้วให้รายการเลื่อนไปหาคันนั้นให้เอง
  useEffect(() => {
    const node = scrollRef.current;
    if (!node || !selectedId) return;
    const index = sorted.findIndex((vehicle) => vehicle.id === selectedId);
    if (index < 0) return;
    const top = index * ROW_HEIGHT;
    if (top < node.scrollTop || top + ROW_HEIGHT > node.scrollTop + node.clientHeight) {
      node.scrollTo({ top: top - node.clientHeight / 2 + ROW_HEIGHT, behavior: "smooth" });
    }
    // จงใจไม่ผูกกับ sorted: ต้องเลื่อนเฉพาะตอนเปลี่ยนคันที่เลือก
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const rows = sorted.slice(start, end);

  return (
    <section className={cn("panel flex min-h-0 flex-col overflow-hidden", className)}>
      <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-line px-3">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold tracking-tight text-content">
          Vehicles
          <span className="text-muted tabular-nums">({formatNumber(view.vehicles.length)})</span>
        </h2>
        <Dropdown
          label="เรียงลำดับรายการรถ"
          compact
          className="w-[176px]"
          panelClassName="left-auto right-0"
          options={SORT_OPTIONS}
          value={sort}
          onChange={(next) => setSort(next as SortKey)}
        />
      </header>

      {/* ช่องค้นหาทะเบียนอยู่หัวตารางนี้ ไม่ได้อยู่บน navbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-2.5">
        <SearchInput
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          onClear={() => setTerm("")}
          placeholder="ค้นหาทะเบียนรถ, ชื่อคนขับ…"
          aria-label="ค้นหาทะเบียนรถ"
        />
        <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-surface-2/80 text-dim">
          <ListFilter className="size-3.5" />
        </span>
      </div>

      <div ref={scrollRef} className="scroll-fade min-h-0 flex-1 px-2 py-1.5">
        {sorted.length === 0 ? (
          <p className="px-2 py-10 text-center text-[12px] text-dim">
            ไม่พบรถที่ตรงกับเงื่อนไข
          </p>
        ) : (
          <div style={{ height: totalHeight }} className="relative">
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              {rows.map((vehicle) => (
                <div key={vehicle.id} style={{ height: ROW_HEIGHT }} className="pb-1.5">
                  <VehicleRow
                    vehicle={vehicle}
                    dataStatus={view.dataStatusById.get(vehicle.id) ?? "realtime"}
                    selected={vehicle.id === selectedId}
                    onSelect={select}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import { Download } from "lucide-react";
import { useFleet } from "@/features/fleet";
import { formatNumber } from "@/shared/lib/format";
import { EXPORT_COLUMNS } from "../lib/to-rows";
import { ExportActions } from "./export-actions";

/** การ์ดส่งออกบนหน้า /export — บอกให้ชัดว่ากำลังจะได้ไฟล์อะไรออกมา */
export function ExportPanel({ className }: { className?: string }) {
  const { view, snapshot } = useFleet();

  return (
    <section className={className}>
      <div className="panel flex flex-col overflow-hidden">
        <header className="flex items-center gap-2 border-b border-line px-3.5 py-3">
          <span className="grid size-7 place-items-center rounded-lg border border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)]">
            <Download className="size-3.5" />
          </span>
          <h2 className="text-[13px] font-semibold tracking-tight text-content">
            ส่งออกข้อมูลกองรถ
          </h2>
        </header>

        <div className="flex flex-col gap-3 p-3.5">
          <p className="text-[12px] leading-relaxed text-muted">
            ไฟล์จะมีเฉพาะรถที่ผ่านตัวกรองด้านบนเท่านั้น ตอนนี้เลือกไว้{" "}
            <span className="font-semibold text-content tabular-nums">
              {formatNumber(view.vehicles.length)}
            </span>{" "}
            จากทั้งหมด {formatNumber(snapshot.vehicles.length)} คัน
          </p>

          <div className="flex flex-col gap-0.5 rounded-[10px] border border-line bg-surface-2/50 p-1.5">
            <ExportActions />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-dim">คอลัมน์ในไฟล์</span>
            <div className="flex flex-wrap gap-1.5">
              {EXPORT_COLUMNS.map((column) => (
                <span
                  key={column.key}
                  className="rounded-md border border-line bg-surface-2 px-2 py-1 text-[11px] text-muted"
                >
                  {column.header}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

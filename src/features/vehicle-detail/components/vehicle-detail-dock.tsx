"use client";

import { MousePointerClick } from "lucide-react";
import { useFleet } from "@/features/fleet";
import { cn } from "@/shared/lib/cn";
import { VehicleActionsCard } from "./vehicle-actions-card";
import { VehicleInsightCard } from "./vehicle-insight-card";
import { VehicleSummaryCard } from "./vehicle-summary-card";

/** แถบรายละเอียดด้านล่าง: สรุปคัน / กราฟ / ปุ่มสั่งงาน */
export function VehicleDetailDock({ className }: { className?: string }) {
  const { selected, view } = useFleet();

  if (!selected) {
    return (
      <section
        className={cn(
          "panel flex items-center justify-center gap-2.5 px-4 py-6 text-[12px] text-dim",
          className,
        )}
      >
        <MousePointerClick className="size-4 text-[var(--accent)]" />
        เลือกรถจากแผนที่หรือรายการด้านขวา เพื่อดูรายละเอียดและสั่งออกรายงาน
      </section>
    );
  }

  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_220px]",
        className,
      )}
    >
      <VehicleSummaryCard
        vehicle={selected}
        dataStatus={view.dataStatusById.get(selected.id) ?? "realtime"}
      />
      <VehicleInsightCard vehicle={selected} />
      <VehicleActionsCard />
    </div>
  );
}

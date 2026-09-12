"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";

/**
 * MapLibre ต้องมี window/WebGL จริง ๆ จึงไม่ render ฝั่งเซิร์ฟเวอร์
 * และแยก chunk ไว้ต่างหาก หน้าอื่นที่ไม่มีแผนที่จะได้ไม่ต้องโหลดไปด้วย
 */
const FleetMap = dynamic(() => import("./fleet-map").then((mod) => mod.FleetMap), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex items-center gap-2 text-[12px] text-dim">
        <Loader2 className="size-4 animate-spin" />
        กำลังโหลดแผนที่…
      </div>
    </div>
  ),
});

export function FleetMapPanel({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "panel relative isolate overflow-hidden bg-[#06090d]",
        className,
      )}
    >
      <FleetMap className="absolute inset-0" />
    </div>
  );
}

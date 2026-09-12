"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { HistoryPoint } from "../types";

const HistoryMap = dynamic(() => import("./history-map").then((mod) => mod.HistoryMap), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-[#06090d]">
      <div className="flex items-center gap-2 text-[12px] text-dim">
        <Loader2 className="size-4 animate-spin" />
        กำลังโหลดแผนที่…
      </div>
    </div>
  ),
});

export function HistoryMapPanel({ points, progress }: { points: HistoryPoint[]; progress: number }) {
  return (
    <div className="panel relative isolate h-full min-h-[460px] overflow-hidden bg-[#06090d] xl:min-h-0">
      <HistoryMap className="absolute inset-0" points={points} progress={progress} />
    </div>
  );
}

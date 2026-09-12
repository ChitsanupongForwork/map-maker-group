import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * tooltip แบบ CSS ล้วน (group-hover) — ไม่มี JS, ไม่มี portal
 * ใช้กับแถบ sidebar ที่เหลือแต่ไอคอน
 */
export function Tooltip({
  label,
  children,
  side = "right",
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  side?: "right" | "top";
  className?: string;
}) {
  return (
    <div className={cn("group relative flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-lg border border-line",
          "bg-[rgba(12,17,24,0.96)] px-2.5 py-1.5 text-[12px] font-medium text-content shadow-xl",
          "opacity-0 transition-[opacity,transform] duration-150 group-hover:opacity-100",
          side === "right"
            ? "top-1/2 left-[calc(100%+10px)] -translate-y-1/2 translate-x-[-4px] group-hover:translate-x-0"
            : "bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 translate-y-1 group-hover:translate-y-0",
        )}
      >
        {label}
      </span>
    </div>
  );
}

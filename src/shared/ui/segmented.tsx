"use client";

import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export type SegmentedItem<T extends string> = {
  value: T;
  label: ReactNode;
};

export function Segmented<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: readonly SegmentedItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-[10px] border border-line bg-[rgba(8,12,17,0.82)] p-1 backdrop-blur",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium transition-colors duration-150",
              active
                ? "bg-[var(--accent)] text-[#160800]"
                : "text-muted hover:bg-surface-2 hover:text-content",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

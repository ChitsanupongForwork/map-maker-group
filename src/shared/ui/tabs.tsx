"use client";

import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: readonly { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div role="tablist" className={cn("flex items-center gap-1", className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium transition-colors duration-150",
              active
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
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

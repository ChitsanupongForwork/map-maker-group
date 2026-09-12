"use client";

import { Search, X } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export function SearchInput({
  className,
  value,
  onClear,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { onClear?: () => void }) {
  return (
    <div className="relative flex-1">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-dim"
      />
      <input
        type="search"
        value={value}
        className={cn(
          "h-8 w-full rounded-lg border border-line bg-surface-2/80 pl-8 text-[12px] text-content",
          "placeholder:text-dim transition-colors duration-150",
          "hover:border-line-strong focus:border-[var(--accent-line)] focus:bg-surface-2 focus:outline-none",
          onClear && value ? "pr-7" : "pr-2.5",
          "[&::-webkit-search-cancel-button]:hidden",
          className,
        )}
        {...props}
      />
      {onClear && value ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="ล้างคำค้นหา"
          className="absolute top-1/2 right-1.5 grid size-5 -translate-y-1/2 place-items-center rounded text-dim transition-colors hover:text-content"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

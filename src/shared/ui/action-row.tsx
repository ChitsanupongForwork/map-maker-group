"use client";

import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/** แถวปุ่มในแผง Actions — ไอคอนในกรอบสี + ข้อความ */
export function ActionRow({
  icon,
  label,
  tone = "muted",
  disabled,
  onClick,
  className,
}: {
  icon: ReactNode;
  label: string;
  tone?: "muted" | "excel" | "pdf" | "accent";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const tones: Record<string, string> = {
    muted: "border-line bg-surface-2 text-muted",
    excel: "border-[rgba(34,197,94,0.28)] bg-[rgba(34,197,94,0.12)] text-[#4ade80]",
    pdf: "border-[rgba(239,68,68,0.28)] bg-[rgba(239,68,68,0.12)] text-[#f87171]",
    accent: "border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors duration-150",
        "hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg border", tones[tone])}>
        {icon}
      </span>
      <span className="truncate text-[12px] text-content">{label}</span>
    </button>
  );
}

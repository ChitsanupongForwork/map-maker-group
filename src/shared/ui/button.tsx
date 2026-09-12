import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type Variant = "primary" | "ghost" | "outline" | "soft";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-[#160800] hover:bg-[var(--accent-hover)] shadow-[0_8px_24px_-10px_rgba(255,122,26,0.8)]",
  soft: "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)] hover:bg-[rgba(255,122,26,0.18)]",
  outline:
    "border border-line bg-surface-2/70 text-content hover:border-line-strong hover:bg-surface-3",
  ghost: "text-muted hover:text-content hover:bg-surface-2",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[12px] gap-1.5 rounded-lg",
  md: "h-9 px-3.5 text-[13px] gap-2 rounded-[10px]",
};

export function Button({
  variant = "outline",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-medium transition-colors duration-150 select-none",
        "disabled:pointer-events-none disabled:opacity-45",
        SIZES[size],
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({
  className,
  label,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-line",
        "bg-surface-2/80 text-muted backdrop-blur transition-colors duration-150",
        "hover:border-line-strong hover:bg-surface-3 hover:text-content",
        className,
      )}
      {...props}
    />
  );
}

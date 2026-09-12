import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("panel", className)} {...props} />;
}

export function PanelHeader({
  title,
  action,
  icon,
  className,
}: {
  title: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-12 items-center justify-between gap-3 border-b border-line px-3.5",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {icon}
        <span className="truncate text-[13px] font-semibold tracking-tight text-content">
          {title}
        </span>
      </div>
      {action}
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-medium tracking-wide text-dim">{children}</span>
  );
}

import { cn } from "@/shared/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[linear-gradient(90deg,#121a24,#18212d,#121a24)]",
        className,
      )}
    />
  );
}

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-[58px] w-full" />
      ))}
    </div>
  );
}

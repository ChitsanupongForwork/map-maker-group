import { cn } from "@/shared/lib/cn";

const SWEEP = 250; // องศาที่เข็มกวาดได้ทั้งหมด
const START = 90 + (360 - SWEEP) / 2;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
}

function arcPath(cx: number, cy: number, r: number, fromDeg: number, toDeg: number) {
  const [x1, y1] = polar(cx, cy, r, fromDeg);
  const [x2, y2] = polar(cx, cy, r, toDeg);
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/** เกจความเร็ว — วาดด้วย path ล้วน ไม่มี state ไม่มี re-render ที่ไม่จำเป็น */
export function Gauge({
  value,
  max = 160,
  unit = "km/h",
  caption,
  color = "var(--accent)",
  className,
}: {
  value: number;
  max?: number;
  unit?: string;
  caption?: string;
  color?: string;
  className?: string;
}) {
  const ratio = Math.max(0, Math.min(1, value / max));
  const end = START + SWEEP * ratio;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <svg viewBox="0 0 120 120" className="size-[112px]" aria-hidden>
          <path
            d={arcPath(60, 60, 48, START, START + SWEEP)}
            fill="none"
            stroke="var(--line)"
            strokeWidth={9}
            strokeLinecap="round"
          />
          <path
            d={arcPath(60, 60, 48, START, Math.max(START + 0.01, end))}
            fill="none"
            stroke={color}
            strokeWidth={9}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[26px] leading-none font-semibold tracking-tight text-content tabular-nums">
            {Math.round(value)}
          </span>
          <span className="mt-1 text-[10px] text-dim">{unit}</span>
        </div>
      </div>
      {caption ? <span className="mt-1 text-[11px] text-muted">{caption}</span> : null}
    </div>
  );
}

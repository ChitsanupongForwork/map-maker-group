"use client";

import { useId } from "react";
import { cn } from "@/shared/lib/cn";

const W = 600;
const H = 150;

/** เส้นกราฟย้อนหลัง — รับค่าดิบมา แล้วสร้าง path ครั้งเดียวต่อการ render */
export function Sparkline({
  values,
  color = "var(--accent)",
  className,
  labels,
}: {
  values: readonly number[];
  color?: string;
  className?: string;
  labels?: readonly string[];
}) {
  const gradientId = useId();
  const max = Math.max(1, ...values);
  const step = values.length > 1 ? W / (values.length - 1) : W;

  const points = values.map((value, index) => {
    const x = index * step;
    const y = H - (value / max) * (H - 12) - 6;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const line = `M ${points.join(" L ")}`;
  const area = `${line} L ${W},${H} L 0,${H} Z`;

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full flex-1"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            x2={W}
            y1={H * ratio}
            y2={H * ratio}
            stroke="var(--line)"
            strokeWidth="1"
            strokeDasharray="3 6"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {labels ? (
        <div className="mt-1.5 flex justify-between text-[10px] text-dim tabular-nums">
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";

type SpeedSparklineProps = {
  /** Reset the series when this changes — a new vehicle starts a new history. */
  vehicleId: string;
  speedKph: number;
  color: string;
  width?: number;
  height?: number;
};

const POINTS = 14;
const MAX_KPH = 120;

/**
 * Recent speed, kept client-side. The API sends one reading at a time, so the
 * shape is built from what this session has actually seen rather than from a
 * history endpoint that does not exist.
 */
export default function SpeedSparkline({ vehicleId, speedKph, color, width = 172, height = 30 }: SpeedSparklineProps) {
  const gradientId = useId();
  const [series, setSeries] = useState<number[]>([speedKph]);
  const trackedId = useRef(vehicleId);

  useEffect(() => {
    setSeries((current) => {
      if (trackedId.current !== vehicleId) {
        trackedId.current = vehicleId;
        return [speedKph];
      }
      if (current[current.length - 1] === speedKph) return current;
      return [...current, speedKph].slice(-POINTS);
    });
  }, [speedKph, vehicleId]);

  // One reading is a dot, not a line; wait for a second before drawing.
  const values = series.length > 1 ? series : [speedKph, speedKph];
  const step = width / (values.length - 1);
  const toY = (value: number) => height - 3 - (Math.min(value, MAX_KPH) / MAX_KPH) * (height - 6);
  const line = values.map((value, index) => `${index === 0 ? "M" : "L"}${(index * step).toFixed(1)} ${toY(value).toFixed(1)}`).join(" ");
  const lastX = width;
  const lastY = toY(values[values.length - 1]);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${lastX} ${height} L0 ${height}Z`} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r="2.6" fill={color} />
    </svg>
  );
}

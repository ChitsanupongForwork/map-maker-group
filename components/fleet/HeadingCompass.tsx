"use client";

type HeadingCompassProps = {
  headingDeg: number;
  size?: number;
  color: string;
  trackColor: string;
  labelColor: string;
};

const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC = CIRCUMFERENCE / 6;

/**
 * A bearing in degrees is a number nobody reads as a direction. The needle and
 * the swept arc turn it into something the eye resolves without arithmetic.
 */
export default function HeadingCompass({ headingDeg, size = 68, color, trackColor, labelColor }: HeadingCompassProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 68 68" role="img" aria-label={`${headingDeg}°`}>
      <circle cx="34" cy="34" r={RADIUS} fill="none" stroke={trackColor} strokeWidth="1" />
      <circle
        cx="34"
        cy="34"
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeDasharray={`${ARC} ${CIRCUMFERENCE - ARC}`}
        transform={`rotate(${headingDeg - 105} 34 34)`}
        style={{ transition: "transform 600ms ease-out" }}
      />
      <path
        d="M34 15 L39.5 36 L34 31.5 L28.5 36Z"
        fill={color}
        transform={`rotate(${headingDeg} 34 34)`}
        style={{ transition: "transform 600ms ease-out" }}
      />
      <text x="34" y="56" textAnchor="middle" fontFamily="var(--font-data)" fontSize="9.5" fontWeight="700" fill={labelColor}>
        {headingDeg}°
      </text>
    </svg>
  );
}

import type { ThemeMode } from "@/lib/design-tokens";

/**
 * The API formats `lastUpdate` as a Bangkok wall clock (`HH:MM:SS`), so ageing a
 * reading means comparing it against Bangkok's clock rather than the viewer's.
 */
const TIME_ZONE = "Asia/Bangkok";
const SECONDS_PER_DAY = 86_400;

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

let cachedAt = 0;
let cachedSeconds = 0;

/** Cached for half a second: the list asks for this once per visible row. */
function bangkokSecondsOfDay() {
  const now = Date.now();
  if (now - cachedAt < 500) return cachedSeconds;

  let hour = 0;
  let minute = 0;
  let second = 0;
  for (const part of formatter.formatToParts(new Date(now))) {
    if (part.type === "hour") hour = Number(part.value);
    if (part.type === "minute") minute = Number(part.value);
    if (part.type === "second") second = Number(part.value);
  }

  cachedAt = now;
  cachedSeconds = hour * 3_600 + minute * 60 + second;
  return cachedSeconds;
}

/** `HH:MM:SS` on Bangkok's clock — the same shape the API stamps readings with. */
export function bangkokTimeString(secondsAgo = 0) {
  const total = (bangkokSecondsOfDay() - secondsAgo + SECONDS_PER_DAY) % SECONDS_PER_DAY;
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(Math.floor(total / 3_600))}:${pad(Math.floor((total % 3_600) / 60))}:${pad(total % 60)}`;
}

export function secondsSinceUpdate(lastUpdate: string) {
  const [hour, minute, second] = lastUpdate.split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute) || !Number.isFinite(second)) return 0;

  let elapsed = bangkokSecondsOfDay() - (hour * 3_600 + minute * 60 + second);
  // A reading stamped just before midnight read just after it looks like -86,399s.
  if (elapsed < -60) elapsed += SECONDS_PER_DAY;
  return Math.max(0, elapsed);
}

/** Compact age for a list row: 8s · 4m · 2h. */
export function formatAge(secondsAgo: number) {
  if (secondsAgo < 60) return `${secondsAgo}s`;
  if (secondsAgo < 3_600) return `${Math.floor(secondsAgo / 60)}m`;
  return `${Math.floor(secondsAgo / 3_600)}h`;
}

/**
 * How stale a reading is. The list turning amber then red is the strongest
 * realtime signal on the page, and it costs no animation at all.
 */
export type FreshnessLevel = "fresh" | "stale" | "dead";

export function getFreshnessLevel(secondsAgo: number): FreshnessLevel {
  if (secondsAgo > 300) return "dead";
  if (secondsAgo > 60) return "stale";
  return "fresh";
}

export function getFreshnessColor(level: FreshnessLevel, mode: ThemeMode) {
  if (level === "dead") return mode === "dark" ? "#F87171" : "#DC2626";
  if (level === "stale") return mode === "dark" ? "#FBBF24" : "#B45309";
  return mode === "dark" ? "#6D7A8C" : "#8A94A3";
}

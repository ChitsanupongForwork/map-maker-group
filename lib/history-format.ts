/**
 * The fleet API stamps `lastUpdate` as a Bangkok wall clock, so the history
 * page reads its timestamps on the same clock. A replay whose times disagree
 * with the realtime page by a timezone is worse than useless.
 */
const TIME_ZONE = "Asia/Bangkok";

const clockWithSeconds = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
const clock = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour12: false, hour: "2-digit", minute: "2-digit" });

export function formatClock(iso: string, withSeconds = false) {
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return "--:--";
  return (withSeconds ? clockWithSeconds : clock).format(at);
}

/** Compact trip length: 1h 24m · 8m 20s. */
export function formatDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1_000));
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${totalSeconds % 60}s`;
}

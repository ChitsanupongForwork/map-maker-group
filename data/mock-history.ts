import { createSeededRandom } from "@/lib/seeded-random";
import type { FleetVehicle, TrackPoint } from "@/types/fleet";

/**
 * Stand-in recorded tracks for when the API layer is switched off in
 * lib/fleet-config.ts, mirroring the shape `GET /api/fleet/{id}/history`
 * returns. Like the rest of the demo data it is played, never presented as
 * real: the store marks the connection "demo" and the status badge says so.
 *
 * A day is a working route rather than a random walk — drive to a drop, stand
 * still for a while, drive to the next — because a random walk draws loops no
 * vehicle has ever made, and because the stops are what the speed chart and the
 * trackpoint table exist to show.
 */
const WORKDAY_START_HOUR = 8;
const WORKDAY_END_HOUR = 18;
const INTERVAL_MS = 30_000;
/** Enough for a week at a glance without making the browser draw a novel. */
const MAX_POINTS = 3_000;
const MAX_DAYS = 14;
/** One dropout per day, long enough that the playhead jumps rather than slides. */
const DROPOUT_POINTS = 10;
/** Degrees of latitude per kilometre, near enough for generated data. */
const DEG_PER_KM = 1 / 111;
/** How far the drops sit from the depot: a delivery round, not a road trip. */
const LEG_MIN_KM = 2.5;
const LEG_MAX_KM = 9;
/** The tightest turn a step may make, so the route bends instead of kinking. */
const MAX_TURN_DEG = 14;

function dayStart(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1, 0, 0, 0, 0);
}

/** Stable per vehicle and per day, so a reload replays the same trip. */
function seedFor(vehicleId: string, dayIndex: number) {
  let seed = 2_166_136_261;
  for (let position = 0; position < vehicleId.length; position += 1) {
    seed = Math.imul(seed ^ vehicleId.charCodeAt(position), 16_777_619);
  }
  return (seed ^ Math.imul(dayIndex + 1, 2_654_435_761)) >>> 0;
}

type DayWindow = { from: number; to: number; index: number };

function workdayWindows(fromKey: string, toKey: string, now: number): DayWindow[] {
  const first = dayStart(fromKey).getTime();
  const last = dayStart(toKey).getTime();
  if (!Number.isFinite(first) || !Number.isFinite(last) || last < first) return [];

  const windows: DayWindow[] = [];
  for (let index = 0; index < MAX_DAYS; index += 1) {
    const midnight = new Date(first);
    midnight.setDate(midnight.getDate() + index);
    if (midnight.getTime() > last) break;

    const start = new Date(midnight);
    start.setHours(WORKDAY_START_HOUR, 0, 0, 0);
    const end = new Date(midnight);
    end.setHours(WORKDAY_END_HOUR, 0, 0, 0);

    // Today's round is not finished yet, and a day that has not started has no
    // track at all rather than one invented into the future.
    const to = Math.min(end.getTime(), now);
    if (to <= start.getTime()) continue;
    windows.push({ from: start.getTime(), to, index });
  }
  return windows;
}

/** Compass bearing from one point to another, in the heading the fleet uses. */
function bearing(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  return ((Math.atan2(toLng - fromLng, toLat - fromLat) * 180) / Math.PI + 360) % 360;
}

function turnTowards(heading: number, target: number) {
  const delta = ((target - heading + 540) % 360) - 180;
  return (heading + Math.max(-MAX_TURN_DEG, Math.min(MAX_TURN_DEG, delta)) + 360) % 360;
}

export function generateMockTrack(vehicle: Pick<FleetVehicle, "id" | "lat" | "lng">, fromKey: string, toKey: string, now = Date.now()): TrackPoint[] {
  const windows = workdayWindows(fromKey, toKey, now);
  if (windows.length === 0) return [];

  const totalSpan = windows.reduce((sum, window) => sum + (window.to - window.from), 0);
  // A wider range reports less often rather than more: the point of a week is
  // its shape, and thirty-second readings for seven days is 20,000 points.
  const interval = Math.max(INTERVAL_MS, Math.ceil(totalSpan / MAX_POINTS / 1_000) * 1_000);
  const stepHours = interval / 3_600_000;

  const track: TrackPoint[] = [];
  for (const window of windows) {
    const random = createSeededRandom(seedFor(vehicle.id, window.index));
    const count = Math.floor((window.to - window.from) / interval);
    if (count < 2) continue;

    // The round starts near where the vehicle stands now, so the demo history
    // and the demo fleet marker are in the same part of the map.
    const depotLat = vehicle.lat + (random() - 0.5) * 0.05;
    const depotLng = vehicle.lng + (random() - 0.5) * 0.05;
    const dropoutAt = Math.floor(count * (0.4 + random() * 0.15));

    let lat = depotLat;
    let lng = depotLng;
    let heading = Math.floor(random() * 360);
    let speed = 0;
    let stopStepsLeft = 0;
    let targetLat = depotLat;
    let targetLng = depotLng;
    let cruise = 0;
    let legStep = 0;
    let legSteps = 1;
    let legSwing = 0;

    function nextDrop() {
      const distanceKm = LEG_MIN_KM + random() * (LEG_MAX_KM - LEG_MIN_KM);
      const course = random() * Math.PI * 2;
      targetLat = depotLat + Math.cos(course) * distanceKm * DEG_PER_KM;
      targetLng = depotLng + Math.sin(course) * distanceKm * DEG_PER_KM;
      // Roads bow; a bearing held exactly draws a ruler line across the map.
      // Each leg bends one way and comes back, strongest in the middle of it.
      legStep = 0;
      legSteps = Math.max(4, Math.round(distanceKm / Math.max(0.2, 55 * stepHours)));
      legSwing = (random() - 0.5) * 54;
      // One leg in four takes an expressway, which is what puts the route into
      // the amber and red bands instead of leaving it green all day.
      cruise = random() < 0.25 ? 72 + random() * 26 : 32 + random() * 30;
      // A parked vehicle leaves in whatever direction the next drop is in.
      // Turning towards it while moving is what drew loops at every stop.
      heading = Math.round(bearing(lat, lng, targetLat, targetLng));
    }

    nextDrop();

    for (let step = 0; step < count; step += 1) {
      // The dropout is a hole in the readings rather than slow readings: the
      // times either side of it are what tells the playback to jump.
      if (step >= dropoutAt && step < dropoutAt + DROPOUT_POINTS) continue;

      if (stopStepsLeft > 0) {
        stopStepsLeft -= 1;
        speed = 0;
        track.push({ t: new Date(window.from + step * interval).toISOString(), lat, lng, speedKph: 0, headingDeg: heading, accOn: true });
        if (stopStepsLeft === 0) nextDrop();
        continue;
      }

      const remainingKm = Math.hypot(targetLat - lat, targetLng - lng) / DEG_PER_KM;
      const stepKm = Math.max(0.05, speed * stepHours);
      // Slow down on approach, and never overshoot the drop by a whole step.
      const wanted = remainingKm < stepKm * 2.5 ? Math.min(cruise, 18) : cruise + (random() - 0.5) * 8;
      speed = Math.max(0, Math.round(speed + Math.max(-14, Math.min(9, wanted - speed))));
      const bow = legSwing * Math.sin((Math.PI * Math.min(legStep, legSteps)) / legSteps);
      heading = Math.round(turnTowards(heading, bearing(lat, lng, targetLat, targetLng) + bow + (random() - 0.5) * 6));
      legStep += 1;

      track.push({ t: new Date(window.from + step * interval).toISOString(), lat, lng, speedKph: speed, headingDeg: heading, accOn: true });

      const radians = (heading * Math.PI) / 180;
      const travelled = speed * stepHours * DEG_PER_KM;
      lat += Math.cos(radians) * travelled;
      lng += Math.sin(radians) * travelled;

      // Arriving starts a delivery stop of five to thirty minutes, which is
      // where most of a working day actually goes.
      if (remainingKm < Math.max(0.2, stepKm)) {
        lat = targetLat;
        lng = targetLng;
        stopStepsLeft = Math.max(1, Math.round((5 + random() * 25) * 60_000 / interval));
      }
    }
  }

  return track;
}

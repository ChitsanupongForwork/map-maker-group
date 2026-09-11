import { create } from "zustand";

import type { TrackPoint } from "@/types/fleet";

export type PlaybackRate = 0.5 | 1 | 2 | 4 | 8;
export type HistoryStatus = "idle" | "loading" | "ready" | "error";

/**
 * Two readings further apart than this are a gap in the signal, not a drive:
 * the playhead jumps between them instead of inventing a straight line, and the
 * gap costs only this much playback time however long it really lasted.
 */
export const MAX_INTERPOLATED_GAP_MS = 30_000;

/**
 * How long a typical step between two readings takes to play at 1×. Playing a
 * track at true wall-clock speed would mean watching an hour of driving for an
 * hour, so 1× means "about one point per second" instead — measured against the
 * track's own median interval, so a device reporting every second and one
 * reporting every minute both play at a watchable pace. Time within the track
 * stays proportional, so a long stop still reads as a long stop.
 */
const POINT_MS_AT_1X = 900;

type Playhead = { index: number; fraction: number };

type HistoryState = {
  vehicleId: string;
  /** Range being played, inclusive, as `YYYY-MM-DD` in the viewer's own clock. */
  from: string;
  to: string;
  status: HistoryStatus;
  errorDetail: string;
  truncated: boolean;
  track: TrackPoint[];
  /** Cumulative playback milliseconds at each point; same length as `track`. */
  timeline: number[];
  totalMs: number;
  /** Playback length of a segment that counts as a signal gap, after scaling. */
  gapCap: number;
  elapsedMs: number;
  index: number;
  fraction: number;
  isPlaying: boolean;
  rate: PlaybackRate;
  followCamera: boolean;
  /** Set by the map: the playhead has left the visible area. */
  playheadOffscreen: boolean;
  inspectorOpen: boolean;
  setVehicleId: (vehicleId: string) => void;
  setRange: (from: string, to: string) => void;
  setLoading: () => void;
  setTrack: (track: TrackPoint[], truncated: boolean) => void;
  setError: (detail: string) => void;
  setElapsed: (elapsedMs: number) => void;
  seekToIndex: (index: number) => void;
  stepBy: (points: number) => void;
  advance: (deltaMs: number) => void;
  setPlaying: (isPlaying: boolean) => void;
  togglePlaying: () => void;
  setRate: (rate: PlaybackRate) => void;
  setFollowCamera: (followCamera: boolean) => void;
  setPlayheadOffscreen: (playheadOffscreen: boolean) => void;
  setInspectorOpen: (inspectorOpen: boolean) => void;
};

export function todayKey(at = new Date()) {
  return `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}-${String(at.getDate()).padStart(2, "0")}`;
}

/**
 * Playback time per segment: capped so a lost signal is not a long stall, then
 * divided by the track's own median interval so 1× is roughly a point a second.
 */
function buildTimeline(track: TrackPoint[]) {
  const gaps = new Array<number>(Math.max(0, track.length - 1));
  for (let index = 1; index < track.length; index += 1) {
    const gap = Date.parse(track[index].t) - Date.parse(track[index - 1].t);
    gaps[index - 1] = Math.min(Number.isFinite(gap) && gap > 0 ? gap : 0, MAX_INTERPOLATED_GAP_MS);
  }

  const sorted = [...gaps].sort((left, right) => left - right);
  const median = sorted[Math.floor(sorted.length / 2)] || POINT_MS_AT_1X;
  const scale = median / POINT_MS_AT_1X;

  const timeline = new Array<number>(track.length).fill(0);
  let total = 0;
  for (let index = 0; index < gaps.length; index += 1) {
    total += gaps[index] / scale;
    timeline[index + 1] = total;
  }
  return { timeline, totalMs: total, gapCap: MAX_INTERPOLATED_GAP_MS / scale };
}

function resolvePlayhead(track: TrackPoint[], timeline: number[], gapCap: number, elapsedMs: number): Playhead {
  if (track.length === 0) return { index: 0, fraction: 0 };

  // Binary search: a full day at ten-second readings is thousands of points,
  // and this runs on every animation frame.
  let low = 0;
  let high = timeline.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (timeline[middle] <= elapsedMs) low = middle;
    else high = middle - 1;
  }

  const next = timeline[low + 1];
  if (next === undefined) return { index: low, fraction: 0 };

  const span = next - timeline[low];
  // A capped segment is a signal gap, so the playhead jumps rather than
  // sliding across ground the vehicle may never have covered.
  if (span <= 0 || span >= gapCap) return { index: low, fraction: 0 };
  return { index: low, fraction: Math.min(1, Math.max(0, (elapsedMs - timeline[low]) / span)) };
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  vehicleId: "",
  from: todayKey(),
  to: todayKey(),
  status: "idle",
  errorDetail: "",
  truncated: false,
  track: [],
  timeline: [],
  totalMs: 0,
  gapCap: MAX_INTERPOLATED_GAP_MS,
  elapsedMs: 0,
  index: 0,
  fraction: 0,
  isPlaying: false,
  rate: 1,
  followCamera: true,
  playheadOffscreen: false,
  inspectorOpen: true,

  setVehicleId: (vehicleId) => set((state) => (
    state.vehicleId === vehicleId ? state : { vehicleId, track: [], timeline: [], totalMs: 0, elapsedMs: 0, index: 0, fraction: 0, isPlaying: false, truncated: false, status: "loading" }
  )),
  setRange: (from, to) => set((state) => {
    // An end before the start is a half-finished edit in the second field, not
    // a range to reload for: keep it, and let the fetch wait for the rest.
    const ordered = from <= to ? { from, to } : { from: to, to: from };
    if (state.from === ordered.from && state.to === ordered.to) return state;
    return { ...ordered, track: [], timeline: [], totalMs: 0, elapsedMs: 0, index: 0, fraction: 0, isPlaying: false, truncated: false, status: "loading" };
  }),
  setLoading: () => set({ status: "loading", errorDetail: "" }),
  setTrack: (track, truncated) => set(() => {
    const { timeline, totalMs, gapCap } = buildTimeline(track);
    return { track, timeline, totalMs, gapCap, truncated, elapsedMs: 0, index: 0, fraction: 0, isPlaying: false, status: "ready", errorDetail: "" };
  }),
  setError: (errorDetail) => set({ status: "error", errorDetail, track: [], timeline: [], totalMs: 0, isPlaying: false }),

  setElapsed: (elapsedMs) => set((state) => {
    const clamped = Math.min(Math.max(0, elapsedMs), state.totalMs);
    return { elapsedMs: clamped, ...resolvePlayhead(state.track, state.timeline, state.gapCap, clamped) };
  }),
  seekToIndex: (index) => set((state) => {
    const clamped = Math.min(Math.max(0, index), Math.max(0, state.track.length - 1));
    return { elapsedMs: state.timeline[clamped] ?? 0, index: clamped, fraction: 0 };
  }),
  stepBy: (points) => {
    const state = get();
    state.setPlaying(false);
    state.seekToIndex(state.index + points);
  },
  advance: (deltaMs) => set((state) => {
    const next = state.elapsedMs + deltaMs;
    // Reaching the end stops playback rather than looping: a loop makes it
    // impossible to tell the end of the trip from the start of it.
    if (next >= state.totalMs) {
      return { elapsedMs: state.totalMs, isPlaying: false, index: Math.max(0, state.track.length - 1), fraction: 0 };
    }
    return { elapsedMs: next, ...resolvePlayhead(state.track, state.timeline, state.gapCap, next) };
  }),

  setPlaying: (isPlaying) => set((state) => {
    if (!isPlaying) return { isPlaying: false };
    if (state.track.length < 2) return state;
    // Pressing play at the end replays from the start.
    if (state.elapsedMs >= state.totalMs) return { isPlaying: true, elapsedMs: 0, index: 0, fraction: 0 };
    return { isPlaying: true };
  }),
  togglePlaying: () => get().setPlaying(!get().isPlaying),
  setRate: (rate) => set({ rate }),
  // Turning following back on recentres immediately, so the "off screen"
  // notice has already stopped being true by the time it disappears.
  setFollowCamera: (followCamera) => set(followCamera ? { followCamera, playheadOffscreen: false } : { followCamera }),
  setPlayheadOffscreen: (playheadOffscreen) => set({ playheadOffscreen }),
  setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),
}));

/** Interpolated position of the playhead, in map coordinates. */
export function getPlayheadPosition(track: TrackPoint[], index: number, fraction: number): [number, number] | null {
  const point = track[index];
  if (!point) return null;
  const next = track[index + 1];
  if (!next || fraction === 0) return [point.lat, point.lng];
  return [point.lat + (next.lat - point.lat) * fraction, point.lng + (next.lng - point.lng) * fraction];
}

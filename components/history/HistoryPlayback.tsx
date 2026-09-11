"use client";

import { useEffect } from "react";

import { generateMockTrack } from "@/data/mock-history";
import { fleetApiEnabled } from "@/lib/fleet-config";
import { getVehicleHistory } from "@/services/fleet/get-vehicle-history";
import { useFleetStore } from "@/stores/use-fleet-store";
import { useHistoryStore } from "@/stores/use-history-store";

/** One point per tick when motion is reduced, instead of a sliding playhead. */
const REDUCED_STEP_MS = 700;

function rangeBounds(from: string, to: string) {
  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
  const [toYear, toMonth, toDay] = to.split("-").map(Number);
  return {
    from: new Date(fromYear, (fromMonth ?? 1) - 1, fromDay ?? 1, 0, 0, 0, 0).toISOString(),
    to: new Date(toYear, (toMonth ?? 1) - 1, toDay ?? 1, 23, 59, 59, 999).toISOString(),
  };
}

/**
 * Loads the selected vehicle's track and runs the playback clock. The clock
 * advances by elapsed time × rate rather than one point per tick: readings ten
 * seconds apart and readings two minutes apart must not take the same time to
 * play, or the replay lies about how long the vehicle stood still.
 */
export default function HistoryPlayback() {
  const vehicleId = useHistoryStore((state) => state.vehicleId);
  const from = useHistoryStore((state) => state.from);
  const to = useHistoryStore((state) => state.to);
  const isPlaying = useHistoryStore((state) => state.isPlaying);
  const rate = useHistoryStore((state) => state.rate);
  // A boolean, not the vehicle itself: the demo fleet re-renders every two
  // seconds, and depending on the object would restart the replay each time.
  const vehicleReady = useFleetStore((state) => state.vehicles.some((item) => item.id === vehicleId));

  useEffect(() => {
    if (!vehicleId) return;

    // Demo mode: the same generated fleet the map is already showing, given a
    // recorded past. No request is made, so there is nothing to fail.
    if (!fleetApiEnabled) {
      const vehicle = useFleetStore.getState().vehicles.find((item) => item.id === vehicleId);
      if (!vehicle) return;
      useHistoryStore.getState().setTrack(generateMockTrack(vehicle, from, to), false);
      return;
    }

    const controller = new AbortController();
    const bounds = rangeBounds(from, to);
    useHistoryStore.getState().setLoading();

    getVehicleHistory(vehicleId, bounds.from, bounds.to, controller.signal)
      .then((history) => useHistoryStore.getState().setTrack(history.points ?? [], history.truncated))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        useHistoryStore.getState().setError(error instanceof Error ? error.message : "unknown error");
      });

    return () => controller.abort();
  }, [from, to, vehicleId, vehicleReady]);

  useEffect(() => {
    if (!isPlaying) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const timer = window.setInterval(() => {
        const state = useHistoryStore.getState();
        if (state.index >= state.track.length - 1) {
          state.setPlaying(false);
          return;
        }
        state.seekToIndex(state.index + 1);
      }, REDUCED_STEP_MS / rate);
      return () => window.clearInterval(timer);
    }

    let frame = 0;
    let previous = performance.now();
    function step(now: number) {
      const delta = now - previous;
      previous = now;
      useHistoryStore.getState().advance(delta * rate);
      frame = window.requestAnimationFrame(step);
    }
    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [isPlaying, rate]);

  return null;
}

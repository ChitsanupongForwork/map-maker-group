"use client";

import { useEffect } from "react";

import { MOCK_TICK_MS, advanceMockFleet, generateMockFleet } from "@/data/mock-fleet";
import { fleetApiEnabled } from "@/lib/fleet-config";
import { createSeededRandom } from "@/lib/seeded-random";
import { useFleetStore } from "@/stores/use-fleet-store";
import { getFleetSnapshot } from "@/services/fleet/get-fleet-snapshot";
import { openFleetEventStream } from "@/services/fleet/open-fleet-event-stream";

const RETRY_DELAY_MS = 5_000;
const SNAPSHOT_ENDPOINT = "GET /api/fleet";
const STREAM_ENDPOINT = "GET /api/fleet/stream";

function describeError(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

/**
 * Owns the only connection to the fleet API. It renders nothing; every result,
 * including every failure, is reported through the fleet store so the rest of
 * the interface can tell live data apart from no data.
 *
 * When `fleetApiEnabled` is off it drives a local simulator instead and marks
 * the connection "demo", so nothing on screen claims to be live.
 */
export default function FleetRealtimeConnection() {
  const replaceVehicles = useFleetStore((state) => state.replaceVehicles);
  const applyVehicleUpdates = useFleetStore((state) => state.applyVehicleUpdates);
  const removeVehicle = useFleetStore((state) => state.removeVehicle);
  const setConnecting = useFleetStore((state) => state.setConnecting);
  const setConnected = useFleetStore((state) => state.setConnected);
  const setConnectionError = useFleetStore((state) => state.setConnectionError);
  const setDemoMode = useFleetStore((state) => state.setDemoMode);

  useEffect(() => {
    if (!fleetApiEnabled) return;

    let cancelled = false;
    let closeEventStream: (() => void) | undefined;
    let retryTimer: number | undefined;
    let streamBroken = false;

    async function loadSnapshot() {
      const vehicles = await getFleetSnapshot();
      if (cancelled) return;
      replaceVehicles(vehicles);
      setConnected();
    }

    async function connect() {
      setConnecting();

      try {
        await loadSnapshot();
      } catch (error) {
        if (cancelled) return;
        setConnectionError({ endpoint: SNAPSHOT_ENDPOINT, detail: describeError(error) });
        retryTimer = window.setTimeout(() => void connect(), RETRY_DELAY_MS);
        return;
      }
      if (cancelled) return;

      closeEventStream = openFleetEventStream(
        (message) => {
          if (cancelled) return;
          if (streamBroken) {
            // EventSource reconnected by itself. Re-read the fleet so changes
            // that happened while the stream was down are not lost.
            streamBroken = false;
            void loadSnapshot().catch((error) => {
              if (!cancelled) setConnectionError({ endpoint: SNAPSHOT_ENDPOINT, detail: describeError(error) });
            });
          }
          if (message.type === "fleet-snapshot" && message.vehicles) replaceVehicles(message.vehicles);
          if (message.type === "vehicle-updates" && message.vehicles) applyVehicleUpdates(message.vehicles);
          if (message.type === "vehicle-removed" && message.vehicleId) removeVehicle(message.vehicleId);
        },
        () => {
          if (cancelled) return;
          // EventSource retries on its own, so this stays an error state until
          // the next message arrives rather than tearing the connection down.
          streamBroken = true;
          setConnectionError({ endpoint: STREAM_ENDPOINT, detail: "Connection closed" });
        },
      );
    }

    void connect();

    return () => {
      cancelled = true;
      window.clearTimeout(retryTimer);
      closeEventStream?.();
    };
  }, [applyVehicleUpdates, removeVehicle, replaceVehicles, setConnected, setConnecting, setConnectionError]);

  useEffect(() => {
    if (fleetApiEnabled) return;

    replaceVehicles(generateMockFleet());
    setDemoMode();

    // Same cadence and batch size as the Go simulator, so ageing timestamps,
    // trails and sparklines behave here exactly as they do against the service.
    const random = createSeededRandom(4711);
    const timer = window.setInterval(() => {
      applyVehicleUpdates(advanceMockFleet(useFleetStore.getState().vehicles, random));
    }, MOCK_TICK_MS);

    return () => window.clearInterval(timer);
  }, [applyVehicleUpdates, replaceVehicles, setDemoMode]);

  return null;
}

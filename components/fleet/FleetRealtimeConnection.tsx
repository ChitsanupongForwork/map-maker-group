"use client";

import { useEffect } from "react";

import { useFleetStore } from "@/stores/use-fleet-store";
import { getFleetSnapshot } from "@/services/fleet/get-fleet-snapshot";
import { openFleetEventStream } from "@/services/fleet/open-fleet-event-stream";

export default function FleetRealtimeConnection() {
  const replaceVehicles = useFleetStore((state) => state.replaceVehicles);
  const applyVehicleUpdates = useFleetStore((state) => state.applyVehicleUpdates);

  useEffect(() => {
    let closeEventStream: (() => void) | undefined;
    let cancelled = false;

    async function connect() {
      try {
        replaceVehicles(await getFleetSnapshot());
        if (cancelled) return;
        closeEventStream = openFleetEventStream(applyVehicleUpdates);
      } catch {
        // Keep the deterministic front-end demo data when the Go service is not running.
      }
    }

    void connect();
    return () => {
      cancelled = true;
      closeEventStream?.();
    };
  }, [applyVehicleUpdates, replaceVehicles]);

  return null;
}

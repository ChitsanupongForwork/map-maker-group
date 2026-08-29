import type { FleetVehicle } from "@/types/fleet";

import { fleetApiUrl } from "./client";

export type FleetStreamMessage = { type?: "vehicle-updates" | "fleet-snapshot" | "vehicle-removed"; vehicles?: FleetVehicle[]; vehicleId?: string };

export function openFleetEventStream(onMessage: (message: FleetStreamMessage) => void, onError?: () => void) {
  const eventSource = new EventSource(`${fleetApiUrl}/api/fleet/stream`);

  eventSource.onmessage = (event) => {
    const message = JSON.parse(event.data) as FleetStreamMessage;
    if (message.type === "vehicle-updates" || message.type === "fleet-snapshot" || message.type === "vehicle-removed") onMessage(message);
  };
  eventSource.onerror = () => onError?.();

  return () => eventSource.close();
}

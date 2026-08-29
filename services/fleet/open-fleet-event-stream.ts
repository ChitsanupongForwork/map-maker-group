import type { FleetVehicle } from "@/types/fleet";

import { fleetApiUrl } from "./client";

type FleetUpdateMessage = { type?: string; vehicles?: FleetVehicle[] };

export function openFleetEventStream(onVehicles: (vehicles: FleetVehicle[]) => void, onError?: () => void) {
  const eventSource = new EventSource(`${fleetApiUrl}/api/fleet/stream`);

  eventSource.onmessage = (event) => {
    const message = JSON.parse(event.data) as FleetUpdateMessage;
    if (message.type === "vehicle-updates" && message.vehicles) onVehicles(message.vehicles);
  };
  eventSource.onerror = () => onError?.();

  return () => eventSource.close();
}

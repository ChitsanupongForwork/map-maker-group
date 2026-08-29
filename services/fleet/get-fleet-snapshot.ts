import type { FleetVehicle } from "@/types/fleet";

import { getJson } from "./client";

export function getFleetSnapshot(signal?: AbortSignal) {
  return getJson<FleetVehicle[]>("/api/fleet", signal);
}

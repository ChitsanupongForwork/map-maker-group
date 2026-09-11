import type { VehicleHistory } from "@/types/fleet";

import { getJson } from "./client";

/** One vehicle's track for a time window. `from`/`to` are ISO timestamps. */
export function getVehicleHistory(vehicleId: string, from: string, to: string, signal?: AbortSignal) {
  const query = new URLSearchParams({ from, to });
  return getJson<VehicleHistory>(`/api/fleet/${encodeURIComponent(vehicleId)}/history?${query}`, signal);
}

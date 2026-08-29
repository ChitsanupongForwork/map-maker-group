import type { FleetVehicle } from "@/types/fleet";

import { postJson } from "./client";

export type FleetSeedResponse = {
  seeded: boolean;
  vehicles: FleetVehicle[];
};

/** Seeds five fictional portfolio vehicles when a development database is empty. */
export function postFleetSeed() {
  return postJson<FleetSeedResponse>("/api/fleet/seed");
}

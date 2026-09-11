import { createSeededRandom } from "@/lib/seeded-random";
import { bangkokTimeString } from "@/lib/vehicle-freshness";
import type { FleetVehicle, VehicleStatus } from "@/types/fleet";

/**
 * Stand-in fleet for when the API layer is switched off in lib/fleet-config.ts.
 * It mirrors the Go demo simulator closely enough that the realtime parts of the
 * interface — ageing timestamps, trails, sparklines — behave the same offline.
 *
 * Nothing here is presented as live: the store marks the connection "demo" and
 * every status badge reads accordingly.
 */
const FLEET_SIZE = 1_000;
const BANGKOK_BOUNDS = { minLat: 13.55, maxLat: 13.95, minLng: 100.35, maxLng: 100.95 };

const demoDrivers = [
  { name: "Narin S.", initials: "NS" },
  { name: "Pimchanok K.", initials: "PK" },
  { name: "Thanawat R.", initials: "TR" },
  { name: "Mali C.", initials: "MC" },
] as const;

const demoVehicles = [
  { make: "Toyota", model: "Hilux Revo" },
  { make: "Isuzu", model: "D-Max" },
  { make: "Honda", model: "City Hatchback" },
  { make: "Ford", model: "Ranger" },
] as const;

const demoPlaces = ["North depot", "Rama IX hub", "Bang Na yard", "Riverside depot", "Lat Krabang hub", "Chatuchak depot"] as const;

export function generateMockFleet(count = FLEET_SIZE): FleetVehicle[] {
  // Seeded, so the same fleet appears on every reload and the map does not
  // rearrange itself while someone is working on the layout.
  const random = createSeededRandom(9042);
  const vehicles = new Array<FleetVehicle>(count);
  const statuses: VehicleStatus[] = ["moving", "moving", "moving", "stopped", "offline"];

  for (let index = 0; index < count; index += 1) {
    const status = statuses[index % statuses.length];
    const isMoving = status === "moving";
    const driver = demoDrivers[index % demoDrivers.length];
    const vehicleInfo = demoVehicles[index % demoVehicles.length];

    vehicles[index] = {
      id: `fleet-${index + 1}`,
      code: `FV-${String(index + 1).padStart(5, "0")}`,
      label: `Fleet vehicle ${index + 1}`,
      status,
      speedKph: isMoving ? 25 + Math.floor(random() * 78) : 0,
      accOn: isMoving || status === "stopped",
      headingDeg: Math.floor(random() * 360),
      driverName: driver.name,
      driverInitials: driver.initials,
      driverPhone: `Demo +66 80-000-${String((index % 9_999) + 1).padStart(4, "0")}`,
      licensePlate: `DEMO ${String((index % 999) + 1).padStart(3, "0")}`,
      make: vehicleInfo.make,
      model: vehicleInfo.model,
      origin: demoPlaces[index % demoPlaces.length],
      destination: demoPlaces[(index + 2) % demoPlaces.length],
      lat: BANGKOK_BOUNDS.minLat + random() * (BANGKOK_BOUNDS.maxLat - BANGKOK_BOUNDS.minLat),
      lng: BANGKOK_BOUNDS.minLng + random() * (BANGKOK_BOUNDS.maxLng - BANGKOK_BOUNDS.minLng),
      // Spread over the last couple of minutes so the freshness colours in the
      // list have something to show instead of every row reading the same age.
      lastUpdate: bangkokTimeString(status === "offline" ? 300 + Math.floor(random() * 900) : Math.floor(random() * 90)),
    };
  }

  return vehicles;
}

/** How many vehicles one tick touches — the Go simulator moves 40 every 2s. */
export const MOCK_TICK_SIZE = 40;
export const MOCK_TICK_MS = 2_000;

/**
 * One simulator step: nudges a slice of the fleet along its heading and restamps
 * it. Returns only the vehicles that changed, which is the same shape the SSE
 * stream sends, so the store path is identical in both modes.
 */
export function advanceMockFleet(vehicles: FleetVehicle[], random: () => number): FleetVehicle[] {
  if (vehicles.length === 0) return [];
  const updates: FleetVehicle[] = [];

  for (let step = 0; step < Math.min(MOCK_TICK_SIZE, vehicles.length); step += 1) {
    const current = vehicles[Math.floor(random() * vehicles.length)];
    let status = current.status;

    if (status === "offline" && random() < 0.2) status = "stopped";
    else if (status === "stopped" && random() < 0.25) status = "moving";
    else if (status === "moving" && random() < 0.08) status = "stopped";

    if (status !== "moving") {
      updates.push({ ...current, status, speedKph: 0, accOn: status === "stopped", lastUpdate: bangkokTimeString() });
      continue;
    }

    const headingDeg = (current.headingDeg + Math.floor(random() * 31) - 15 + 360) % 360;
    const radians = (headingDeg * Math.PI) / 180;
    updates.push({
      ...current,
      status,
      accOn: true,
      speedKph: 25 + Math.floor(random() * 78),
      headingDeg,
      lat: current.lat + Math.cos(radians) * 0.00035,
      lng: current.lng + Math.sin(radians) * 0.00035,
      lastUpdate: bangkokTimeString(),
    });
  }

  return updates;
}

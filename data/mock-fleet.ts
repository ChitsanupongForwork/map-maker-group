import { createSeededRandom } from "@/lib/seeded-random";
import type { FleetVehicle, VehicleStatus } from "@/types/fleet";

const FLEET_SIZE = 1_000;
const BANGKOK_BOUNDS = { minLat: 13.55, maxLat: 13.95, minLng: 100.35, maxLng: 100.95 };
const demoDrivers = [
  { name: "Narin S.", initials: "NS" }, { name: "Pimchanok K.", initials: "PK" }, { name: "Thanawat R.", initials: "TR" }, { name: "Mali C.", initials: "MC" },
] as const;
const demoVehicles = [
  { make: "Toyota", model: "Hilux Revo" }, { make: "Isuzu", model: "D-Max" }, { make: "Honda", model: "City Hatchback" }, { make: "Ford", model: "Ranger" },
] as const;
const demoPlaces = ["North depot", "Rama IX hub", "Bang Na yard", "Riverside depot", "Lat Krabang hub", "Chatuchak depot"] as const;
export function generateMockFleet(count = FLEET_SIZE): FleetVehicle[] {
  const random = createSeededRandom(9042);
  const vehicles = new Array<FleetVehicle>(count);
  const statuses: VehicleStatus[] = ["moving", "moving", "moving", "stopped", "offline"];

  for (let index = 0; index < count; index += 1) {
    const status = statuses[index % statuses.length];
    const isMoving = status === "moving";
    const accOn = isMoving || status === "stopped";
    const driver = demoDrivers[index % demoDrivers.length];
    const vehicleInfo = demoVehicles[index % demoVehicles.length];
    vehicles[index] = {
      id: `fleet-${index + 1}`,
      code: `FV-${String(index + 1).padStart(5, "0")}`,
      label: `Fleet vehicle ${index + 1}`,
      status,
      speedKph: isMoving ? 25 + Math.floor(random() * 78) : 0,
      accOn,
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
      lastUpdate: `10:${String(Math.floor(random() * 59)).padStart(2, "0")}:${String(Math.floor(random() * 59)).padStart(2, "0")}`,
    };
  }

  return vehicles;
}

export const mockFleet = generateMockFleet();

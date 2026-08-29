import type { FleetVehicle } from "@/types/fleet";

export const vehicleMarkerColors = { gray: "#64748B", green: "#16A34A", blue: "#0EA5E9", red: "#DC2626" } as const;

export function getVehicleMarkerColor(vehicle: Pick<FleetVehicle, "speedKph" | "accOn">) {
  if (vehicle.speedKph >= 90) return vehicleMarkerColors.red;
  if (vehicle.speedKph > 0 && vehicle.accOn) return vehicleMarkerColors.blue;
  if (vehicle.speedKph === 0 && vehicle.accOn) return vehicleMarkerColors.green;
  return vehicleMarkerColors.gray;
}

export function getVehicleAccLabel(vehicle: Pick<FleetVehicle, "accOn">) {
  return vehicle.accOn ? "ACC on" : "ACC off";
}

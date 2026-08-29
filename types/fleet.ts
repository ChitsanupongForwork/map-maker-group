export type VehicleStatus = "moving" | "stopped" | "offline";
export type FleetStatusFilter = VehicleStatus | "all";

export type FleetVehicle = {
  id: string;
  code: string;
  label: string;
  status: VehicleStatus;
  speedKph: number;
  accOn: boolean;
  headingDeg: number;
  driverName: string;
  driverInitials: string;
  driverPhone: string;
  licensePlate: string;
  make: string;
  model: string;
  origin: string;
  destination: string;
  lat: number;
  lng: number;
  lastUpdate: string;
};

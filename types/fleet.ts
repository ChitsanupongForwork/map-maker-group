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

/** One stored GPS reading from `position_events`, as the history page plays it. */
export type TrackPoint = {
  /** ISO timestamp; the playback clock runs on this, not on the array index. */
  t: string;
  lat: number;
  lng: number;
  speedKph: number;
  headingDeg: number;
  accOn: boolean;
};

export type VehicleHistory = {
  vehicleId: string;
  from: string;
  to: string;
  /** The API clipped the window at its per-request point cap. */
  truncated: boolean;
  points: TrackPoint[];
};

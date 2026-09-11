import { create } from "zustand";

import type { FleetStatusFilter, FleetVehicle } from "@/types/fleet";

/** "connecting" covers both the first attempt and every retry after a drop.
 *  "demo" means the API layer is switched off and the numbers are generated. */
export type ConnectionStatus = "connecting" | "live" | "error" | "demo";
export type ConnectionError = { endpoint: string; detail: string };
/** Positions kept for the selected vehicle only — 1,000 histories would cost
 *  memory for a line nobody is looking at. */
const TRAIL_LENGTH = 8;

type LatLng = [number, number];

type FleetState = {
  vehicles: FleetVehicle[];
  selectedVehicleId: string;
  statusFilter: FleetStatusFilter;
  detailsOpen: boolean;
  listOpen: boolean;
  connectionStatus: ConnectionStatus;
  connectionError: ConnectionError | null;
  trailVehicleId: string;
  trail: LatLng[];
  setSelectedVehicleId: (id: string) => void;
  setStatusFilter: (filter: FleetStatusFilter) => void;
  setDetailsOpen: (open: boolean) => void;
  setListOpen: (open: boolean) => void;
  replaceVehicles: (vehicles: FleetVehicle[]) => void;
  applyVehicleUpdates: (updates: FleetVehicle[]) => void;
  removeVehicle: (id: string) => void;
  setConnecting: () => void;
  setConnected: () => void;
  setConnectionError: (error: ConnectionError) => void;
  setDemoMode: () => void;
};

function appendTrail(trail: LatLng[], vehicle: FleetVehicle): LatLng[] {
  const last = trail[trail.length - 1];
  if (last && last[0] === vehicle.lat && last[1] === vehicle.lng) return trail;
  return [...trail, [vehicle.lat, vehicle.lng] as LatLng].slice(-TRAIL_LENGTH);
}

export const useFleetStore = create<FleetState>((set) => ({
  // The API is the only source of vehicles. Starting empty keeps the dashboard
  // from ever presenting stand-in records as if they came from the service.
  vehicles: [],
  selectedVehicleId: "",
  statusFilter: "all",
  detailsOpen: true,
  listOpen: true,
  connectionStatus: "connecting",
  connectionError: null,
  trailVehicleId: "",
  trail: [],
  setSelectedVehicleId: (id) => set((state) => ({
    selectedVehicleId: id,
    detailsOpen: true,
    // A trail belongs to one vehicle; switching selection starts a new one.
    trailVehicleId: id,
    trail: state.trailVehicleId === id ? state.trail : [],
  })),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setDetailsOpen: (detailsOpen) => set({ detailsOpen }),
  setListOpen: (listOpen) => set({ listOpen }),
  replaceVehicles: (vehicles) => set((state) => {
    const selectedVehicleId = vehicles.some((vehicle) => vehicle.id === state.selectedVehicleId)
      ? state.selectedVehicleId
      : vehicles[0]?.id ?? "";
    const selected = vehicles.find((vehicle) => vehicle.id === selectedVehicleId);
    const keepsTrail = state.trailVehicleId === selectedVehicleId;
    return {
      vehicles,
      selectedVehicleId,
      trailVehicleId: selectedVehicleId,
      trail: selected && keepsTrail ? appendTrail(state.trail, selected) : selected ? [[selected.lat, selected.lng]] : [],
    };
  }),
  applyVehicleUpdates: (updates) => set((state) => {
    if (updates.length === 0) return state;
    const updatesById = new Map(updates.map((vehicle) => [vehicle.id, vehicle]));
    const existingIds = new Set(state.vehicles.map((vehicle) => vehicle.id));
    const vehicles = state.vehicles.map((vehicle) => updatesById.get(vehicle.id) ?? vehicle);
    for (const update of updates) if (!existingIds.has(update.id)) vehicles.push(update);
    vehicles.sort((left, right) => left.code.localeCompare(right.code));

    // An update can arrive before the first snapshot resolves, which would
    // otherwise leave the details panel with nothing selected.
    const selectedVehicleId = state.selectedVehicleId || vehicles[0]?.id || "";
    const selected = updatesById.get(selectedVehicleId);
    return {
      vehicles,
      selectedVehicleId,
      trailVehicleId: selectedVehicleId,
      trail: selected && state.trailVehicleId === selectedVehicleId ? appendTrail(state.trail, selected) : state.trail,
    };
  }),
  removeVehicle: (id) => set((state) => {
    const vehicles = state.vehicles.filter((vehicle) => vehicle.id !== id);
    if (state.selectedVehicleId !== id) return { vehicles };
    const selectedVehicleId = vehicles[0]?.id ?? "";
    return { vehicles, selectedVehicleId, trailVehicleId: selectedVehicleId, trail: [] };
  }),
  setConnecting: () => set({ connectionStatus: "connecting" }),
  setConnected: () => set({ connectionStatus: "live", connectionError: null }),
  setConnectionError: (connectionError) => set({ connectionStatus: "error", connectionError }),
  setDemoMode: () => set({ connectionStatus: "demo", connectionError: null }),
}));

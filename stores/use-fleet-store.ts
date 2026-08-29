import { create } from "zustand";

import { mockFleet } from "@/data/mock-fleet";
import type { FleetStatusFilter, FleetVehicle } from "@/types/fleet";

type FleetState = {
  vehicles: FleetVehicle[];
  selectedVehicleId: string;
  statusFilter: FleetStatusFilter;
  detailsOpen: boolean;
  setSelectedVehicleId: (id: string) => void;
  setStatusFilter: (filter: FleetStatusFilter) => void;
  setDetailsOpen: (open: boolean) => void;
  replaceVehicles: (vehicles: FleetVehicle[]) => void;
  applyVehicleUpdates: (updates: FleetVehicle[]) => void;
};

export const useFleetStore = create<FleetState>((set) => ({
  vehicles: mockFleet,
  selectedVehicleId: mockFleet[0].id,
  statusFilter: "all",
  detailsOpen: true,
  setSelectedVehicleId: (id) => set({ selectedVehicleId: id, detailsOpen: true }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setDetailsOpen: (detailsOpen) => set({ detailsOpen }),
  replaceVehicles: (vehicles) => set((state) => ({
    vehicles,
    selectedVehicleId: vehicles.some((vehicle) => vehicle.id === state.selectedVehicleId) ? state.selectedVehicleId : vehicles[0]?.id ?? "",
  })),
  applyVehicleUpdates: (updates) => set((state) => {
    if (updates.length === 0) return state;
    const updatesById = new Map(updates.map((vehicle) => [vehicle.id, vehicle]));
    let changed = false;
    const vehicles = state.vehicles.map((vehicle) => {
      const update = updatesById.get(vehicle.id);
      if (!update) return vehicle;
      changed = true;
      return update;
    });
    return changed ? { vehicles } : state;
  }),
}));

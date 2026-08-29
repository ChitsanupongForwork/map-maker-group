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
  removeVehicle: (id: string) => void;
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
    const existingIds = new Set(state.vehicles.map((vehicle) => vehicle.id));
    const vehicles = state.vehicles.map((vehicle) => {
      const update = updatesById.get(vehicle.id);
      if (!update) return vehicle;
      return update;
    });
    for (const update of updates) if (!existingIds.has(update.id)) vehicles.push(update);
    vehicles.sort((left, right) => left.code.localeCompare(right.code));
    return { vehicles };
  }),
  removeVehicle: (id) => set((state) => {
    const vehicles = state.vehicles.filter((vehicle) => vehicle.id !== id);
    return { vehicles, selectedVehicleId: state.selectedVehicleId === id ? vehicles[0]?.id ?? "" : state.selectedVehicleId };
  }),
}));

import { create } from "zustand";

import { TOTAL_LOCATIONS } from "@/lib/constants";
import { generateLocations } from "@/lib/generate-locations";
import { getPinCategory } from "@/data/pin-categories";
import type { Location, MapPoint, PinDraft } from "@/types/location";

type LocationState = {
  locations: Location[];
  selectedId: string | null;
  isAdding: boolean;
  draftPosition: MapPoint | null;
  setSelectedId: (id: string | null) => void;
  startAdding: () => void;
  setDraftPosition: (point: MapPoint) => void;
  cancelAdding: () => void;
  addLocation: (draft: PinDraft) => void;
  removeLocation: (id: string) => void;
};

export const useLocationStore = create<LocationState>((set) => ({
  locations: generateLocations(TOTAL_LOCATIONS),
  selectedId: null,
  isAdding: false,
  draftPosition: null,
  setSelectedId: (id) => set({ selectedId: id }),
  startAdding: () => set({ isAdding: true, draftPosition: null, selectedId: null }),
  setDraftPosition: (point) => set({ draftPosition: point }),
  cancelAdding: () => set({ isAdding: false, draftPosition: null }),
  addLocation: (draft) =>
    set((state) => {
      if (!state.draftPosition) return state;

      const category = getPinCategory(draft.category);
      const location: Location = {
        id: `pin-${Date.now()}`,
        name: draft.name.trim(),
        category: draft.category,
        note: draft.note.trim(),
        lat: state.draftPosition.lat,
        lng: state.draftPosition.lng,
        color: category.color,
        createdAt: new Date().toISOString(),
      };

      return {
        locations: [location, ...state.locations],
        selectedId: location.id,
        isAdding: false,
        draftPosition: null,
      };
    }),
  removeLocation: (id) =>
    set((state) => ({
      locations: state.locations.filter((location) => location.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),
}));

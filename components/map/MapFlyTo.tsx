"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

import { useLocationStore } from "@/stores/use-location-store";

export default function MapFlyTo() {
  const map = useMap();
  const selectedId = useLocationStore((state) => state.selectedId);
  const locations = useLocationStore((state) => state.locations);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const location = locations.find((item) => item.id === selectedId);
    if (!location) {
      return;
    }

    map.flyTo([location.lat, location.lng], 15, { duration: 0.8 });
  }, [locations, map, selectedId]);

  return null;
}

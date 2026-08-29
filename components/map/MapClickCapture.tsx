"use client";

import { useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";

import { useLocationStore } from "@/stores/use-location-store";

export default function MapClickCapture() {
  const map = useMap();
  const isAdding = useLocationStore((state) => state.isAdding);
  const setDraftPosition = useLocationStore((state) => state.setDraftPosition);

  useMapEvents({
    click(event) {
      if (isAdding) setDraftPosition({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  useEffect(() => {
    map.getContainer().style.cursor = isAdding ? "crosshair" : "";
    return () => { map.getContainer().style.cursor = ""; };
  }, [isAdding, map]);

  return null;
}

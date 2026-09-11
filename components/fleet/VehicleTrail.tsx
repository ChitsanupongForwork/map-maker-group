"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

import { useUiPreferences } from "@/components/providers/MuiProvider";
import { fleetTokens } from "@/lib/design-tokens";
import { useFleetStore } from "@/stores/use-fleet-store";

/**
 * The last few positions of the selected vehicle, drawn as a dashed line. Only
 * the selection is tracked: keeping a history for all 1,000 would spend memory
 * on lines nobody is looking at.
 */
export default function VehicleTrail() {
  const map = useMap();
  const { mode } = useUiPreferences();
  const trail = useFleetStore((state) => state.trail);
  const lineRef = useRef<L.Polyline | null>(null);
  const accent = fleetTokens[mode].accent;

  useEffect(() => {
    const line = L.polyline([], {
      color: accent,
      weight: 1.8,
      opacity: 0.8,
      dashArray: "1 5",
      lineCap: "round",
      interactive: false,
    }).addTo(map);
    lineRef.current = line;

    return () => {
      map.removeLayer(line);
      lineRef.current = null;
    };
  }, [accent, map]);

  useEffect(() => {
    // Two points make the shortest line worth drawing.
    lineRef.current?.setLatLngs(trail.length > 1 ? trail : []);
  }, [trail]);

  return null;
}

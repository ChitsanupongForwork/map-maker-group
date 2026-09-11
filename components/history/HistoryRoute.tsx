"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

import { useUiPreferences } from "@/components/providers/MuiProvider";
import { fleetTokens } from "@/lib/design-tokens";
import { getSpeedBand, speedBandColors } from "@/lib/fleet-appearance";
import { useHistoryStore } from "@/stores/use-history-store";
import type { TrackPoint } from "@/types/fleet";

type Segment = { band: ReturnType<typeof getSpeedBand>; points: [number, number][] };

/**
 * One run of the route that stays inside a single speed band. A segment is
 * coloured by the speed of the point it arrives at, so the colour change lands
 * where the vehicle reached that speed rather than a reading too early.
 */
function toSegments(track: TrackPoint[]): Segment[] {
  const segments: Segment[] = [];
  for (let index = 1; index < track.length; index += 1) {
    const band = getSpeedBand(track[index].speedKph);
    const previous = segments[segments.length - 1];
    if (previous && previous.band === band) {
      previous.points.push([track[index].lat, track[index].lng]);
      continue;
    }
    // Each new run starts at the previous point, so the line has no gaps.
    segments.push({ band, points: [[track[index - 1].lat, track[index - 1].lng], [track[index].lat, track[index].lng]] });
  }
  return segments;
}

/**
 * The history route: a solid line under the realtime dashed trail's rules but
 * with its own meaning. Colour here is speed, never status — the playhead
 * marker is the only thing on this map that carries the accent.
 */
export default function HistoryRoute() {
  const map = useMap();
  const { mode } = useUiPreferences();
  const track = useHistoryStore((state) => state.track);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    const layer = L.layerGroup().addTo(map);
    layerRef.current = layer;
    return () => {
      map.removeLayer(layer);
      layerRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    layer.clearLayers();
    if (track.length < 2) return;

    const tokens = fleetTokens[mode];
    const colors = speedBandColors[mode];
    const line = track.map((point) => [point.lat, point.lng] as [number, number]);

    // A casing in the map's own ground colour keeps a green route readable
    // where it crosses parkland and a red one where it crosses a motorway.
    L.polyline(line, { color: tokens.mapGround, weight: 7, opacity: 0.9, lineCap: "round", lineJoin: "round", interactive: false }).addTo(layer);
    for (const segment of toSegments(track)) {
      L.polyline(segment.points, { color: colors[segment.band], weight: 4, opacity: 1, lineCap: "round", lineJoin: "round", interactive: false }).addTo(layer);
    }

    const ends: [TrackPoint, string][] = [[track[0], tokens.text2], [track[track.length - 1], tokens.text2]];
    for (const [point, color] of ends) {
      L.circleMarker([point.lat, point.lng], { radius: 5, color, weight: 2.5, fillColor: tokens.panelSolid, fillOpacity: 1, interactive: false }).addTo(layer);
    }
  }, [mode, track]);

  return null;
}

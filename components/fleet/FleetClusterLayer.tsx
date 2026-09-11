"use client";

import L from "leaflet";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";

import { useUiPreferences } from "@/components/providers/MuiProvider";
import type { ThemeMode } from "@/lib/design-tokens";
import { getVehicleMarkerColor } from "@/lib/fleet-appearance";
import { useFleetStore } from "@/stores/use-fleet-store";
import type { FleetVehicle } from "@/types/fleet";

/** Wider cells when zoomed out keep the grid from tiling the whole map. */
const CELL_SIZE_FAR = 72;
const CELL_SIZE_NEAR = 58;
const FAR_ZOOM = 12;
/** Below this many vehicles a cell draws real arrows — three arrows say more
 *  about the fleet than a bubble reading "3". */
const CLUSTER_MIN = 4;
/** Street level: everything is individual, no matter how dense. */
const NO_CLUSTER_ZOOM = 15;

function arrowIcon(vehicle: FleetVehicle, color: string, selected: boolean) {
  const size = selected ? 20 : 12;
  const box = selected ? 44 : 16;
  const halo = selected ? '<span class="fv-marker__halo"></span>' : "";
  return L.divIcon({
    className: `fv-marker${selected ? " fv-marker--selected" : ""}`,
    iconSize: [box, box],
    iconAnchor: [box / 2, box / 2],
    html: `${halo}<svg class="fv-marker__arrow" style="--fv-color:${color};--fv-heading:${vehicle.headingDeg}deg;width:${size}px;height:${size}px" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 0 11 11 6 8.6 1 11Z"/></svg>`,
  });
}

/** An offline vehicle reports no heading, so an arrow would invent a direction. */
function dotIcon(color: string) {
  return L.divIcon({
    className: "fv-marker",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    html: `<span class="fv-marker__dot" style="--fv-color:${color}"></span>`,
  });
}

function clusterIcon(count: number, color: string) {
  const glow = Math.min(38 + count * 1.4, 82);
  return L.divIcon({
    className: "fv-cluster",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<span class="fv-cluster__glow" style="--fv-color:${color};--fv-glow:${glow}px"></span><span class="fv-cluster__count" style="--fv-color:${color}">${count}</span>`,
  });
}

/** The colour that best describes a group: the most urgent state present. */
function clusterColor(cell: FleetVehicle[], mode: ThemeMode) {
  let color = getVehicleMarkerColor(cell[0], mode);
  let rank = -1;
  for (const vehicle of cell) {
    const next = vehicle.speedKph >= 90 ? 3 : vehicle.speedKph > 0 ? 2 : vehicle.accOn ? 1 : 0;
    if (next > rank) {
      rank = next;
      color = getVehicleMarkerColor(vehicle, mode);
    }
  }
  return color;
}

/**
 * Screen-space grid clustering with marker reuse: a vehicle keeps its Leaflet
 * marker between ticks, so its position can be interpolated by CSS instead of
 * jumping every two seconds. Clearing and rebuilding the layer, as this did
 * before, makes that impossible because no element survives to transition.
 */
export default function FleetClusterLayer() {
  const map = useMap();
  const { mode } = useUiPreferences();
  const vehicles = useFleetStore((state) => state.vehicles);
  const statusFilter = useFleetStore((state) => state.statusFilter);
  const selectedVehicleId = useFleetStore((state) => state.selectedVehicleId);
  const setSelectedVehicleId = useFleetStore((state) => state.setSelectedVehicleId);

  const vehicleLayerRef = useRef<L.LayerGroup | null>(null);
  const clusterLayerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef(new Map<string, L.Marker>());
  const iconKeysRef = useRef(new Map<string, string>());
  const [viewportVersion, setViewportVersion] = useState(0);

  const deferredVehicles = useDeferredValue(vehicles);
  const filteredVehicles = useMemo(
    () => (statusFilter === "all" ? deferredVehicles : deferredVehicles.filter((vehicle) => vehicle.status === statusFilter)),
    [deferredVehicles, statusFilter],
  );

  useMapEvents({
    moveend: () => setViewportVersion((version) => version + 1),
    zoomend: () => setViewportVersion((version) => version + 1),
  });

  useEffect(() => {
    const vehicleLayer = L.layerGroup().addTo(map);
    const clusterLayer = L.layerGroup().addTo(map);
    vehicleLayerRef.current = vehicleLayer;
    clusterLayerRef.current = clusterLayer;
    const markers = markersRef.current;
    const iconKeys = iconKeysRef.current;

    return () => {
      vehicleLayer.clearLayers();
      clusterLayer.clearLayers();
      map.removeLayer(vehicleLayer);
      map.removeLayer(clusterLayer);
      markers.clear();
      iconKeys.clear();
      vehicleLayerRef.current = null;
      clusterLayerRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const vehicleLayer = vehicleLayerRef.current;
    const clusterLayer = clusterLayerRef.current;
    if (!vehicleLayer || !clusterLayer) return;

    const bounds = map.getBounds().pad(0.08);
    const zoom = map.getZoom();
    const cellSize = zoom <= FAR_ZOOM ? CELL_SIZE_FAR : CELL_SIZE_NEAR;
    const clustering = zoom < NO_CLUSTER_ZOOM;

    const cells = new Map<string, FleetVehicle[]>();
    for (const vehicle of filteredVehicles) {
      const position: [number, number] = [vehicle.lat, vehicle.lng];
      if (!bounds.contains(position)) continue;
      // The selected vehicle is never folded into a bubble: the whole point of
      // selecting it is to watch that one, and a cluster would hide it.
      let key = vehicle.id;
      if (clustering && vehicle.id !== selectedVehicleId) {
        const point = map.project(position, zoom);
        key = `${Math.floor(point.x / cellSize)}:${Math.floor(point.y / cellSize)}`;
      }
      const cell = cells.get(key);
      if (cell) cell.push(vehicle);
      else cells.set(key, [vehicle]);
    }

    const markers = markersRef.current;
    const iconKeys = iconKeysRef.current;
    const liveIds = new Set<string>();

    clusterLayer.clearLayers();

    for (const cell of cells.values()) {
      if (clustering && cell.length >= CLUSTER_MIN) {
        const lat = cell.reduce((total, vehicle) => total + vehicle.lat, 0) / cell.length;
        const lng = cell.reduce((total, vehicle) => total + vehicle.lng, 0) / cell.length;
        const position: [number, number] = [lat, lng];
        L.marker(position, { icon: clusterIcon(cell.length, clusterColor(cell, mode)), keyboard: true, title: `${cell.length}` })
          .on("click", () => {
            map.stop();
            map.setView(position, Math.min(zoom + 2, 18), { animate: true, duration: 0.25 });
          })
          .addTo(clusterLayer);
        continue;
      }

      for (const vehicle of cell) {
        liveIds.add(vehicle.id);
        const selected = vehicle.id === selectedVehicleId;
        const color = getVehicleMarkerColor(vehicle, mode);
        const offline = vehicle.status === "offline";
        // Rebuilding the icon on every tick would throw away the DOM node the
        // transition runs on, so only do it when something visible changed.
        const iconKey = offline ? `dot:${color}` : `arrow:${color}:${vehicle.headingDeg}:${selected}`;

        let marker = markers.get(vehicle.id);
        if (!marker) {
          marker = L.marker([vehicle.lat, vehicle.lng], {
            icon: offline ? dotIcon(color) : arrowIcon(vehicle, color, selected),
            keyboard: true,
            title: `${vehicle.code} · ${vehicle.label}`,
          });
          marker.on("click", () => setSelectedVehicleId(vehicle.id));
          marker.addTo(vehicleLayer);
          markers.set(vehicle.id, marker);
          iconKeys.set(vehicle.id, iconKey);
          // Added on the next frame so the marker does not slide in from its
          // pre-placement position the first time it appears.
          const element = marker.getElement();
          if (element) window.requestAnimationFrame(() => element.classList.add("fv-animated"));
          continue;
        }

        if (!vehicleLayer.hasLayer(marker)) marker.addTo(vehicleLayer);
        const current = marker.getLatLng();
        if (current.lat !== vehicle.lat || current.lng !== vehicle.lng) marker.setLatLng([vehicle.lat, vehicle.lng]);
        if (iconKeys.get(vehicle.id) !== iconKey) {
          marker.setIcon(offline ? dotIcon(color) : arrowIcon(vehicle, color, selected));
          iconKeys.set(vehicle.id, iconKey);
          marker.getElement()?.classList.add("fv-animated");
        }
      }
    }

    for (const [id, marker] of markers) {
      if (liveIds.has(id)) continue;
      vehicleLayer.removeLayer(marker);
      markers.delete(id);
      iconKeys.delete(id);
    }
  }, [filteredVehicles, map, mode, selectedVehicleId, setSelectedVehicleId, viewportVersion]);

  return null;
}

"use client";

import L from "leaflet";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";

import { getVehicleMarkerColor, vehicleMarkerColors } from "@/lib/fleet-appearance";
import { useFleetStore } from "@/stores/use-fleet-store";
import type { FleetVehicle } from "@/types/fleet";

const CLUSTER_CELL_SIZE = 58;

function vehicleIcon(vehicle: FleetVehicle, selected: boolean) {
  const color = getVehicleMarkerColor(vehicle);
  return L.divIcon({
    className: "fleet-vehicle-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<span class="fleet-vehicle-marker__body${selected ? " fleet-vehicle-marker__body--selected" : ""}" style="--vehicle-color: ${color}; --heading-deg: ${vehicle.headingDeg}deg"><svg viewBox="0 0 24 28" aria-hidden="true"><path d="M12 2 22 25 12 20 2 25Z" /></svg></span>`,
  });
}

function clusterIcon(vehicles: FleetVehicle[]) {
  const counts = new Map<string, number>();
  for (const vehicle of vehicles) {
    const color = getVehicleMarkerColor(vehicle);
    counts.set(color, (counts.get(color) ?? 0) + 1);
  }

  let offset = 0;
  const segments = Object.values(vehicleMarkerColors).flatMap((color) => {
    const count = counts.get(color) ?? 0;
    if (!count) return [];
    const end = offset + (count / vehicles.length) * 100;
    const segment = `${color} ${offset}% ${end}%`;
    offset = end;
    return [segment];
  });

  return L.divIcon({
    className: "fleet-cluster",
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    html: `<span class="fleet-cluster__ring" style="--cluster-pie: conic-gradient(${segments.join(",")})"><strong>${vehicles.length}</strong></span>`,
  });
}

/**
 * Clusters the 1,000 demo records in screen-sized grid cells. Unlike the
 * legacy markercluster plugin, this has no global Leaflet side effects, so it
 * is compatible with Turbopack while keeping only visible map markers mounted.
 */
export default function FleetClusterLayer() {
  const map = useMap();
  const vehicles = useFleetStore((state) => state.vehicles);
  const statusFilter = useFleetStore((state) => state.statusFilter);
  const selectedVehicleId = useFleetStore((state) => state.selectedVehicleId);
  const setSelectedVehicleId = useFleetStore((state) => state.setSelectedVehicleId);
  const setDetailsOpen = useFleetStore((state) => state.setDetailsOpen);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [viewportVersion, setViewportVersion] = useState(0);
  const deferredVehicles = useDeferredValue(vehicles);
  const filteredVehicles = useMemo(() => statusFilter === "all" ? deferredVehicles : deferredVehicles.filter((vehicle) => vehicle.status === statusFilter), [deferredVehicles, statusFilter]);

  useMapEvents({
    moveend: () => setViewportVersion((version) => version + 1),
    click: () => setDetailsOpen(true),
  });

  useEffect(() => {
    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;

    return () => {
      layerGroup.clearLayers();
      map.removeLayer(layerGroup);
      layerGroupRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const layerGroup = layerGroupRef.current;
    if (!layerGroup) return;

    const bounds = map.getBounds().pad(0.08);
    const zoom = map.getZoom();
    const cells = new Map<string, FleetVehicle[]>();

    for (const vehicle of filteredVehicles) {
      const position: [number, number] = [vehicle.lat, vehicle.lng];
      if (!bounds.contains(position)) continue;

      const point = map.project(position, zoom);
      const key = `${Math.floor(point.x / CLUSTER_CELL_SIZE)}:${Math.floor(point.y / CLUSTER_CELL_SIZE)}`;
      const cell = cells.get(key);
      if (cell) cell.push(vehicle);
      else cells.set(key, [vehicle]);
    }

    layerGroup.clearLayers();

    for (const cell of cells.values()) {
      const lat = cell.reduce((total, vehicle) => total + vehicle.lat, 0) / cell.length;
      const lng = cell.reduce((total, vehicle) => total + vehicle.lng, 0) / cell.length;
      const position: [number, number] = [lat, lng];

      if (cell.length === 1) {
        const vehicle = cell[0];
        L.marker(position, {
          icon: vehicleIcon(vehicle, vehicle.id === selectedVehicleId),
          keyboard: true,
          title: `${vehicle.code} · ${vehicle.label}`,
        }).on("click", () => setSelectedVehicleId(vehicle.id)).addTo(layerGroup);
      } else {
        L.marker(position, { icon: clusterIcon(cell), keyboard: true, title: `${cell.length} simulated vehicles` })
          .on("click", () => {
            setDetailsOpen(true);
            map.stop();
            map.setView(position, Math.min(zoom + 2, 18), { animate: true, duration: 0.25 });
          })
          .addTo(layerGroup);
      }
    }
  }, [filteredVehicles, map, selectedVehicleId, setDetailsOpen, setSelectedVehicleId, viewportVersion]);

  return null;
}

"use client";

import { useEffect, useRef } from "react";
import { MapContainer, useMap } from "react-leaflet";

import FleetClusterLayer from "@/components/fleet/FleetClusterLayer";
import VehicleTrail from "@/components/fleet/VehicleTrail";
import MapTileLayer from "@/components/map/MapTileLayer";
import { useFleetStore } from "@/stores/use-fleet-store";

import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [13.7563, 100.5318];

function MapFocus() {
  const map = useMap();
  const vehicles = useFleetStore((state) => state.vehicles);
  const selectedVehicleId = useFleetStore((state) => state.selectedVehicleId);
  const previousSelectedVehicleId = useRef(selectedVehicleId);

  useEffect(() => {
    if (selectedVehicleId === previousSelectedVehicleId.current) return;
    previousSelectedVehicleId.current = selectedVehicleId;

    const vehicle = vehicles.find((item) => item.id === selectedVehicleId);
    if (!vehicle) return;

    map.stop();
    map.setView([vehicle.lat, vehicle.lng], Math.max(map.getZoom(), 15), { animate: true, duration: 0.35, easeLinearity: 0.35, noMoveStart: true });
  }, [map, selectedVehicleId, vehicles]);

  return null;
}

export default function FleetMap() {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={11}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom
      // The floating panels own the corners, so Leaflet's own controls move to
      // a corner nothing else claims.
      zoomControl={false}
    >
      <MapTileLayer />
      <FleetClusterLayer />
      <VehicleTrail />
      <MapFocus />
    </MapContainer>
  );
}

"use client";

import { MapContainer } from "react-leaflet";

import MapFlyTo from "@/components/map/MapFlyTo";
import MapClickCapture from "@/components/map/MapClickCapture";
import MapTileLayer from "@/components/map/MapTileLayer";
import BulkMarkerClusterLayer from "@/components/map/BulkMarkerClusterLayer";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

const DEFAULT_CENTER: [number, number] = [13.7563, 100.5018];
const DEFAULT_ZOOM = 11;

export default function ClusterMap() {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom
    >
      <MapTileLayer />
      <BulkMarkerClusterLayer />
      <MapFlyTo />
      <MapClickCapture />
    </MapContainer>
  );
}

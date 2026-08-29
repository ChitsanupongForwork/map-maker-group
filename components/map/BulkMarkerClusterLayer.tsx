"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

import { useLocationStore } from "@/stores/use-location-store";

import "leaflet.markercluster";

function pinIcon(color: string, selected: boolean) {
  return L.divIcon({
    className: "pin-marker",
    iconSize: [30, 38],
    iconAnchor: [15, 36],
    html: `<span class="pin-marker__shape${selected ? " pin-marker__shape--selected" : ""}" style="--pin-color: ${color}"><i></i></span>`,
  });
}

export default function BulkMarkerClusterLayer() {
  const map = useMap();
  const locations = useLocationStore((state) => state.locations);
  const selectedId = useLocationStore((state) => state.selectedId);
  const setSelectedId = useLocationStore((state) => state.setSelectedId);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const isReadyRef = useRef(false);

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 200,
      chunkDelay: 50,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      removeOutsideVisibleBounds: true,
      iconCreateFunction: (markerCluster) =>
        L.divIcon({
          className: "pin-cluster",
          iconSize: [44, 44],
          iconAnchor: [22, 22],
          html: `<span>${markerCluster.getChildCount()}</span>`,
        }),
    });

    clusterRef.current = cluster;
    map.addLayer(cluster);
    isReadyRef.current = true;

    return () => {
      isReadyRef.current = false;
      map.removeLayer(cluster);
      cluster.clearLayers();
      clusterRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster || !isReadyRef.current) {
      return;
    }

    cluster.clearLayers();

    const markers = locations.map((location) => {
      const marker = L.marker([location.lat, location.lng], {
        icon: pinIcon(location.color, location.id === selectedId),
      });
      marker.on("click", () => setSelectedId(location.id));
      return marker;
    });

    cluster.addLayers(markers);
  }, [locations, selectedId, setSelectedId]);

  return null;
}

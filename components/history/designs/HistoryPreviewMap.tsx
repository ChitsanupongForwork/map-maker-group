"use client";

import { useEffect } from "react";
import { CircleMarker, MapContainer, Polyline, Tooltip, useMap, ZoomControl } from "react-leaflet";
import MapTileLayer from "@/components/map/MapTileLayer";
import { demoRoute, speedColor, timeLabel } from "./demo-route";
import "leaflet/dist/leaflet.css";

function ResizeMap() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export default function HistoryPreviewMap({ cursor }: { cursor: number }) {
  const index = Math.min(Math.floor(cursor / 10), demoRoute.length - 1);
  const current = demoRoute[index];
  const next = demoRoute[Math.min(index + 1, demoRoute.length - 1)];
  const fraction = (cursor % 10) / 10;
  const position: [number, number] = current.position.map((value, axis) => value + (next.position[axis] - value) * fraction) as [number, number];
  return <MapContainer bounds={[[13.739,100.513],[13.780,100.565]]} zoomControl={false} style={{ height: "100%", width: "100%" }}>
    <MapTileLayer /><ResizeMap /><ZoomControl position="topright" />
    <Polyline positions={demoRoute.map(point => point.position)} pathOptions={{ color: "#FFFFFF", weight: 10, opacity: 0.9 }} />
    {demoRoute.slice(1).map((point, i) => <Polyline key={i} positions={[demoRoute[i].position, point.position]} pathOptions={{ color: speedColor(demoRoute[i].speed), weight: 6, opacity: 0.95 }}><Tooltip>{demoRoute[i].speed} km/h · {timeLabel(demoRoute[i].seconds)}</Tooltip></Polyline>)}
    <Polyline positions={[...demoRoute.slice(0, index + 1).map(point => point.position), position]} pathOptions={{ color: "#202A38", weight: 2, dashArray: "3 7" }} />
    {[0, demoRoute.length - 1].map((i) => <CircleMarker key={i} center={demoRoute[i].position} radius={7} pathOptions={{ color: "#202A38", fillColor: "#FFFFFF", fillOpacity: 1, weight: 2 }}><Tooltip permanent direction="right">{i === 0 ? "A · เริ่มต้น" : "B · สิ้นสุด"}</Tooltip></CircleMarker>)}
    <CircleMarker center={position} radius={13} pathOptions={{ color: "#FFFFFF", weight: 4, fillColor: "#C2410C", fillOpacity: 1 }}><Tooltip permanent direction="top" offset={[0,-14]}>รถตัวอย่าง 01 · {current.speed} km/h</Tooltip></CircleMarker>
  </MapContainer>;
}

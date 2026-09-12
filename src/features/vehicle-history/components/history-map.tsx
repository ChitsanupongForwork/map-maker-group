"use client";

import {
  GeoJSONSource,
  LngLatBounds,
  Map as MapLibreMap,
  ScaleControl,
  setWorkerUrl,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Layers, Maximize2, Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadMapStyle, type Basemap } from "@/features/fleet-map";
import { cn } from "@/shared/lib/cn";
import { IconButton } from "@/shared/ui/button";
import type { HistoryPoint } from "../types";
import { pointAtProgress } from "../lib/mock-history";

setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

const SOURCE_ROUTE = "history-route";
const SOURCE_TRAVELLED = "history-travelled";
const SOURCE_ENDPOINTS = "history-endpoints";
const SOURCE_VEHICLE = "history-vehicle";

function lineData(points: HistoryPoint[]): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  return {
    type: "FeatureCollection",
    features: points.length < 2 ? [] : [{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: points.map((point) => [point.lng, point.lat]) } }],
  };
}

function pointData(point: HistoryPoint | null): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: point ? [{ type: "Feature", properties: { heading: point.headingDeg }, geometry: { type: "Point", coordinates: [point.lng, point.lat] } }] : [],
  };
}

export function HistoryMap({ className, points, progress }: { className?: string; points: HistoryPoint[]; progress: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const pointsRef = useRef(points);
  const progressRef = useRef(progress);
  const [ready, setReady] = useState(false);
  const [basemap, setBasemap] = useState<Basemap>("map");

  useEffect(() => { pointsRef.current = points; }, [points]);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  const installOverlay = useCallback((map: MapLibreMap) => {
    const route = pointsRef.current;
    const current = pointAtProgress(route, progressRef.current);
    const travelledCount = Math.max(2, Math.ceil(progressRef.current * Math.max(1, route.length - 1)) + 1);
    const travelled = route.slice(0, travelledCount);
    if (current && travelled.length) travelled[travelled.length - 1] = current;

    if (!map.getSource(SOURCE_ROUTE)) map.addSource(SOURCE_ROUTE, { type: "geojson", data: lineData(route) });
    if (!map.getSource(SOURCE_TRAVELLED)) map.addSource(SOURCE_TRAVELLED, { type: "geojson", data: lineData(travelled) });
    if (!map.getSource(SOURCE_ENDPOINTS)) {
      map.addSource(SOURCE_ENDPOINTS, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: route.length ? [
            { type: "Feature", properties: { label: "A", kind: "start" }, geometry: { type: "Point", coordinates: [route[0].lng, route[0].lat] } },
            { type: "Feature", properties: { label: "B", kind: "end" }, geometry: { type: "Point", coordinates: [route.at(-1)!.lng, route.at(-1)!.lat] } },
          ] : [],
        },
      });
    }
    if (!map.getSource(SOURCE_VEHICLE)) map.addSource(SOURCE_VEHICLE, { type: "geojson", data: pointData(current) });

    if (!map.getLayer("history-route-shadow")) map.addLayer({ id: "history-route-shadow", type: "line", source: SOURCE_ROUTE, paint: { "line-color": "#030508", "line-width": 8, "line-opacity": 0.72 } });
    if (!map.getLayer("history-route-line")) map.addLayer({ id: "history-route-line", type: "line", source: SOURCE_ROUTE, paint: { "line-color": "#667384", "line-width": 4, "line-opacity": 0.72, "line-dasharray": [1.5, 1.2] } });
    if (!map.getLayer("history-travelled-glow")) map.addLayer({ id: "history-travelled-glow", type: "line", source: SOURCE_TRAVELLED, paint: { "line-color": "#ff7a1a", "line-width": 10, "line-opacity": 0.18, "line-blur": 4 } });
    if (!map.getLayer("history-travelled-line")) map.addLayer({ id: "history-travelled-line", type: "line", source: SOURCE_TRAVELLED, paint: { "line-color": "#ff7a1a", "line-width": 4, "line-opacity": 1 } });
    if (!map.getLayer("history-endpoints")) map.addLayer({ id: "history-endpoints", type: "circle", source: SOURCE_ENDPOINTS, paint: { "circle-radius": 12, "circle-color": ["match", ["get", "kind"], "start", "#22c55e", "#ef4444"], "circle-stroke-color": "#f8fafc", "circle-stroke-width": 2 } });
    if (!map.getLayer("history-endpoint-labels")) map.addLayer({ id: "history-endpoint-labels", type: "symbol", source: SOURCE_ENDPOINTS, layout: { "text-field": ["get", "label"], "text-size": 11, "text-font": ["Noto Sans Regular"] }, paint: { "text-color": "#07100b" } });
    if (!map.getLayer("history-vehicle-glow")) map.addLayer({ id: "history-vehicle-glow", type: "circle", source: SOURCE_VEHICLE, paint: { "circle-radius": 16, "circle-color": "rgba(255,122,26,0.22)", "circle-blur": 0.35 } });
    if (!map.getLayer("history-vehicle")) map.addLayer({ id: "history-vehicle", type: "circle", source: SOURCE_VEHICLE, paint: { "circle-radius": 7, "circle-color": "#ff7a1a", "circle-stroke-color": "#fff4ea", "circle-stroke-width": 3 } });
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let disposed = false;
    void loadMapStyle("map").then((style) => {
      if (disposed || !containerRef.current) return;
      const map = new MapLibreMap({ container: containerRef.current, style, center: [100.565, 13.775], zoom: 12, minZoom: 4, maxZoom: 18, attributionControl: { compact: true }, dragRotate: false, pitchWithRotate: false, fadeDuration: 120 });
      mapRef.current = map;
      map.touchZoomRotate.disableRotation();
      map.addControl(new ScaleControl({ maxWidth: 96, unit: "metric" }), "bottom-left");
      map.on("load", () => { installOverlay(map); setReady(true); });
      map.on("styledata", () => { if (map.isStyleLoaded()) installOverlay(map); });
    });
    return () => { disposed = true; mapRef.current?.remove(); mapRef.current = null; };
  }, [installOverlay]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => mapRef.current?.resize());
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const fitRoute = useCallback(() => {
    const map = mapRef.current;
    const route = pointsRef.current;
    if (!map || route.length < 2) return;
    const bounds = new LngLatBounds([route[0].lng, route[0].lat], [route[0].lng, route[0].lat]);
    route.forEach((point) => bounds.extend([point.lng, point.lat]));
    map.fitBounds(bounds, { padding: { top: 70, right: 70, bottom: 150, left: 70 }, maxZoom: 15, duration: 650 });
  }, []);

  useEffect(() => { if (ready) fitRoute(); }, [ready, points, fitRoute]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const current = pointAtProgress(points, progress);
    const count = Math.max(2, Math.ceil(progress * Math.max(1, points.length - 1)) + 1);
    const travelled = points.slice(0, count);
    if (current && travelled.length) travelled[travelled.length - 1] = current;
    (map.getSource(SOURCE_ROUTE) as GeoJSONSource | undefined)?.setData(lineData(points));
    (map.getSource(SOURCE_TRAVELLED) as GeoJSONSource | undefined)?.setData(lineData(travelled));
    (map.getSource(SOURCE_VEHICLE) as GeoJSONSource | undefined)?.setData(pointData(current));
    (map.getSource(SOURCE_ENDPOINTS) as GeoJSONSource | undefined)?.setData({ type: "FeatureCollection", features: points.length ? [
      { type: "Feature", properties: { label: "A", kind: "start" }, geometry: { type: "Point", coordinates: [points[0].lng, points[0].lat] } },
      { type: "Feature", properties: { label: "B", kind: "end" }, geometry: { type: "Point", coordinates: [points.at(-1)!.lng, points.at(-1)!.lat] } },
    ] : [] });
  }, [points, progress, ready]);

  const changeBasemap = (value: Basemap) => {
    setBasemap(value);
    const map = mapRef.current;
    if (!map) return;
    void loadMapStyle(value).then((style) => mapRef.current === map && map.setStyle(style));
  };

  return (
    <div className={cn("relative", className)}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
      <div className="pointer-events-auto absolute top-3 left-3 z-10 flex rounded-[10px] border border-line bg-surface-2/88 p-1 backdrop-blur">
        {(["map", "satellite"] as const).map((item) => (
          <button key={item} type="button" onClick={() => changeBasemap(item)} className={cn("flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 text-[12px] font-medium transition-colors", basemap === item ? "bg-surface-3 text-content" : "text-dim hover:text-content")}>
            {item === "map" ? <Layers className="size-3.5" /> : null}{item === "map" ? "Map" : "Satellite"}
          </button>
        ))}
      </div>
      <div className="pointer-events-auto absolute top-3 right-3 z-10 flex flex-col gap-2">
        <div className="flex flex-col overflow-hidden rounded-[10px] border border-line bg-surface-2/88 backdrop-blur">
          <button type="button" aria-label="ซูมเข้า" onClick={() => mapRef.current?.zoomIn()} className="grid size-9 cursor-pointer place-items-center text-muted hover:bg-surface-3 hover:text-content"><Plus className="size-4" /></button>
          <span className="h-px bg-line" />
          <button type="button" aria-label="ซูมออก" onClick={() => mapRef.current?.zoomOut()} className="grid size-9 cursor-pointer place-items-center text-muted hover:bg-surface-3 hover:text-content"><Minus className="size-4" /></button>
        </div>
        <IconButton label="แสดงเส้นทางทั้งหมด" onClick={fitRoute}><Maximize2 className="size-4" /></IconButton>
      </div>
      <div className="pointer-events-none absolute top-16 left-3 z-10 flex flex-col gap-1.5 rounded-[10px] border border-line bg-[rgba(11,16,23,0.86)] px-3 py-2 text-[11px] backdrop-blur">
        <span className="flex items-center gap-2 text-muted"><i className="size-2 rounded-full bg-running ring-2 ring-white/70" /> จุดเริ่มต้น A</span>
        <span className="flex items-center gap-2 text-muted"><i className="size-2 rounded-full bg-danger ring-2 ring-white/70" /> จุดสิ้นสุด B</span>
      </div>
    </div>
  );
}

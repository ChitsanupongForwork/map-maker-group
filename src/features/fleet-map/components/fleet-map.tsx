"use client";

import {
  LngLatBounds,
  MapLibreMap,
  ScaleControl,
  setWorkerUrl,
  type GeoJSONSource,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { useFleet, useFleetActions, type Vehicle } from "@/features/fleet";
import {
  LAYER_CLUSTER,
  LAYER_CLUSTER_COUNT,
  LAYER_CLUSTER_GLOW,
  LAYER_SELECTED,
  LAYER_VEHICLES,
  SOURCE_SELECTED,
  SOURCE_VEHICLES,
  selectedLayers,
  vehicleLayers,
} from "../lib/layers";
import { loadMapStyle, type Basemap } from "../lib/map-style";
import { registerMarkerSprites } from "../lib/marker-sprites";
import { toSingleCollection, toVehicleCollection } from "../lib/to-geojson";
import { MapControls } from "./map-controls";
import { MapLegend } from "./map-legend";
import { VehicleCallout } from "./vehicle-callout";

const CLUSTER_LAYERS = [LAYER_CLUSTER_GLOW, LAYER_CLUSTER, LAYER_CLUSTER_COUNT];

/** ระยะที่ยกป้ายข้อมูลขึ้นเหนือหัวลูกศร (พิกเซล) */
const CALLOUT_GAP = 22;

// MapLibre เดา URL ของ worker จาก import.meta.url ซึ่งหลัง bundle จะชี้ผิดที่
// ไฟล์จริงถูก copy ไว้ที่ public/maplibre โดย scripts/sync-maplibre-worker.mjs
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

export function FleetMap({ className }: { className?: string }) {
  const { view, selected, selectedId } = useFleet();
  const { select } = useFleetActions();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const calloutRef = useRef<HTMLDivElement>(null);

  const [ready, setReady] = useState(false);
  const [basemap, setBasemap] = useState<Basemap>("map");
  const [clustered, setClustered] = useState(true);

  // ค่าล่าสุดเก็บใน ref เพื่อให้ callback ของแผนที่อ่านได้โดยไม่ต้องผูกใหม่ทุกเฟรม
  const vehiclesRef = useRef(view.vehicles);
  const selectedRef = useRef<Vehicle | null>(selected);
  const clusteredRef = useRef(clustered);
  // ประกาศไว้เป็น effect แรกสุด เพื่อให้ ref ถูกอัปเดตก่อน effect อื่นในรอบเดียวกัน
  useEffect(() => {
    vehiclesRef.current = view.vehicles;
    selectedRef.current = selected;
    clusteredRef.current = clustered;
  });

  /** ติดตั้ง source + layer ของกองรถ (เรียกซ้ำได้ทุกครั้งที่สไตล์ถูกโหลดใหม่) */
  const installOverlay = useCallback((map: MapLibreMap) => {
    registerMarkerSprites(map);

    if (!map.getSource(SOURCE_VEHICLES)) {
      map.addSource(SOURCE_VEHICLES, {
        type: "geojson",
        data: toVehicleCollection(vehiclesRef.current),
        cluster: clusteredRef.current,
        clusterRadius: 54,
        clusterMaxZoom: 15,
        // ข้อมูลอัปเดตทุกไม่กี่วินาที การคำนวณคลัสเตอร์จึงต้องเบาไว้ก่อน
        clusterMinPoints: 2,
      });
    }
    if (!map.getSource(SOURCE_SELECTED)) {
      map.addSource(SOURCE_SELECTED, {
        type: "geojson",
        data: toSingleCollection(selectedRef.current),
      });
    }

    for (const layer of vehicleLayers()) {
      if (!map.getLayer(layer.id)) map.addLayer(layer);
    }
    for (const layer of selectedLayers()) {
      if (!map.getLayer(layer.id)) map.addLayer(layer);
    }
  }, []);

  /** ผูก event ของแผนที่: เลือกคัน กางคลัสเตอร์ และติดตั้ง overlay กลับหลังเปลี่ยนสไตล์ */
  const attachHandlers = useCallback(
    (map: MapLibreMap) => {
      /**
       * ใช้ "style.load" ไม่ใช่ "load"
       *
       * "load" รอจนทุก source ในสไตล์โหลดเสร็จ ซึ่งสไตล์ของ OpenFreeMap มี
       * ชั้น natural-earth ที่บางครั้งโหลดไม่ครบ → event ไม่ยิง → หมุดไม่ขึ้นทั้งจอ
       * ส่วน "style.load" ยิงทันทีที่สไตล์ถูก parse เสร็จ (เพิ่ม source/layer ได้แล้ว)
       * และยิงซ้ำทุกครั้งที่ setStyle ซึ่งพอดีกับจังหวะที่ต้องติดตั้ง overlay กลับ
       */
      map.on("style.load", () => {
        installOverlay(map);
        setReady(true);
      });

      // ปัญหาของแผนที่ (ไทล์โหลดไม่ได้, สไตล์เพี้ยน) เงียบมากถ้าไม่ดักไว้เอง
      map.on("error", (event) => {
        console.error("[map]", event.error?.message ?? event);
      });

      const pointer = (value: string) => () => {
        map.getCanvas().style.cursor = value;
      };
      for (const layer of [...CLUSTER_LAYERS, LAYER_VEHICLES]) {
        map.on("mouseenter", layer, pointer("pointer"));
        map.on("mouseleave", layer, pointer(""));
      }

      map.on("click", LAYER_VEHICLES, (event) => {
        const id = event.features?.[0]?.properties?.id;
        if (typeof id === "string") select(id);
      });

      map.on("click", LAYER_CLUSTER, async (event) => {
        const feature = event.features?.[0];
        const clusterId = feature?.properties?.cluster_id;
        if (typeof clusterId !== "number" || !feature) return;
        const source = map.getSource(SOURCE_VEHICLES) as GeoJSONSource | undefined;
        if (!source) return;
        const zoom = await source.getClusterExpansionZoom(clusterId);
        map.easeTo({
          center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
          zoom: Math.min(17, zoom + 0.4),
          duration: 480,
        });
      });

      // คลิกที่ว่างบนแผนที่ = ยกเลิกการเลือก
      map.on("click", (event) => {
        const hits = map.queryRenderedFeatures(event.point, {
          layers: [LAYER_VEHICLES, LAYER_CLUSTER, LAYER_SELECTED],
        });
        if (hits.length === 0) select(null);
      });
    },
    [installOverlay, select],
  );

  /* ── สร้างแผนที่ครั้งเดียวตลอดอายุคอมโพเนนต์ ───────────────────────── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let disposed = false;

    // สไตล์ต้องโหลดมาก่อน เพราะเราแก้สีของมันให้เข้าธีมก่อนส่งให้ MapLibre
    void loadMapStyle("map").then((style) => {
      if (disposed || !containerRef.current || mapRef.current) return;

      const map = new MapLibreMap({
        container: containerRef.current,
        style,
        center: [site.defaultCenter.lng, site.defaultCenter.lat],
        zoom: site.defaultZoom,
        minZoom: 4,
        maxZoom: 18,
        attributionControl: { compact: true },
        // ปิดลูกเล่นที่กินแรงวาดโดยไม่จำเป็นกับงานติดตามรถ
        pitchWithRotate: false,
        dragRotate: false,
        fadeDuration: 120,
      });
      mapRef.current = map;
      map.touchZoomRotate.disableRotation();
      map.addControl(new ScaleControl({ maxWidth: 96, unit: "metric" }), "bottom-left");
      attachHandlers(map);
    });

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [attachHandlers]);

  /* ── สลับแผนที่ปกติ / ดาวเทียม ─────────────────────────────────────── */
  const appliedBasemap = useRef(basemap);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || appliedBasemap.current === basemap) return;
    appliedBasemap.current = basemap;
    void loadMapStyle(basemap).then((style) => {
      if (mapRef.current === map) map.setStyle(style);
    });
  }, [basemap, ready]);

  /* ── เปิด/ปิดการรวมกลุ่มหมุด ───────────────────────────────────────── */
  const appliedCluster = useRef(clustered);
  useEffect(() => {
    const map = mapRef.current;
    // ค่า cluster เปลี่ยนได้เฉพาะตอนผู้ใช้กดปุ่ม — ตอนติดตั้งครั้งแรก
    // installOverlay สร้าง source ให้ถูกต้องอยู่แล้ว ไม่ต้องรื้อทำใหม่
    if (!map || !ready || appliedCluster.current === clustered) return;
    appliedCluster.current = clustered;

    for (const id of [...CLUSTER_LAYERS, LAYER_VEHICLES]) {
      if (map.getLayer(id)) map.removeLayer(id);
    }
    if (map.getSource(SOURCE_VEHICLES)) map.removeSource(SOURCE_VEHICLES);

    map.addSource(SOURCE_VEHICLES, {
      type: "geojson",
      data: toVehicleCollection(vehiclesRef.current),
      cluster: clustered,
      clusterRadius: 54,
      clusterMaxZoom: 15,
      clusterMinPoints: 2,
    });
    for (const layer of vehicleLayers()) map.addLayer(layer, LAYER_SELECTED);
  }, [clustered, ready]);

  /* ── ส่งข้อมูลใหม่เข้าแผนที่: setData อย่างเดียว ไม่แตะ DOM ─────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const source = map.getSource(SOURCE_VEHICLES) as GeoJSONSource | undefined;
    source?.setData(toVehicleCollection(view.vehicles));
  }, [view.vehicles, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const source = map.getSource(SOURCE_SELECTED) as GeoJSONSource | undefined;
    source?.setData(toSingleCollection(selected));
  }, [selected, ready]);

  /* ── เลื่อนแผนที่ไปหารถ เฉพาะตอน "เปลี่ยนคัน" ไม่ใช่ทุกครั้งที่รถขยับ ── */
  const flownTo = useRef<string | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !selected) {
      flownTo.current = selectedId;
      return;
    }
    if (flownTo.current === selected.id) return;
    flownTo.current = selected.id;
    map.easeTo({
      center: [selected.lng, selected.lat],
      zoom: Math.max(map.getZoom(), 13),
      duration: 700,
      essential: true,
    });
  }, [selected, selectedId, ready]);

  /* ── ป้ายลอยเหนือรถที่เลือก: ขยับด้วย transform ตรง ๆ ไม่ผ่าน React ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const place = () => {
      const node = calloutRef.current;
      const vehicle = selectedRef.current;
      if (!node) return;
      if (!vehicle) {
        node.style.opacity = "0";
        return;
      }
      const point = map.project([vehicle.lng, vehicle.lat]);
      // ยกป้ายขึ้นเหนือหัวลูกศรและจัดกึ่งกลางในทรานส์ฟอร์มเดียว
      // (ไม่พึ่ง utility class เพราะตำแหน่งนี้ต้องตรงเป๊ะทุกเฟรมที่แผนที่ขยับ)
      node.style.transform =
        `translate3d(${Math.round(point.x)}px, ${Math.round(point.y) - CALLOUT_GAP}px, 0)` +
        " translate(-50%, -100%)";
      node.style.opacity = "1";
    };

    place();
    map.on("move", place);
    map.on("resize", place);
    return () => {
      map.off("move", place);
      map.off("resize", place);
    };
  }, [ready, selected]);

  const zoomBy = useCallback((delta: number) => {
    mapRef.current?.easeTo({ zoom: (mapRef.current?.getZoom() ?? 0) + delta, duration: 220 });
  }, []);

  const recenter = useCallback(() => {
    mapRef.current?.easeTo({
      center: [site.defaultCenter.lng, site.defaultCenter.lat],
      zoom: site.defaultZoom,
      duration: 650,
    });
  }, []);

  const fitToFleet = useCallback(() => {
    const map = mapRef.current;
    const vehicles = vehiclesRef.current;
    if (!map || vehicles.length === 0) return;
    const bounds = new LngLatBounds(
      [vehicles[0].lng, vehicles[0].lat],
      [vehicles[0].lng, vehicles[0].lat],
    );
    for (const vehicle of vehicles) bounds.extend([vehicle.lng, vehicle.lat]);
    map.fitBounds(bounds, { padding: 72, duration: 700, maxZoom: 15 });
  }, []);

  return (
    <div className={className}>
      {/* MapLibre ใส่คลาส .maplibregl-map ที่บังคับ position: relative ทับคลาสของ
          Tailwind ตำแหน่งจึงต้องกำหนดเป็น inline style ไม่งั้นกล่องจะสูง 0 */}
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />

      <div
        ref={calloutRef}
        className="pointer-events-none absolute top-0 left-0 z-20 opacity-0 transition-opacity duration-150 will-change-transform"
      >
        {selected ? <VehicleCallout vehicle={selected} /> : null}
      </div>

      <MapControls
        basemap={basemap}
        onBasemapChange={setBasemap}
        clustered={clustered}
        onClusteredChange={setClustered}
        onZoomIn={() => zoomBy(1)}
        onZoomOut={() => zoomBy(-1)}
        onRecenter={recenter}
        onFitFleet={fitToFleet}
      />
      <MapLegend />
      <div className="pointer-events-auto absolute bottom-11 left-3 z-10 hidden sm:block">
        {/* <FleetSummaryCard /> */}
      </div>
    </div>
  );
}

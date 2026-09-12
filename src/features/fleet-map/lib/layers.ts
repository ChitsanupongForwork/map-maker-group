import type { ExpressionSpecification, LayerSpecification } from "maplibre-gl";

export const SOURCE_VEHICLES = "vehicles";
export const SOURCE_SELECTED = "selected-vehicle";

export const LAYER_CLUSTER_GLOW = "cluster-glow";
export const LAYER_CLUSTER = "cluster";
export const LAYER_CLUSTER_COUNT = "cluster-count";
export const LAYER_VEHICLES = "vehicle-pins";
export const LAYER_SELECTED = "vehicle-selected";

/** รัศมีวงคลัสเตอร์โตตามจำนวนคันที่รวมอยู่ข้างใน */
const clusterRadius = (scale: number): ExpressionSpecification => [
  "interpolate",
  ["linear"],
  ["get", "point_count"],
  2,
  14 * scale,
  25,
  19 * scale,
  100,
  24 * scale,
  500,
  30 * scale,
];

/** ขนาดหมุดตามระดับซูม */
const iconSize = (base: number): ExpressionSpecification => [
  "interpolate",
  ["linear"],
  ["zoom"],
  8,
  0.82 * base,
  12,
  0.96 * base,
  16,
  1.05 * base,
];

/**
 * รถที่วิ่งอยู่ใช้ลูกศร (หมุนตามหัวรถ) ส่วนรถที่จอดใช้จุดกลม
 * เพราะค่าหัวรถของคันที่จอดค้างอยู่ที่ทิศสุดท้าย ชี้ไปก็ไม่มีความหมาย
 */
const iconImage = (suffix: ExpressionSpecification | string): ExpressionSpecification => [
  "concat",
  ["case", ["==", ["get", "moving"], 1], "arrow-", "dot-"],
  suffix,
];

export function vehicleLayers(): LayerSpecification[] {
  return [
    {
      id: LAYER_CLUSTER_GLOW,
      type: "circle",
      source: SOURCE_VEHICLES,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "#ff7a1a",
        "circle-opacity": 0.1,
        "circle-radius": clusterRadius(1.75),
      },
    },
    {
      id: LAYER_CLUSTER,
      type: "circle",
      source: SOURCE_VEHICLES,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "rgba(10, 15, 21, 0.94)",
        "circle-stroke-color": "#ff7a1a",
        "circle-stroke-width": 1.6,
        "circle-radius": clusterRadius(1),
      },
    },
    {
      id: LAYER_CLUSTER_COUNT,
      type: "symbol",
      source: SOURCE_VEHICLES,
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["Noto Sans Bold"],
        "text-size": ["interpolate", ["linear"], ["get", "point_count"], 2, 12, 200, 15],
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: { "text-color": "#f4f7fb" },
    },
    {
      id: LAYER_VEHICLES,
      type: "symbol",
      source: SOURCE_VEHICLES,
      filter: ["!", ["has", "point_count"]],
      layout: {
        "icon-image": iconImage(["get", "status"]),
        // ลูกศรวางทับพิกัดจริงของรถพอดี ไม่ได้ห้อยอยู่เหนือพิกัดแบบหมุดหยดน้ำ
        "icon-anchor": "center",
        "icon-rotate": ["get", "heading"],
        // หมุนตามทิศจริงบนแผนที่ ไม่ใช่ตามหน้าจอ
        "icon-rotation-alignment": "map",
        // หมุดต้องแสดงครบทุกคัน ไม่ให้ MapLibre ซ่อนตัวที่ทับกัน
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
        "icon-size": iconSize(1),
      },
    },
  ];
}

/** หมุดของคันที่ถูกเลือก วาดทับชั้นอื่นเสมอ */
export const selectedLayers = (): LayerSpecification[] => [
  {
    id: LAYER_SELECTED,
    type: "symbol",
    source: SOURCE_SELECTED,
    layout: {
      "icon-image": iconImage("selected"),
      "icon-anchor": "center",
      "icon-rotate": ["get", "heading"],
      "icon-rotation-alignment": "map",
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
      "icon-size": iconSize(1),
    },
  },
];

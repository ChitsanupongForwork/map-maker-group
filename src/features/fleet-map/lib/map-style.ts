import type { LayerSpecification, StyleSpecification } from "maplibre-gl";

export type Basemap = "map" | "satellite";

/**
 * ฐานแผนที่ธีมมืดจากข้อมูล OpenStreetMap ของ OpenFreeMap — ใช้ได้ฟรี ไม่ต้องมี API key
 * (CARTO กับ Stadia บังคับคีย์แล้ว จึงไม่เหมาะกับโปรเจกต์ที่อยากรันได้ทันที)
 */
const OSM_DARK_STYLE = "https://tiles.openfreemap.org/styles/dark";

const GLYPHS = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";

const SATELLITE_ATTRIBUTION = "Imagery &copy; Esri, Maxar, Earthstar Geographics";

/**
 * สีของสไตล์ต้นทางเป็นเทาล้วน — ปรับให้เข้าโทนแอป: พื้นดำอมน้ำเงิน
 * น้ำสีกรมท่า และถนนสายหลักเป็นสีส้มแบบเดียวกับสีหลักของระบบ
 */
const PAINT_OVERRIDES: Record<string, Record<string, unknown>> = {
  background: { "background-color": "#06090d" },
  water: { "fill-color": "#0a1420" },
  waterway: { "line-color": "#0d1a29" },
  landcover_wood: { "fill-color": "#0b1410" },
  landuse_park: { "fill-color": "#0b1410" },
  landuse_residential: { "fill-color": "#090d13" },
  building: { "fill-color": "#0b1017" },
  aeroway_taxiway: { "line-color": "#151d27" },
  "aeroway-taxiway": { "line-color": "#151d27" },
  "aeroway-runway": { "line-color": "#1a2330" },
  "aeroway-runway-casing": { "line-color": "rgba(42,53,68,0.8)" },
  highway_path: { "line-color": "#121922" },
  highway_minor: { "line-color": "#151d27" },
  highway_major_casing: { "line-color": "rgba(42,53,68,0.85)" },
  highway_major_inner: { "line-color": "#1d2734" },
  highway_major_subtle: { "line-color": "#243040" },
  highway_motorway_casing: { "line-color": "rgba(255,122,26,0.14)" },
  highway_motorway_inner: { "line-color": "rgba(255,122,26,0.46)" },
  highway_motorway_subtle: { "line-color": "rgba(255,122,26,0.2)" },
  railway_transit: { "line-color": "#1b2430" },
  railway_minor: { "line-color": "#1b2430" },
  railway: { "line-color": "#1b2430" },
  boundary_state: { "line-color": "#25313f" },
  "boundary_country_z0-4": { "line-color": "#2a3644" },
  "boundary_country_z5-": { "line-color": "#2a3644" },
  highway_name_other: { "text-color": "#5b6675" },
  highway_name_motorway: { "text-color": "#b06526" },
  water_name: { "text-color": "#3f5570" },
};

const LABEL_PREFIX = "place_";

function tuneLayer(layer: LayerSpecification): LayerSpecification {
  const override = PAINT_OVERRIDES[layer.id];
  const paint: Record<string, unknown> = { ...(layer.paint ?? {}) };

  if (override) Object.assign(paint, override);

  if (layer.id.startsWith(LABEL_PREFIX)) {
    paint["text-color"] = "#8a94a3";
    paint["text-halo-color"] = "rgba(4,7,11,0.9)";
    paint["text-halo-width"] = 1.2;
  }

  return { ...layer, paint } as LayerSpecification;
}

let darkStyle: Promise<StyleSpecification> | null = null;

async function fetchDarkStyle(): Promise<StyleSpecification> {
  const response = await fetch(OSM_DARK_STYLE);
  if (!response.ok) throw new Error(`โหลดสไตล์แผนที่ไม่สำเร็จ (${response.status})`);
  const style = (await response.json()) as StyleSpecification;

  return {
    ...style,
    layers: style.layers.map(tuneLayer),
  };
}

function satelliteStyle(): StyleSpecification {
  return {
    version: 8,
    glyphs: GLYPHS,
    sources: {
      satellite: {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution: SATELLITE_ATTRIBUTION,
      },
    },
    layers: [
      { id: "background", type: "background", paint: { "background-color": "#06090d" } },
      {
        id: "satellite",
        type: "raster",
        source: "satellite",
        paint: { "raster-saturation": -0.18, "raster-contrast": 0.06 },
      },
    ],
  };
}

/**
 * สไตล์ถูก fetch ครั้งเดียวแล้ว cache ไว้ทั้งหน้า — สลับไป-กลับ Map/Satellite
 * จึงไม่ยิงเน็ตซ้ำ (clone ก่อนคืนเพราะ MapLibre แก้ object ที่รับไป)
 */
export async function loadMapStyle(basemap: Basemap): Promise<StyleSpecification> {
  if (basemap === "satellite") return satelliteStyle();
  darkStyle ??= fetchDarkStyle();
  return structuredClone(await darkStyle);
}

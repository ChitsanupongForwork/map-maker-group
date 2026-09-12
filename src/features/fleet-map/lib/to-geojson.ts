import type { Vehicle } from "@/features/fleet";

export type VehicleFeatureProps = {
  id: string;
  status: Vehicle["status"];
  /** องศาหัวรถ (0 = เหนือ) ใช้หมุนลูกศรบอกทิศบนแผนที่ */
  heading: number;
  /** 1 = กำลังเคลื่อนที่ ใช้เป็นตัวกรองว่าจะโชว์ลูกศรบอกทิศไหม */
  moving: number;
};

export type VehicleCollection = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  VehicleFeatureProps
>;

const EMPTY: VehicleCollection = { type: "FeatureCollection", features: [] };

const toFeature = (
  vehicle: Vehicle,
): GeoJSON.Feature<GeoJSON.Point, VehicleFeatureProps> => ({
  type: "Feature",
  id: vehicle.id,
  geometry: { type: "Point", coordinates: [vehicle.lng, vehicle.lat] },
  properties: {
    id: vehicle.id,
    status: vehicle.status,
    heading: vehicle.headingDeg,
    // รถที่จอดอยู่ค่าหัวรถยังค้างอยู่ แต่ไม่มีความหมาย จึงไม่ต้องวาดลูกศร
    moving: vehicle.status === "running" ? 1 : 0,
  },
});

/**
 * แปลงรายการรถเป็น GeoJSON — ใส่เฉพาะ property ที่ชั้นแผนที่ใช้จริง
 * ยิ่ง property น้อย MapLibre ยิ่งอัปโหลดข้อมูลเข้า worker ได้เร็ว
 */
export function toVehicleCollection(vehicles: readonly Vehicle[]): VehicleCollection {
  if (vehicles.length === 0) return EMPTY;
  return { type: "FeatureCollection", features: vehicles.map(toFeature) };
}

export function toSingleCollection(vehicle: Vehicle | null): VehicleCollection {
  if (!vehicle) return EMPTY;
  return { type: "FeatureCollection", features: [toFeature(vehicle)] };
}

/** สถานะการเคลื่อนที่ของรถ — มาจากเครื่องยนต์ + ความเร็ว */
export type VehicleStatus = "running" | "parking" | "engine-on" | "offline";

/** สถานะของ "ข้อมูล" — ดูจากเวลาที่ส่งข้อมูลเข้ามาล่าสุด ไม่เกี่ยวกับว่ารถวิ่งอยู่ไหม */
export type DataStatus = "realtime" | "delayed" | "stale";

export type Vehicle = {
  id: string;
  /** ทะเบียนรถไทย เช่น "กท 4821" */
  plate: string;
  label: string;
  status: VehicleStatus;
  speedKph: number;
  headingDeg: number;
  lat: number;
  lng: number;
  /** epoch ms ของข้อมูลล่าสุดที่อุปกรณ์ส่งเข้ามา */
  lastUpdate: number;
  driverId: string;
  driverName: string;
  groupId: string;
  areaId: string;
  address: string;
  fuelPct: number;
  odometerKm: number;
  engineHours: number;
  todayDistanceKm: number;
  make: string;
  model: string;
  /** ความเร็วย้อนหลัง 24 ชม. (48 จุด ทุกครึ่งชั่วโมง) สำหรับกราฟ */
  speedHistory: number[];
};

export type FleetOption = { value: string; label: string };

export type FleetSnapshot = {
  vehicles: Vehicle[];
  groups: FleetOption[];
  drivers: FleetOption[];
  areas: FleetOption[];
  /** เวลาที่ snapshot นี้ถูกสร้าง — ใช้เป็น "ตอนนี้" ของการ render ครั้งแรก */
  generatedAt: number;
};

/**
 * ส่วนที่เปลี่ยนของรถหนึ่งคัน จาก event "patch" ของ GET /api/fleet/stream
 * id มีเสมอ ฟิลด์อื่นมีเฉพาะที่เปลี่ยน
 */
export type VehiclePatch = Pick<Vehicle, "id"> & Partial<Omit<Vehicle, "id" | "speedHistory">>;

export type FleetFilter = {
  status: VehicleStatus | "all";
  dataStatus: DataStatus | "all";
  groupId: string;
  driverId: string;
  areaId: string;
  search: string;
};

export type FleetCounts = {
  total: number;
  status: Record<VehicleStatus, number>;
  data: Record<DataStatus, number>;
};

export type SortKey = "lastUpdate" | "plate" | "speed" | "status";

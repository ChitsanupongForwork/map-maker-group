import type { Vehicle, VehiclePatch } from "../types";

/**
 * รวม patch จาก SSE เข้ากับกองรถเดิม — คันที่ไม่มี patch ใช้ object เดิม
 * React จะได้ไม่ต้อง render แถวที่ไม่ได้เปลี่ยน
 *
 * id ที่ไม่รู้จักถูกข้ามไป: ถ้ามีรถเพิ่มหรือหาย server ส่ง event "snapshot" ก้อนเต็มมาแทน
 */
export function applyPatches(vehicles: Vehicle[], patches: VehiclePatch[]): Vehicle[] {
  if (patches.length === 0) return vehicles;

  const byId = new Map(patches.map((patch) => [patch.id, patch]));
  let changed = false;
  const next = vehicles.map((vehicle) => {
    const patch = byId.get(vehicle.id);
    if (!patch) return vehicle;
    changed = true;
    return { ...vehicle, ...patch };
  });
  return changed ? next : vehicles;
}

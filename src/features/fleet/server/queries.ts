import "server-only";
import { env } from "@/env";
import { createMockFleet } from "../lib/mock-fleet";
import type { FleetSnapshot } from "../types";

/**
 * แหล่งข้อมูลกองรถของทั้งแอป
 *
 * ตอนนี้เป็นชุดจำลองแบบกำหนดผลได้ (seeded) เพื่อให้หน้าจอนิ่งและเทียบภาพได้
 * เวลาต่อของจริงให้แทนที่ตรงนี้ที่เดียว — ข้างนอกเห็นแค่ FleetSnapshot
 */
export async function getFleetSnapshot(): Promise<FleetSnapshot> {
  return createMockFleet({
    size: env.fleetSize,
    seed: env.fleetSeed,
    now: Date.now(),
  });
}

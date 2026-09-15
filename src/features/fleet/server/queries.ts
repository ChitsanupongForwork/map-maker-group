import "server-only";
import { env } from "@/env";
import { createMockFleet } from "../lib/mock-fleet";
import type { FleetSnapshot } from "../types";

/**
 * แหล่งข้อมูลกองรถของทั้งแอป
 *
 * ตั้ง NEXT_PUBLIC_FLEET_API_URL = ดึงจาก Go API (GET /api/fleet)
 * ไม่ตั้ง = ชุดจำลองแบบกำหนดผลได้ (seeded) เหมือนเดิม
 * ข้างนอกเห็นแค่ FleetSnapshot ทั้งสองแบบ
 */
export async function getFleetSnapshot(): Promise<FleetSnapshot> {
  if (!env.fleetApiUrl) {
    return createMockFleet({
      size: env.fleetSize,
      seed: env.fleetSeed,
      now: Date.now(),
    });
  }

  const url = `${env.fleetApiUrl}/api/fleet`;
  let response: Response;
  try {
    // layout เป็น force-dynamic อยู่แล้ว ใส่ no-store ไว้ให้ชัดว่าข้อมูลกองรถห้าม cache
    response = await fetch(url, { cache: "no-store" });
  } catch (error) {
    throw new Error(
      `ต่อ Go API ที่ ${url} ไม่ได้ — เปิด server ด้วย go run ./cmd/api หรือลบ NEXT_PUBLIC_FLEET_API_URL เพื่อใช้ข้อมูลจำลอง`,
      { cause: error },
    );
  }
  // Go API ตอบ JSON ทุกกรณี ถ้าได้อย่างอื่น (เช่นหน้า 404 ของ Apache) แปลว่าพอร์ตนี้เป็นโปรแกรมอื่น
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(
      `${url} ไม่ใช่ Go API (ได้ HTTP ${response.status} ที่ไม่ใช่ JSON) — พอร์ตนี้อาจถูกโปรแกรมอื่นใช้อยู่ เช็ก NEXT_PUBLIC_FLEET_API_URL กับ PORT ใน .env ของ API`,
    );
  }
  if (!response.ok) {
    throw new Error(`Go API ตอบ HTTP ${response.status} ที่ ${url}`);
  }
  return (await response.json()) as FleetSnapshot;
}

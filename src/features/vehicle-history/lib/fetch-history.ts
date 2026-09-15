import { env } from "@/env";
import type { HistoryTrip } from "../types";

/**
 * GET /api/vehicles/{id}/history ของ Go API
 * from / to เป็น epoch ms และช่วงกว้างสุด 31 วัน — เกินกว่านั้น API ตอบ 400
 * ค่าสรุปกับ events คำนวณจากจุดดิบทั้งหมดที่ฝั่ง API แล้ว
 */
export async function fetchHistory(
  vehicleId: string,
  start: number,
  end: number,
  signal?: AbortSignal,
): Promise<HistoryTrip> {
  const query = new URLSearchParams({ from: String(Math.round(start)), to: String(Math.round(end)) });
  const response = await fetch(
    `${env.fleetApiUrl}/api/vehicles/${encodeURIComponent(vehicleId)}/history?${query}`,
    { signal },
  );
  if (!response.ok) {
    // Go API ตอบ {"error": "..."} รูปร่างเดียวกันทุก endpoint
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `HTTP ${response.status}`);
  }
  return (await response.json()) as HistoryTrip;
}

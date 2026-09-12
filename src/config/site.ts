export const site = {
  name: "Map Maker",
  tagline: "Real-time Vehicle Tracking",
  /** Map ตั้งต้นที่กรุงเทพฯ — ศูนย์กลางของกองรถในระบบสาธิต */
  defaultCenter: { lng: 100.5605, lat: 13.7466 },
  defaultZoom: 10.8,
  /** ช่วงเวลาที่ถือว่าข้อมูลยัง "เรียลไทม์" (วินาที) */
  realtimeWindowSec: 120,
  /** เกินช่วงนี้ถือว่า "ไม่อัพเดต" (วินาที) */
  staleWindowSec: 900,
  /** จังหวะดึง/จำลองข้อมูลสด (มิลลิวินาที) */
  liveTickMs: 3000,
} as const;

export type Site = typeof site;

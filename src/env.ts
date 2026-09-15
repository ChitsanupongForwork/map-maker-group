/**
 * จุดเดียวที่อ่าน process.env — ที่อื่นให้ import จากไฟล์นี้
 * เวลาเปลี่ยนไปต่อ service จริงจะได้แก้ที่เดียว
 */
export const env = {
  fleetSize: Number(process.env.FLEET_SIZE ?? 107),
  fleetSeed: Number(process.env.FLEET_SEED ?? 20260912),
  /**
   * URL ของ Go API เช่น http://localhost:8080 — ว่าง = ใช้ข้อมูลจำลองทั้งแอป
   * ต้องขึ้นต้นด้วย NEXT_PUBLIC_ เพราะ browser ใช้เปิด SSE และโหลดประวัติเส้นทาง
   * Next ฝังค่านี้ตอน build และต้องอ้างชื่อเต็มแบบนี้ตรง ๆ ถึงจะฝังให้
   */
  fleetApiUrl: (process.env.NEXT_PUBLIC_FLEET_API_URL ?? "").replace(/\/+$/, ""),
} as const;

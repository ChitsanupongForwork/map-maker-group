/**
 * จุดเดียวที่อ่าน process.env — ที่อื่นให้ import จากไฟล์นี้
 * เวลาเปลี่ยนไปต่อ service จริงจะได้แก้ที่เดียว
 */
export const env = {
  fleetSize: Number(process.env.FLEET_SIZE ?? 107),
  fleetSeed: Number(process.env.FLEET_SEED ?? 20260912),
} as const;

import { createSeededRandom } from "@/lib/seeded-random";
import { getPinCategory, pinCategories } from "@/data/pin-categories";
import type { Location } from "@/types/location";

const PIN_NAMES = {
  food: ["มื้อเย็นที่อยากลอง", "กาแฟแสงเช้า", "ของหวานวันหยุด"],
  culture: ["นิทรรศการสุดสัปดาห์", "แกลเลอรีเล็ก", "พื้นที่ฟังดนตรี"],
  nature: ["จุดดูพระอาทิตย์", "สวนเงียบ ๆ", "ทางเดินสีเขียว"],
  work: ["มุมทำงานใหม่", "ห้องสมุดน่าแวะ", "เวิร์กช็อปถัดไป"],
  idea: ["ไว้กลับมาอีกครั้ง", "ไอเดียทริปหน้า", "มุมที่อยากบันทึก"],
} as const;

const BANGKOK_BOUNDS = {
  minLat: 13.55,
  maxLat: 13.95,
  minLng: 100.35,
  maxLng: 100.95,
};

const LOCATION_SEED = 42;

export function generateLocations(count: number): Location[] {
  const random = createSeededRandom(LOCATION_SEED);
  const locations = new Array<Location>(count);
  const { minLat, maxLat, minLng, maxLng } = BANGKOK_BOUNDS;
  const latSpan = maxLat - minLat;
  const lngSpan = maxLng - minLng;

  for (let i = 0; i < count; i++) {
    const category = pinCategories[i % pinCategories.length];
    const names = PIN_NAMES[category.id];
    locations[i] = {
      id: `sample-${i + 1}`,
      name: `${names[i % names.length]} ${Math.floor(i / names.length) + 1}`,
      category: category.id,
      note: "ข้อมูลตัวอย่างสำหรับพอร์ตโฟลิโอ",
      lat: minLat + random() * latSpan,
      lng: minLng + random() * lngSpan,
      color: getPinCategory(category.id).color,
      createdAt: "2026-08-29T00:00:00.000Z",
    };
  }

  return locations;
}

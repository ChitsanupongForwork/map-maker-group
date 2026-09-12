import type { DataStatus, FleetSnapshot, Vehicle, VehicleStatus } from "../types";

/* ────────────────── สุ่มแบบมี seed: ผลเหมือนเดิมทุกครั้ง ──────────────────
   สำคัญกับการ render บนเซิร์ฟเวอร์แล้ว hydrate ต่อบนเบราว์เซอร์ —
   ถ้าข้อมูลสองฝั่งไม่ตรงกัน React จะทิ้ง DOM ทั้งก้อนแล้ววาดใหม่ */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HUBS: readonly (readonly [number, number, number])[] = [
  // [lat, lng, น้ำหนัก] — ย่านที่รถกระจุกตัวจริงในกรุงเทพฯ และปริมณฑล
  [13.801, 100.554, 9], // จตุจักร
  [13.77, 100.554, 8], // ดินแดง
  [13.769, 100.574, 7], // ห้วยขวาง
  [13.757, 100.534, 6], // พญาไท
  [13.746, 100.534, 6], // ปทุมวัน
  [13.716, 100.562, 7], // คลองเตย
  [13.668, 100.604, 5], // บางนา
  [13.69, 100.75, 4], // สุวรรณภูมิ
  [13.765, 100.644, 6], // บางกะปิ
  [13.806, 100.606, 5], // ลาดพร้าว
  [13.723, 100.488, 5], // ธนบุรี
  [13.713, 100.399, 3], // บางแค
  [13.859, 100.514, 4], // นนทบุรี
  [13.913, 100.498, 3], // ปากเกร็ด
  [13.599, 100.599, 4], // สมุทรปราการ
  [13.985, 100.617, 3], // รังสิต
  [13.656, 100.434, 3], // พระราม 2
  [13.813, 100.737, 3], // มีนบุรี
];

const PLATE_CONSONANTS = "กขคฆงจฉชฌญฎฐฑณดตถทธนบปผพภมยรลวศษสหฬอฮ";

const GROUPS = [
  { value: "g-central", label: "ขนส่งภาคกลาง" },
  { value: "g-north", label: "ขนส่งภาคเหนือ" },
  { value: "g-isan", label: "ขนส่งภาคอีสาน" },
  { value: "g-service", label: "รถบริการ" },
  { value: "g-exec", label: "รถผู้บริหาร" },
];

const AREAS = [
  { value: "a-inner", label: "กรุงเทพฯ ชั้นใน" },
  { value: "a-outer", label: "กรุงเทพฯ รอบนอก" },
  { value: "a-nonthaburi", label: "นนทบุรี" },
  { value: "a-samutprakan", label: "สมุทรปราการ" },
  { value: "a-pathumthani", label: "ปทุมธานี" },
];

const FIRST_NAMES = [
  "สมชาย", "ประเสริฐ", "วิชัย", "อนุชา", "ธนากร", "ศักดิ์ชัย", "พงศ์พันธุ์",
  "ณัฐพล", "กิตติศักดิ์", "สุรชัย", "มานพ", "ชัยวัฒน์", "ธีรพงษ์", "ปรีชา",
  "อรรถพล", "วีระ", "สมศักดิ์", "จักรพงษ์", "ภาณุพงศ์", "ทวีศักดิ์",
];

const LAST_NAMES = [
  "ใจดี", "ศรีสุข", "รุ่งเรือง", "ทองคำ", "พรหมมา", "แสงทอง", "บุญมี",
  "วงศ์ไทย", "สุขสวัสดิ์", "เจริญพร", "ชัยมงคล", "อินทร์ทอง", "พูลทรัพย์",
];

const ROADS = [
  "ถนนพหลโยธิน แขวงจอมพล เขตจตุจักร กรุงเทพมหานคร",
  "ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพมหานคร",
  "ถนนลาดพร้าว แขวงจันทรเกษม เขตจตุจักร กรุงเทพมหานคร",
  "ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร",
  "ถนนเพชรบุรีตัดใหม่ แขวงบางกะปิ เขตห้วยขวาง กรุงเทพมหานคร",
  "ถนนบางนา-ตราด แขวงบางนา เขตบางนา กรุงเทพมหานคร",
  "ถนนบรมราชชนนี แขวงอรุณอมรินทร์ เขตบางกอกน้อย กรุงเทพมหานคร",
  "ถนนงามวงศ์วาน ตำบลบางเขน อำเภอเมือง นนทบุรี",
  "ถนนสุขสวัสดิ์ ตำบลบางครุ อำเภอพระประแดง สมุทรปราการ",
  "ถนนพระราม 2 แขวงแสมดำ เขตบางขุนเทียน กรุงเทพมหานคร",
];

const MODELS: readonly (readonly [string, string])[] = [
  ["Isuzu", "D-Max"],
  ["Toyota", "Hilux Revo"],
  ["Hino", "500 Series"],
  ["Mitsubishi", "Fuso Canter"],
  ["Ford", "Ranger"],
  ["Nissan", "Navara"],
  ["Toyota", "Commuter"],
  ["Isuzu", "Elf NLR"],
];

/** แจกจำนวนตามสัดส่วน แล้วโยนเศษที่เหลือเข้ากลุ่มแรก ๆ ให้รวมได้ total พอดี */
function distribute(total: number, weights: readonly number[]) {
  const sum = weights.reduce((acc, value) => acc + value, 0);
  const counts = weights.map((weight) => Math.floor((total * weight) / sum));
  let rest = total - counts.reduce((acc, value) => acc + value, 0);
  for (let index = 0; rest > 0; index = (index + 1) % counts.length, rest--) {
    counts[index] += 1;
  }
  return counts;
}

function shuffle<T>(items: T[], random: () => number) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/** กระจายรอบ hub แบบระฆังคว่ำ ได้กลุ่มก้อนที่ดูเป็นธรรมชาติกว่าสุ่มแบน */
function gaussian(random: () => number, sigma: number) {
  const u = Math.max(1e-9, random());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random()) * sigma;
}

function historyFor(status: VehicleStatus, random: () => number) {
  const points: number[] = [];
  let speed = status === "running" ? 55 : 20;
  for (let index = 0; index < 48; index++) {
    const night = index < 10 || index > 44;
    const target = night ? 6 : status === "offline" ? 12 : 46 + random() * 38;
    speed += (target - speed) * 0.45 + (random() - 0.5) * 16;
    points.push(Math.max(0, Math.round(speed)));
  }
  return points;
}

/** ช่วงอายุข้อมูล (วินาที) ของแต่ละสถานะข้อมูล */
const AGE_RANGE: Record<DataStatus, readonly [number, number]> = {
  realtime: [2, 110],
  delayed: [150, 870],
  stale: [1000, 6 * 3600],
};

const STATUS_ORDER = ["running", "parking", "engine-on", "offline"] as const;
const DATA_ORDER = ["realtime", "delayed", "stale"] as const;

export type MockFleetOptions = {
  size?: number;
  seed?: number;
  now?: number;
};

/**
 * สร้างกองรถจำลองแบบกำหนดผลได้ — สัดส่วนสถานะล็อกไว้ตามหน้าจอออกแบบ
 * (วิ่ง 48 / จอด 32 / จอดติดเครื่อง 15 / ออฟไลน์ 12 เมื่อมี 107 คัน)
 */
export function createMockFleet({
  size = 107,
  seed = 20260912,
  now = Date.now(),
}: MockFleetOptions = {}): FleetSnapshot {
  const random = mulberry32(seed);

  const statusCounts = distribute(size, [48, 32, 15, 12]);
  const statusPool: VehicleStatus[] = [];
  STATUS_ORDER.forEach((status, index) => {
    for (let i = 0; i < statusCounts[index]; i++) statusPool.push(status);
  });
  shuffle(statusPool, random);

  const dataCounts = distribute(size, [76, 18, 13]);
  const dataPool: DataStatus[] = [];
  DATA_ORDER.forEach((status, index) => {
    for (let i = 0; i < dataCounts[index]; i++) dataPool.push(status);
  });

  // รถที่ออฟไลน์ควรเป็นตัวที่ข้อมูลค้างก่อนเพื่อน — จับคู่ให้ดูสมเหตุสมผล
  const rankStatus = (status: VehicleStatus) =>
    status === "offline" ? 0 : status === "parking" ? 1 : 2;
  const rankData = (status: DataStatus) =>
    status === "stale" ? 0 : status === "delayed" ? 1 : 2;

  const byNeed = statusPool
    .map((status, index) => ({ status, index }))
    .sort((a, b) => rankStatus(a.status) - rankStatus(b.status));
  const staleFirst = [...dataPool].sort((a, b) => rankData(a) - rankData(b));

  const dataByIndex = new Array<DataStatus>(size);
  byNeed.forEach((entry, position) => {
    dataByIndex[entry.index] = staleFirst[position];
  });

  const hubTotal = HUBS.reduce((acc, hub) => acc + hub[2], 0);
  const usedPlates = new Set<string>();

  const vehicles: Vehicle[] = Array.from({ length: size }, (_, index) => {
    const status = statusPool[index];
    const dataStatus = dataByIndex[index];

    let pick = random() * hubTotal;
    let hub = HUBS[0];
    for (const candidate of HUBS) {
      pick -= candidate[2];
      if (pick <= 0) {
        hub = candidate;
        break;
      }
    }

    let plate = "";
    do {
      const a = PLATE_CONSONANTS[Math.floor(random() * PLATE_CONSONANTS.length)];
      const b = PLATE_CONSONANTS[Math.floor(random() * PLATE_CONSONANTS.length)];
      const digits = String(1000 + Math.floor(random() * 9000));
      const prefix = random() < 0.45 ? String(1 + Math.floor(random() * 9)) : "";
      plate = `${prefix}${a}${b} ${digits}`;
    } while (usedPlates.has(plate));
    usedPlates.add(plate);

    const [ageMin, ageMax] = AGE_RANGE[dataStatus];
    const ageSec = ageMin + random() * (ageMax - ageMin);
    const [make, model] = MODELS[Math.floor(random() * MODELS.length)];
    const firstName = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];

    return {
      id: `v-${String(index + 1).padStart(4, "0")}`,
      plate,
      label: `${make} ${model}`,
      status,
      speedKph: status === "running" ? 18 + Math.round(random() * 92) : 0,
      headingDeg: Math.floor(random() * 360),
      lat: hub[0] + gaussian(random, 0.016),
      lng: hub[1] + gaussian(random, 0.019),
      lastUpdate: Math.round(now - ageSec * 1000),
      driverId: `d-${String(index + 1).padStart(4, "0")}`,
      driverName: `${firstName} ${lastName}`,
      groupId: GROUPS[Math.floor(random() * GROUPS.length)].value,
      areaId: AREAS[Math.floor(random() * AREAS.length)].value,
      address: ROADS[Math.floor(random() * ROADS.length)],
      fuelPct: 12 + Math.floor(random() * 86),
      odometerKm: 18_000 + Math.floor(random() * 240_000),
      engineHours: 400 + Math.floor(random() * 9_000),
      todayDistanceKm: Math.round(random() * 340),
      make,
      model,
      speedHistory: historyFor(status, random),
    };
  });

  const drivers = vehicles
    .map((vehicle) => ({ value: vehicle.driverId, label: vehicle.driverName }))
    .sort((a, b) => a.label.localeCompare(b.label, "th"));

  return { vehicles, groups: GROUPS, areas: AREAS, drivers, generatedAt: now };
}

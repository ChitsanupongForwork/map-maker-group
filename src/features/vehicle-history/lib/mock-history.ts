import type { Vehicle } from "@/features/fleet";
import type { HistoryEvent, HistoryPoint, HistoryTrip } from "../types";

const ROUTE: readonly (readonly [number, number, string])[] = [
  [100.5267, 13.7365, "ถนนสาทรเหนือ เขตบางรัก"],
  [100.5312, 13.7391, "แยกนราธิวาส–สาทร"],
  [100.5382, 13.7427, "ถนนพระราม 4 แขวงสีลม"],
  [100.5447, 13.7462, "แยกศาลาแดง เขตปทุมวัน"],
  [100.5516, 13.7489, "ถนนวิทยุ แขวงลุมพินี"],
  [100.5589, 13.7518, "ถนนเพลินจิต เขตวัฒนา"],
  [100.5669, 13.7558, "แยกอโศก ถนนสุขุมวิท"],
  [100.5751, 13.7606, "ถนนเพชรบุรีตัดใหม่"],
  [100.5834, 13.7669, "ถนนพระราม 9 เขตห้วยขวาง"],
  [100.5912, 13.7724, "แยก อ.ส.ม.ท. เขตห้วยขวาง"],
  [100.5979, 13.7798, "ถนนรัชดาภิเษก"],
  [100.6021, 13.7884, "แยกสุทธิสาร เขตดินแดง"],
  [100.5972, 13.7967, "ถนนลาดพร้าว แขวงจอมพล"],
  [100.5891, 13.8027, "แยกรัชดา–ลาดพร้าว"],
  [100.5804, 13.8075, "ถนนพหลโยธิน เขตจตุจักร"],
  [100.5712, 13.8112, "ห้าแยกลาดพร้าว"],
  [100.5622, 13.8148, "ถนนวิภาวดีรังสิต"],
  [100.5541, 13.8192, "สถานีกลางกรุงเทพอภิวัฒน์"],
] as const;

function haversine(a: HistoryPoint, b: HistoryPoint) {
  const radius = 6371;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

/** ข้อมูลจำลองแบบคงที่ เปลี่ยนตามรถและยืด timestamp ตามช่วงที่ผู้ใช้เลือก */
export function buildMockHistory(vehicle: Vehicle, start: number, end: number): HistoryTrip {
  const safeEnd = Math.max(start + 60_000, end);
  const seed = Number(vehicle.id.replace(/\D/g, "")) || 1;
  const offsetLng = ((seed % 7) - 3) * 0.00035;
  const offsetLat = ((seed % 5) - 2) * 0.0003;
  const span = safeEnd - start;

  const points: HistoryPoint[] = ROUTE.map(([lng, lat, address], index) => {
    const progress = index / (ROUTE.length - 1);
    const stopDelay = index >= 8 ? span * 0.09 : 0;
    const movingSpan = span * 0.91;
    const timestamp = Math.min(safeEnd, start + progress * movingSpan + stopDelay);
    const previous = ROUTE[Math.max(0, index - 1)];
    const headingDeg =
      index === 0
        ? 35
        : (Math.atan2(lng - previous[0], lat - previous[1]) * 180) / Math.PI;
    const wave = Math.sin(progress * Math.PI * 4 + seed) * 13;

    return {
      lng: lng + offsetLng,
      lat: lat + offsetLat,
      timestamp,
      speedKph: index === 8 ? 0 : Math.max(18, Math.round(47 + wave)),
      headingDeg: (headingDeg + 360) % 360,
      address,
    };
  });

  const distanceKm = points.slice(1).reduce((sum, point, index) => sum + haversine(points[index], point), 0);
  const movingMinutes = Math.round((span * 0.91) / 60_000);
  const stoppedMinutes = Math.max(1, Math.round((span * 0.09) / 60_000));
  const movingSpeeds = points.filter((point) => point.speedKph > 0).map((point) => point.speedKph);

  const events: HistoryEvent[] = [
    { id: "start", type: "start", timestamp: points[0].timestamp, title: "เริ่มต้นเส้นทาง", detail: points[0].address, pointIndex: 0 },
    { id: "moving-1", type: "moving", timestamp: points[5].timestamp, title: "กำลังเดินทาง", detail: `ความเร็ว ${points[5].speedKph} กม./ชม. · ${points[5].address}`, pointIndex: 5 },
    { id: "stop", type: "stop", timestamp: points[8].timestamp, title: "จอดรถ 12 นาที", detail: points[8].address, pointIndex: 8 },
    { id: "moving-2", type: "moving", timestamp: points[12].timestamp, title: "เดินทางต่อ", detail: `ความเร็ว ${points[12].speedKph} กม./ชม. · ${points[12].address}`, pointIndex: 12 },
    { id: "end", type: "end", timestamp: points.at(-1)!.timestamp, title: "สิ้นสุดเส้นทาง", detail: points.at(-1)!.address, pointIndex: points.length - 1 },
  ];

  return {
    points,
    events,
    distanceKm,
    movingMinutes,
    stoppedMinutes,
    maxSpeedKph: Math.max(...movingSpeeds),
    averageSpeedKph: Math.round(movingSpeeds.reduce((sum, speed) => sum + speed, 0) / movingSpeeds.length),
  };
}

export function pointAtProgress(points: HistoryPoint[], progress: number) {
  if (points.length === 0) return null;
  if (points.length === 1) return { ...points[0], pointIndex: 0 };
  const clamped = Math.max(0, Math.min(1, progress));
  const targetTime = points[0].timestamp + (points.at(-1)!.timestamp - points[0].timestamp) * clamped;
  const nextIndex = points.findIndex((point) => point.timestamp >= targetTime);
  const index = Math.max(0, Math.min(points.length - 2, nextIndex <= 0 ? 0 : nextIndex - 1));
  const from = points[index];
  const to = points[index + 1] ?? from;
  const part = Math.max(0, Math.min(1, (targetTime - from.timestamp) / Math.max(1, to.timestamp - from.timestamp)));
  return {
    ...from,
    lat: from.lat + (to.lat - from.lat) * part,
    lng: from.lng + (to.lng - from.lng) * part,
    timestamp: from.timestamp + (to.timestamp - from.timestamp) * part,
    speedKph: Math.round(from.speedKph + (to.speedKph - from.speedKph) * part),
    headingDeg: from.headingDeg + (to.headingDeg - from.headingDeg) * part,
    pointIndex: index,
  };
}

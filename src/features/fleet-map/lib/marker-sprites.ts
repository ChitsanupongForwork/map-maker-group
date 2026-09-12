import type { Map as MapLibreMap } from "maplibre-gl";
import { STATUS_HEX, type VehicleStatus } from "@/features/fleet";

/**
 * หมุดรถเป็น "ลูกศรสีตามสถานะ" วางทับพิกัดจริงและหมุนตามหัวรถ
 *
 * เลือกลูกศรแทนหมุดหยดน้ำเพราะได้สองอย่างในรูปเดียว: สีบอกสถานะ + ปลายบอกทิศ
 * (หมุดหยดน้ำมีหางเป็นสามเหลี่ยมอยู่แล้ว พอเติมลูกศรบอกทิศเข้าไปจะแยกกันไม่ออก)
 *
 * ทุกภาพถูกวาดลง canvas ครั้งเดียวตอนแผนที่พร้อม แล้วส่งให้ GPU
 * MapLibre วาดรถทุกคันในชั้นเดียวจาก GeoJSON — ต่อให้มีหลักพันคันก็ไม่มี DOM
 * node เพิ่มสักตัว ซึ่งคือเหตุผลที่มันลื่นกว่า marker แบบ HTML
 */

/** สีขอบนอก ใช้เฉดเดียวกับพื้นหลังแอปเพื่อให้ลูกศร "ลอย" ออกจากถนน */
const HALO = "#05080c";

const SIZE = 15;
const SIZE_LG = 18.5;

/** ความสูงของภาพสไปรท์ เผื่อขอบและแสงเรืองรอบตัวลูกศร */
const canvasSize = (size: number) => Math.ceil(size * 3.2);

/**
 * ลูกศรนำทางแบบมาตรฐาน: ปลายแหลมด้านหน้า ท้ายเว้าเข้า
 * วาดชี้ขึ้นเสมอ (0° = ทิศเหนือ) แล้วให้ MapLibre หมุนตาม heading
 */
function arrowPath(cx: number, cy: number, size: number) {
  const path = new Path2D();
  path.moveTo(cx, cy - size);
  path.lineTo(cx + size * 0.72, cy + size * 0.82);
  path.quadraticCurveTo(cx, cy + size * 0.34, cx - size * 0.72, cy + size * 0.82);
  path.closePath();
  return path;
}

/** ทำสีให้สว่างขึ้นเพื่อไล่เฉดด้านหัวลูกศร */
function lighten(hex: string, amount: number) {
  const value = Number.parseInt(hex.slice(1), 16);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  return `rgb(${mix((value >> 16) & 255)},${mix((value >> 8) & 255)},${mix(value & 255)})`;
}

type SpriteSpec = { id: string; color: string; emphasis: boolean };

function renderArrow({ color, emphasis }: SpriteSpec, dpr: number) {
  const size = emphasis ? SIZE_LG : SIZE;
  const box = canvasSize(size);
  const canvas = document.createElement("canvas");
  canvas.width = box * dpr;
  canvas.height = box * dpr;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(dpr, dpr);

  const cx = box / 2;
  const cy = box / 2;

  // 1) แสงเรืองรอบลูกศร ช่วยให้จับตาได้เร็วบนพื้นมืด
  const glow = ctx.createRadialGradient(cx, cy, size * 0.5, cx, cy, size * 1.5);
  glow.addColorStop(0, `${color}40`);
  glow.addColorStop(1, `${color}00`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 1.5, 0, Math.PI * 2);
  ctx.fill();

  const body = arrowPath(cx, cy, size);

  // 2) ขอบนอกสีเข้ม แยกลูกศรออกจากถนนที่อยู่ข้างหลัง
  ctx.strokeStyle = HALO;
  ctx.lineWidth = emphasis ? 4.4 : 3.6;
  ctx.lineJoin = "round";
  ctx.stroke(body);

  // 3) ตัวลูกศรสีสถานะแบบทึบ ไล่เฉดสว่างที่ปลายให้ดูพุ่งไปข้างหน้า
  const fill = ctx.createLinearGradient(cx, cy - size, cx, cy + size);
  fill.addColorStop(0, lighten(color, 0.32));
  fill.addColorStop(1, color);
  ctx.fillStyle = fill;
  ctx.fill(body);

  // 4) ขอบในสีขาวจาง ๆ ให้รูปทรงคม
  ctx.strokeStyle = emphasis ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.42)";
  ctx.lineWidth = emphasis ? 1.8 : 1;
  ctx.stroke(body);

  return {
    width: canvas.width,
    height: canvas.height,
    data: new Uint8ClampedArray(ctx.getImageData(0, 0, canvas.width, canvas.height).data),
  };
}

/**
 * รถที่จอดอยู่ไม่มีทิศที่มีความหมาย — ใช้วงกลมสีสถานะแทน
 * จะได้ไม่ชี้มั่วไปตามค่าหัวรถที่ค้างอยู่ตั้งแต่ครั้งสุดท้ายที่วิ่ง
 */
function renderDot(color: string, dpr: number) {
  const size = SIZE * 0.66;
  const box = canvasSize(SIZE);
  const canvas = document.createElement("canvas");
  canvas.width = box * dpr;
  canvas.height = box * dpr;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(dpr, dpr);

  const cx = box / 2;
  const cy = box / 2;

  const glow = ctx.createRadialGradient(cx, cy, size * 0.6, cx, cy, size * 2);
  glow.addColorStop(0, `${color}40`);
  glow.addColorStop(1, `${color}00`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, size, 0, Math.PI * 2);
  ctx.strokeStyle = HALO;
  ctx.lineWidth = 3.6;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.42)";
  ctx.lineWidth = 1;
  ctx.stroke();

  return {
    width: canvas.width,
    height: canvas.height,
    data: new Uint8ClampedArray(ctx.getImageData(0, 0, canvas.width, canvas.height).data),
  };
}

export const ARROW_SELECTED = "arrow-selected";
export const DOT_SELECTED = "dot-selected";
export const ACCENT = "#ff7a1a";

export const arrowIdFor = (status: VehicleStatus) => `arrow-${status}`;
export const dotIdFor = (status: VehicleStatus) => `dot-${status}`;

export function registerMarkerSprites(map: MapLibreMap) {
  const dpr = Math.min(3, Math.max(2, Math.round(window.devicePixelRatio || 1) * 2));
  const statuses = Object.keys(STATUS_HEX) as VehicleStatus[];

  const add = (id: string, image: ReturnType<typeof renderArrow>) => {
    if (!image || map.hasImage(id)) return;
    map.addImage(id, image, { pixelRatio: dpr });
  };

  for (const status of statuses) {
    const color = STATUS_HEX[status];
    add(arrowIdFor(status), renderArrow({ id: "", color, emphasis: false }, dpr));
    add(dotIdFor(status), renderDot(color, dpr));
  }

  add(ARROW_SELECTED, renderArrow({ id: "", color: ACCENT, emphasis: true }, dpr));
  add(DOT_SELECTED, renderDot(ACCENT, dpr));
}

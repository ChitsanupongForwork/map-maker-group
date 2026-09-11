// Isolated design fixtures, never written into the realtime vehicle store.
export const speedColors = { slow: "#16834A", medium: "#D49A00", fast: "#DC3D43" };
export const speedColor = (speed: number) => speed <= 70 ? speedColors.slow : speed <= 80 ? speedColors.medium : speedColors.fast;
const coordinates: [number, number][] = [
  [13.7465,100.5300],[13.7476,100.5298],[13.7490,100.5295],[13.7505,100.5292],
  [13.7520,100.5289],[13.7537,100.5286],[13.7554,100.5283],[13.7570,100.5280],
  [13.7587,100.5276],[13.7600,100.5273],[13.7610,100.5287],[13.7620,100.5303],
  [13.7629,100.5319],[13.7638,100.5335],[13.7647,100.5351],[13.7656,100.5367],
  [13.7664,100.5383],[13.7672,100.5399],[13.7680,100.5415],[13.7688,100.5431],
  [13.7696,100.5447],[13.7704,100.5463],[13.7712,100.5479],[13.7720,100.5495],
];
const speeds = [0,24,38,52,65,70,74,78,80,85,92,87,81,76,72,68,61,54,46,38,30,22,12,0];
export const demoRoute = coordinates.map((position, index) => ({ position, speed: speeds[index], seconds: index * 10 }));
export function timeLabel(seconds: number) {
  return `09:${String(10 + Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

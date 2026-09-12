// เวลาทั้งระบบอิงกรุงเทพฯ เสมอ เพื่อให้ผลบนเซิร์ฟเวอร์กับบนเบราว์เซอร์ตรงกัน
const TZ = "Asia/Bangkok";

const TH_TIME = new Intl.DateTimeFormat("th-TH-u-nu-latn-ca-gregory", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TZ,
});

const TH_CLOCK = new Intl.DateTimeFormat("th-TH-u-nu-latn-ca-gregory", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: TZ,
});

const TH_DATETIME = new Intl.DateTimeFormat("th-TH-u-nu-latn-ca-gregory", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TZ,
});

const NUMBER = new Intl.NumberFormat("th-TH-u-nu-latn");

export const formatTime = (value: number | Date) => TH_TIME.format(value);
export const formatClock = (value: number | Date) => TH_CLOCK.format(value);
export const formatDateTime = (value: number | Date) => TH_DATETIME.format(value);
export const formatNumber = (value: number) => NUMBER.format(value);

/** "2 นาทีที่แล้ว" — ใช้กับคอลัมน์เวลาอัพเดตล่าสุด */
export function formatAgo(from: number, now: number = Date.now()) {
  const sec = Math.max(0, Math.round((now - from) / 1000));
  if (sec < 60) return `${sec} วินาทีที่แล้ว`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} นาทีที่แล้ว`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} ชั่วโมงที่แล้ว`;
  return `${Math.round(hr / 24)} วันที่แล้ว`;
}

/** ตัดทศนิยมพิกัดให้พอดีกับการแสดงผล */
export const formatLatLng = (lat: number, lng: number) =>
  `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

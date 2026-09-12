// ประตูฝั่งเซิร์ฟเวอร์ของฟีเจอร์ fleet
// แยกจาก index.ts เพราะไฟล์นี้ลาก 'server-only' มาด้วย — ถ้ารวมไว้ที่เดียว
// client component ที่ import ฟีเจอร์นี้จะพังทันที
export { getFleetSnapshot } from "./queries";

import type { PinCategoryId } from "@/types/location";

export type PinActivity = {
  id: string;
  dateLabel: string;
  timeLabel: string;
  action: "added" | "note" | "revisited";
  title: string;
  detail: string;
  category: PinCategoryId;
};

export const pinActivity: readonly PinActivity[] = [
  { id: "activity-1", dateLabel: "วันนี้", timeLabel: "10:42", action: "added", title: "เพิ่มไอเดียทริปหน้า", detail: "เก็บไว้สำหรับวางแผนวันหยุด", category: "idea" },
  { id: "activity-2", dateLabel: "วันนี้", timeLabel: "09:18", action: "note", title: "เติมโน้ตให้มุมทำงานใหม่", detail: "มีปลั๊กและแสงช่วงบ่ายดี", category: "work" },
  { id: "activity-3", dateLabel: "เมื่อวาน", timeLabel: "16:03", action: "revisited", title: "กลับไปที่สวนเงียบ ๆ", detail: "บันทึกไว้เป็นหมุดโปรด", category: "nature" },
  { id: "activity-4", dateLabel: "เมื่อวาน", timeLabel: "11:26", action: "added", title: "เพิ่มกาแฟแสงเช้า", detail: "ไอเดียสำหรับเช้าวันเสาร์", category: "food" },
  { id: "activity-5", dateLabel: "26 ส.ค.", timeLabel: "19:40", action: "note", title: "เติมโน้ตให้นิทรรศการสุดสัปดาห์", detail: "เช็กวันเปิดก่อนออกเดินทาง", category: "culture" },
  { id: "activity-6", dateLabel: "25 ส.ค.", timeLabel: "08:55", action: "added", title: "เพิ่มจุดดูพระอาทิตย์", detail: "อยากกลับไปในช่วงปลายปี", category: "nature" },
];

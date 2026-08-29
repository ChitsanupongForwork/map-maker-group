import type { PinCategoryId } from "@/types/location";

export type PinCategory = {
  id: PinCategoryId;
  label: string;
  shortLabel: string;
  color: string;
};

export const pinCategories: readonly PinCategory[] = [
  { id: "food", label: "กิน & ดื่ม", shortLabel: "กิน", color: "#F97316" },
  { id: "culture", label: "ศิลปะ & วัฒนธรรม", shortLabel: "ศิลป์", color: "#8B5CF6" },
  { id: "nature", label: "ธรรมชาติ", shortLabel: "ธรรมชาติ", color: "#16A34A" },
  { id: "work", label: "ทำงาน & เรียนรู้", shortLabel: "งาน", color: "#0EA5E9" },
  { id: "idea", label: "ไอเดียไว้ไป", shortLabel: "ไอเดีย", color: "#E11D48" },
];

export function getPinCategory(id: PinCategoryId): PinCategory {
  return pinCategories.find((category) => category.id === id) ?? pinCategories[4];
}

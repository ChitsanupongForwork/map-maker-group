import {
  Car,
  FileBarChart,
  Map as MapIcon,
  Settings,
  Share2,
  RotateCcwClock,
  type LucideIcon,
} from "lucide-react";
import type { NavIcon } from "@/config/navigation";

/** แปลงชื่อไอคอนใน config เป็นคอมโพเนนต์จริง (config เก็บ JSX ไม่ได้) */
export const NAV_ICONS: Record<NavIcon, LucideIcon> = {
  map: MapIcon,
  history: RotateCcwClock,
  vehicles: Car,
  reports: FileBarChart,
  export: Share2,
  settings: Settings,
};

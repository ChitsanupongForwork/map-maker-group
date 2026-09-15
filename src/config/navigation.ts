/**
 * ปลายทางทั้งหมดของแอป — ประกาศที่เดียว
 * ใช้ทั้งแถบไอคอนด้านซ้ายและหน้า launchpad จะได้ไม่หลุดกัน
 */
export type NavIcon = "map" | "history" |"vehicles" | "reports" | "export" | "settings";

export type NavItem = {
  href: string;
  icon: NavIcon;
  label: string;
  labelTh: string;
  description: string;
  /** แสดงบนแถบไอคอนด้านซ้ายหรือไม่ */
  inRail: boolean;
  /** วางไว้ท้ายแถบ (เช่น ตั้งค่า) */
  footer?: boolean;
};

export const NAV_ITEMS: readonly NavItem[] = [
  {
    href: "/map",
    icon: "map",
    label: "Map",
    labelTh: "แผนที่ติดตามรถ",
    description: "ดูตำแหน่งรถทั้งกองแบบเรียลไทม์ พร้อมตัวกรองสถานะและการรวมกลุ่มหมุด",
    inRail: true,
  },
    {
    href: "/history",
    icon: "history",
    label: "history",
    labelTh: "ประวัติการขับรถ",
    description: "ดูเส้นทางที่รถคันนั้นขับได้ในช่วงเวลา 1 เดือนย้อนหลัง",
    inRail: true,
  },
  {
    href: "/vehicles",
    icon: "vehicles",
    label: "Vehicles",
    labelTh: "ทะเบียนรถ",
    description: "รายการรถทั้งหมด ค้นหาด้วยทะเบียน ดูคนขับและกลุ่มที่สังกัด",
    inRail: false,
  },
  {
    href: "/reports",
    icon: "reports",
    label: "Reports",
    labelTh: "รายงาน",
    description: "สรุปการใช้งานรถรายวัน ระยะทาง ชั่วโมงเครื่องยนต์ และสถานะข้อมูล",
    inRail: false,
  },
  {
    href: "/export",
    icon: "export",
    label: "Export",
    labelTh: "ส่งออกข้อมูล",
    description: "ดาวน์โหลดข้อมูลกองรถตามเงื่อนไขที่กรองไว้ เป็นไฟล์ Excel หรือ PDF",
    inRail: false,
  },
  {
    href: "/settings",
    icon: "settings",
    label: "Settings",
    labelTh: "ตั้งค่า",
    description: "กำหนดเกณฑ์เรียลไทม์ กลุ่มรถ พื้นที่ และการแจ้งเตือน",
    inRail: false,
    footer: true,
  },
];

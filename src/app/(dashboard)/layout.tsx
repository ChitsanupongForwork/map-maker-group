import { AppShell } from "@/features/app-shell";
import { FleetProvider } from "@/features/fleet";
import { getFleetSnapshot } from "@/features/fleet/server";

/**
 * snapshot ต้องสร้างใหม่ทุก request
 *
 * ค่าสถานะข้อมูล (เรียลไทม์ / ไม่เรียลไทม์ / ไม่อัพเดต) คำนวณจากอายุของข้อมูล
 * เทียบกับเวลาปัจจุบัน ถ้าปล่อยให้ Next prerender ไว้ตอน build เวลาใน snapshot
 * จะถูกแช่แข็งไว้ที่วันที่ deploy แล้วรถจะไหลไปกอง "ไม่อัพเดต" มากขึ้นเรื่อย ๆ
 * ตามอายุของ deployment
 */
export const dynamic = "force-dynamic";

/**
 * ดึง snapshot ครั้งเดียวที่ระดับ layout แล้วแชร์ให้ทุกหน้าในโซนนี้
 * ย้ายหน้าไปมาก็ไม่ต้องโหลดกองรถใหม่ และตัวกรองที่เลือกไว้ยังอยู่
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const snapshot = await getFleetSnapshot();

  return (
    <FleetProvider snapshot={snapshot}>
      <AppShell>{children}</AppShell>
    </FleetProvider>
  );
}

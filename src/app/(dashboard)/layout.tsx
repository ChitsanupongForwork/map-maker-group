import { AppShell } from "@/features/app-shell";
import { FleetProvider } from "@/features/fleet";
import { getFleetSnapshot } from "@/features/fleet/server";

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

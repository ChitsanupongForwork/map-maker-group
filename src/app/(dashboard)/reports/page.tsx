import { FleetFilterBar, FleetStatsGrid } from "@/features/fleet";

export const metadata = { title: "รายงาน" };

export default function ReportsPage() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-3">
      <FleetFilterBar />
      <FleetStatsGrid />
    </div>
  );
}

import { FleetFilterBar } from "@/features/fleet";
import { ExportPanel } from "@/features/fleet-export";
import { VehicleListPanel } from "@/features/vehicle-list";

export const metadata = { title: "ส่งออกข้อมูล" };

export default function ExportPage() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-3 xl:overflow-hidden">
      <FleetFilterBar />
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_420px]">
        <ExportPanel />
        <VehicleListPanel className="min-h-[420px] xl:min-h-0" />
      </div>
    </div>
  );
}

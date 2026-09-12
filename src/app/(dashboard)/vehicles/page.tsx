import { FleetFilterBar } from "@/features/fleet";
import { VehicleDetailDock } from "@/features/vehicle-detail";
import { VehicleListPanel } from "@/features/vehicle-list";

export const metadata = { title: "ทะเบียนรถ" };

export default function VehiclesPage() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-3 xl:overflow-hidden">
      <FleetFilterBar />
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[420px_minmax(0,1fr)]">
        <VehicleListPanel className="min-h-[420px] xl:min-h-0" />
        <VehicleDetailDock className="min-w-0 xl:grid-cols-1 xl:content-start" />
      </div>
    </div>
  );
}

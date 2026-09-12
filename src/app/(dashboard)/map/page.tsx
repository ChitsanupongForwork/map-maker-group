import { FleetFilterBar } from "@/features/fleet";
import { FleetMapPanel } from "@/features/fleet-map";
import { VehicleDetailDock } from "@/features/vehicle-detail";
import { VehicleListPanel } from "@/features/vehicle-list";

export const metadata = { title: "แผนที่ติดตามรถ" };

export default function MapPage() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-3 xl:overflow-hidden">
      {/* ตัว filter car */}
      <FleetFilterBar />

      <div className="grid min-h-[440px] flex-1 grid-cols-1 gap-3 xl:min-h-0 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* ตัว map  */}
        <FleetMapPanel className="min-h-[420px]" />
        <VehicleListPanel className="min-h-[360px] xl:min-h-0" />
      </div>
      <VehicleDetailDock className="shrink-0" />
    </div>
  );
}

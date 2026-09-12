"use client";

import { BellRing, FilePlus2, MapPinned } from "lucide-react";
import { ExportActions } from "@/features/fleet-export";
import { ActionRow } from "@/shared/ui/action-row";

export function VehicleActionsCard() {
  return (
    <section className="panel flex min-w-0 flex-col overflow-hidden">
      <h3 className="shrink-0 border-b border-line px-3 py-2.5 text-[12px] font-semibold tracking-tight text-content">
        Actions
      </h3>
      <div className="flex flex-col gap-0.5 p-1.5">
        <ExportActions />
        <ActionRow icon={<FilePlus2 className="size-3.5" />} label="Add to Report" />
        <ActionRow icon={<MapPinned className="size-3.5" />} label="Set Geofence" />
        <ActionRow icon={<BellRing className="size-3.5" />} label="Send Notification" />
      </div>
    </section>
  );
}

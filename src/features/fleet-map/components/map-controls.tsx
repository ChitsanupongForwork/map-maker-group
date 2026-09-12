"use client";

import { Layers, LocateFixed, Maximize2, Minus, Plus, Boxes } from "lucide-react";
import { memo } from "react";
import { cn } from "@/shared/lib/cn";
import { IconButton } from "@/shared/ui/button";
import { Segmented } from "@/shared/ui/segmented";
import { Tooltip } from "@/shared/ui/tooltip";
import type { Basemap } from "../lib/map-style";

type Props = {
  basemap: Basemap;
  onBasemapChange: (value: Basemap) => void;
  clustered: boolean;
  onClusteredChange: (value: boolean) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onFitFleet: () => void;
};

export const MapControls = memo(function MapControls({
  basemap,
  onBasemapChange,
  clustered,
  onClusteredChange,
  onZoomIn,
  onZoomOut,
  onRecenter,
  onFitFleet,
}: Props) {
  return (
    <>
      <div className="pointer-events-auto absolute top-3 left-3 z-10">
        <Segmented
          value={basemap}
          onChange={onBasemapChange}
          items={[
            {
              value: "map",
              label: (
                <>
                  <Layers className="size-3.5" />
                  Map
                </>
              ),
            },
            { value: "satellite", label: "Satellite" },
          ]}
        />
      </div>

      <div className="pointer-events-auto absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
        <Tooltip label="กลับไปมุมมองเริ่มต้น" side="top">
          <IconButton label="กลับไปมุมมองเริ่มต้น" onClick={onRecenter}>
            <LocateFixed className="size-4" />
          </IconButton>
        </Tooltip>
        <div className="flex flex-col overflow-hidden rounded-[10px] border border-line bg-surface-2/80 backdrop-blur">
          <button
            onClick={onZoomIn}
            aria-label="ซูมเข้า"
            className="grid size-9 place-items-center text-muted transition-colors hover:bg-surface-3 hover:text-content"
          >
            <Plus className="size-4" />
          </button>
          <span className="h-px bg-line" />
          <button
            onClick={onZoomOut}
            aria-label="ซูมออก"
            className="grid size-9 place-items-center text-muted transition-colors hover:bg-surface-3 hover:text-content"
          >
            <Minus className="size-4" />
          </button>
        </div>
        <Tooltip label="ย่อให้เห็นรถทุกคัน" side="top">
          <IconButton label="ย่อให้เห็นรถทุกคัน" onClick={onFitFleet}>
            <Maximize2 className="size-4" />
          </IconButton>
        </Tooltip>
      </div>

      <div className="pointer-events-auto absolute right-3 bottom-9 z-10">
        <button
          type="button"
          onClick={() => onClusteredChange(!clustered)}
          aria-pressed={clustered}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-medium",
            "backdrop-blur transition-colors duration-150",
            clustered
              ? "border-transparent bg-[var(--accent)] text-[#160800] shadow-[0_10px_30px_-12px_rgba(255,122,26,0.9)]"
              : "border-line bg-surface-2/85 text-muted hover:text-content",
          )}
        >
          <Boxes className="size-4" />
          Cluster
        </button>
      </div>
    </>
  );
});

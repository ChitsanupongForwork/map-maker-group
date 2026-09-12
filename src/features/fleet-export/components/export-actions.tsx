"use client";

import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import {
  DATA_STATUS_META,
  STATUS_META,
  useFleet,
  type FleetOption,
} from "@/features/fleet";
import { formatDateTime } from "@/shared/lib/format";
import { ActionRow } from "@/shared/ui/action-row";
import { toExportRows } from "../lib/to-rows";

type Format = "xlsx" | "pdf";

const labelOf = (options: readonly FleetOption[], value: string) =>
  value === "all" ? "" : (options.find((option) => option.value === value)?.label ?? value);

function stampedName(format: Format, now: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(
    now.getHours(),
  )}${pad(now.getMinutes())}`;
  return `fleet-report-${stamp}.${format}`;
}

export function ExportActions() {
  const { view, snapshot, filter } = useFleet();
  const [busy, setBusy] = useState<Format | null>(null);

  const download = useCallback(
    async (format: Format) => {
      if (busy) return;
      setBusy(format);
      try {
        const parts = [
          filter.status !== "all" ? `สถานะรถ: ${STATUS_META[filter.status].label}` : "",
          filter.dataStatus !== "all"
            ? `สถานะข้อมูล: ${DATA_STATUS_META[filter.dataStatus].label}`
            : "",
          labelOf(snapshot.groups, filter.groupId) && `กลุ่ม: ${labelOf(snapshot.groups, filter.groupId)}`,
          labelOf(snapshot.drivers, filter.driverId) &&
            `คนขับ: ${labelOf(snapshot.drivers, filter.driverId)}`,
          labelOf(snapshot.areas, filter.areaId) && `พื้นที่: ${labelOf(snapshot.areas, filter.areaId)}`,
          filter.search.trim() ? `ค้นหา: ${filter.search.trim()}` : "",
        ].filter(Boolean);

        const response = await fetch("/api/fleet/export", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            format,
            generatedAt: formatDateTime(Date.now()),
            filterSummary: parts.length ? `เงื่อนไข — ${parts.join(" · ")}` : "เงื่อนไข: ทั้งหมด",
            rows: toExportRows(view.vehicles, view.dataStatusById, snapshot),
          }),
        });

        if (!response.ok) throw new Error(`export failed: ${response.status}`);

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = stampedName(format, new Date());
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
      } finally {
        setBusy(null);
      }
    },
    [busy, filter, snapshot, view.dataStatusById, view.vehicles],
  );

  const empty = view.vehicles.length === 0;

  return (
    <>
      <ActionRow
        tone="excel"
        disabled={empty || busy !== null}
        onClick={() => download("xlsx")}
        icon={
          busy === "xlsx" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <FileSpreadsheet className="size-3.5" />
          )
        }
        label="Export to Excel"
      />
      <ActionRow
        tone="pdf"
        disabled={empty || busy !== null}
        onClick={() => download("pdf")}
        icon={
          busy === "pdf" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <FileText className="size-3.5" />
          )
        }
        label="Export to PDF"
      />
    </>
  );
}

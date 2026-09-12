import "server-only";
import { exportRequestSchema } from "../schema";
import { buildFleetPdf } from "./build-pdf";
import { buildFleetXlsx } from "./build-xlsx";

const CONTENT_TYPE = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
} as const;

export type ExportResult =
  | { ok: true; body: Buffer; contentType: string; filename: string }
  | { ok: false; issues: string[] };

/** ตรวจ payload แล้วค่อยสร้างไฟล์ — route handler มีหน้าที่แค่ห่อเป็น Response */
export async function createExportFile(input: unknown): Promise<ExportResult> {
  const parsed = exportRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, issues: parsed.error.issues.map((issue) => issue.message) };
  }

  const payload = parsed.data;
  const body =
    payload.format === "xlsx"
      ? await buildFleetXlsx(payload)
      : await buildFleetPdf(payload);

  return {
    ok: true,
    body,
    contentType: CONTENT_TYPE[payload.format],
    filename: `fleet-report.${payload.format}`,
  };
}

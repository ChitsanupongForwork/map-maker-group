import { createExportFile } from "@/features/fleet-export/server";

// pdf-lib กับ exceljs ต้องการ Node runtime (ใช้ Buffer และอ่านไฟล์ฟอนต์จากดิสก์)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const result = await createExportFile(await request.json().catch(() => null));

  if (!result.ok) {
    return Response.json(
      { error: "payload ไม่ถูกต้อง", issues: result.issues },
      { status: 400 },
    );
  }

  return new Response(new Uint8Array(result.body), {
    headers: {
      "content-type": result.contentType,
      "content-disposition": `attachment; filename="${result.filename}"`,
      "cache-control": "no-store",
    },
  });
}

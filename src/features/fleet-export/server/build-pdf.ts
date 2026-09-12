import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { ExportRequest, ExportRow } from "../schema";

/* A4 แนวนอน */
const PAGE = { width: 841.89, height: 595.28 };
const MARGIN = 28;
const ROW_HEIGHT = 16;
const HEADER_HEIGHT = 20;

const INK = rgb(0.05, 0.08, 0.11);
const MUTED = rgb(0.42, 0.46, 0.52);
const ACCENT = rgb(1, 0.478, 0.102);
const STRIPE = rgb(0.957, 0.965, 0.976);
const LINE = rgb(0.85, 0.87, 0.9);

type Column = { key: keyof ExportRow; header: string; width: number; align?: "right" };

/** คอลัมน์ชุดย่อสำหรับกระดาษ — เลือกเฉพาะที่คนอ่านรายงานต้องเห็น */
const COLUMNS: readonly Column[] = [
  { key: "plate", header: "ทะเบียน", width: 64 },
  { key: "label", header: "รุ่นรถ", width: 86 },
  { key: "status", header: "สถานะรถ", width: 68 },
  { key: "dataStatus", header: "สถานะข้อมูล", width: 70 },
  { key: "speedKph", header: "ความเร็ว", width: 50, align: "right" },
  { key: "lastUpdate", header: "อัพเดตล่าสุด", width: 78 },
  { key: "driverName", header: "คนขับ", width: 90 },
  { key: "groupName", header: "กลุ่ม", width: 68 },
  { key: "areaName", header: "พื้นที่", width: 70 },
  { key: "address", header: "ตำแหน่งล่าสุด", width: 141 },
];

const FONT_DIR = path.join(process.cwd(), "src", "server", "fonts");
let fontCache: { regular: Uint8Array; semibold: Uint8Array } | null = null;

/**
 * ต้องฝังฟอนต์ไทยเอง — ฟอนต์มาตรฐานของ PDF ไม่มีสระและวรรณยุกต์ไทย
 * fontkit จัดตำแหน่งวรรณยุกต์ให้ตาม GPOS ของฟอนต์ ข้อความจึงไม่ลอย
 */
async function loadFonts() {
  if (!fontCache) {
    const [regular, semibold] = await Promise.all([
      readFile(path.join(FONT_DIR, "NotoSansThai-Regular.ttf")),
      readFile(path.join(FONT_DIR, "NotoSansThai-SemiBold.ttf")),
    ]);
    fontCache = { regular, semibold };
  }
  return fontCache;
}

/** ตัดข้อความให้พอดีช่อง แล้วเติม … ท้ายบรรทัด */
function fit(text: string, font: PDFFont, size: number, maxWidth: number) {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let value = text;
  while (value.length > 1 && font.widthOfTextAtSize(`${value}…`, size) > maxWidth) {
    value = value.slice(0, -1);
  }
  return `${value}…`;
}

function drawRow(
  page: PDFPage,
  row: ExportRow,
  y: number,
  font: PDFFont,
  size: number,
) {
  let x = MARGIN;
  for (const column of COLUMNS) {
    const raw = String(row[column.key] ?? "");
    const text = fit(raw, font, size, column.width - 8);
    const width = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: column.align === "right" ? x + column.width - 6 - width : x + 4,
      y: y + 5,
      size,
      font,
      color: INK,
    });
    x += column.width;
  }
}

function drawTableHead(page: PDFPage, y: number, font: PDFFont) {
  page.drawRectangle({
    x: MARGIN,
    y,
    width: PAGE.width - MARGIN * 2,
    height: HEADER_HEIGHT,
    color: rgb(0.055, 0.078, 0.11),
  });
  page.drawRectangle({
    x: MARGIN,
    y: y - 1.4,
    width: PAGE.width - MARGIN * 2,
    height: 1.4,
    color: ACCENT,
  });

  let x = MARGIN;
  for (const column of COLUMNS) {
    const text = fit(column.header, font, 8.5, column.width - 8);
    const width = font.widthOfTextAtSize(text, 8.5);
    page.drawText(text, {
      x: column.align === "right" ? x + column.width - 6 - width : x + 4,
      y: y + 6,
      size: 8.5,
      font,
      color: rgb(1, 1, 1),
    });
    x += column.width;
  }
}

export async function buildFleetPdf(payload: ExportRequest): Promise<Buffer> {
  const { regular, semibold } = await loadFonts();
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const body = await pdf.embedFont(regular, { subset: true });
  const bold = await pdf.embedFont(semibold, { subset: true });

  pdf.setTitle("รายงานสถานะกองรถ · TrackMate");
  pdf.setProducer("TrackMate");
  pdf.setCreationDate(new Date());

  const rowsPerPage = Math.floor(
    (PAGE.height - MARGIN * 2 - 86 - HEADER_HEIGHT) / ROW_HEIGHT,
  );
  const pageCount = Math.max(1, Math.ceil(payload.rows.length / rowsPerPage));

  for (let index = 0; index < pageCount; index++) {
    const page = pdf.addPage([PAGE.width, PAGE.height]);
    const slice = payload.rows.slice(index * rowsPerPage, (index + 1) * rowsPerPage);

    if (index === 0) {
      page.drawText("รายงานสถานะกองรถ", {
        x: MARGIN,
        y: PAGE.height - MARGIN - 14,
        size: 17,
        font: bold,
        color: INK,
      });
      page.drawText("TrackMate · Real-time Vehicle Tracking", {
        x: MARGIN,
        y: PAGE.height - MARGIN - 30,
        size: 9,
        font: body,
        color: ACCENT,
      });
      page.drawText(
        `ออกรายงานเมื่อ ${payload.generatedAt} · ทั้งหมด ${payload.rows.length} คัน`,
        { x: MARGIN, y: PAGE.height - MARGIN - 46, size: 9, font: body, color: MUTED },
      );
      page.drawText(fit(payload.filterSummary || "เงื่อนไข: ทั้งหมด", body, 9, 780), {
        x: MARGIN,
        y: PAGE.height - MARGIN - 60,
        size: 9,
        font: body,
        color: MUTED,
      });
    } else {
      page.drawText("รายงานสถานะกองรถ (ต่อ)", {
        x: MARGIN,
        y: PAGE.height - MARGIN - 14,
        size: 12,
        font: bold,
        color: INK,
      });
    }

    const headY = PAGE.height - MARGIN - (index === 0 ? 86 : 46) - HEADER_HEIGHT;
    drawTableHead(page, headY, bold);

    slice.forEach((row, position) => {
      const y = headY - (position + 1) * ROW_HEIGHT;
      if (position % 2 === 1) {
        page.drawRectangle({
          x: MARGIN,
          y,
          width: PAGE.width - MARGIN * 2,
          height: ROW_HEIGHT,
          color: STRIPE,
        });
      }
      drawRow(page, row, y, body, 8.5);
    });

    const footY = MARGIN - 6;
    page.drawRectangle({
      x: MARGIN,
      y: footY + 12,
      width: PAGE.width - MARGIN * 2,
      height: 0.6,
      color: LINE,
    });
    const label = `หน้า ${index + 1} / ${pageCount}`;
    page.drawText(label, {
      x: PAGE.width - MARGIN - body.widthOfTextAtSize(label, 8),
      y: footY,
      size: 8,
      font: body,
      color: MUTED,
    });
  }

  return Buffer.from(await pdf.save());
}

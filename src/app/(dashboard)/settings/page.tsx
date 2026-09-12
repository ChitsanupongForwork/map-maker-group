import { Clock3, Radio, SatelliteDish } from "lucide-react";
import { site } from "@/config/site";

export const metadata = { title: "ตั้งค่า" };

const CARDS = [
  {
    icon: Radio,
    title: "เกณฑ์ข้อมูลเรียลไทม์",
    value: `${site.realtimeWindowSec} วินาที`,
    detail: "ข้อมูลที่เข้ามาภายในช่วงนี้จะถูกนับว่า “เรียลไทม์”",
  },
  {
    icon: Clock3,
    title: "เกณฑ์ข้อมูลไม่อัพเดต",
    value: `${site.staleWindowSec / 60} นาที`,
    detail: "เกินช่วงนี้จะถูกจัดเป็น “ไม่อัพเดต” และขึ้นป้ายเตือนในรายการ",
  },
  {
    icon: SatelliteDish,
    title: "จังหวะรับข้อมูลสด",
    value: `${site.liveTickMs / 1000} วินาที`,
    detail: "ความถี่ที่หน้าจอดึงตำแหน่งและสถานะรถชุดใหม่เข้ามา",
  },
];

export default function SettingsPage() {
  return (
    <div className="h-full overflow-y-auto p-3">
      <div className="mx-auto flex w-full max-w-[840px] flex-col gap-4 py-2">
        <header className="flex flex-col gap-1">
          <h1 className="text-[18px] font-semibold tracking-tight text-content">ตั้งค่าระบบ</h1>
          <p className="text-[12px] text-muted">
            ค่าเหล่านี้กำหนดไว้ที่ <code className="text-[var(--accent)]">src/config/site.ts</code>{" "}
            และมีผลกับทุกหน้าในระบบ
          </p>
        </header>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {CARDS.map((card) => (
            <div key={card.title} className="panel flex flex-col gap-2.5 p-3.5">
              <span className="grid size-8 place-items-center rounded-lg border border-line bg-surface-2 text-[var(--accent)]">
                <card.icon className="size-4" />
              </span>
              <span className="text-[12px] text-muted">{card.title}</span>
              <span className="text-[20px] leading-none font-semibold tracking-tight text-content">
                {card.value}
              </span>
              <span className="text-[11px] leading-relaxed text-dim">{card.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

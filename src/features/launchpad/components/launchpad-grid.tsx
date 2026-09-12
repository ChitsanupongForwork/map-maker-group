import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NAV_ITEMS } from "@/config/navigation";
import { site } from "@/config/site";
import { cn } from "@/shared/lib/cn";
import { formatNumber } from "@/shared/lib/format";
import { NAV_ICONS } from "@/features/app-shell";
import type { LaunchpadStat } from "../lib/stats";

/**
 * หน้าแรกก่อนเข้าใช้งานจริง — ไม่มีแถบซ้าย มีแค่ทางเข้าของแต่ละส่วน
 * เป็น server component ล้วน จึงไม่มี JS ของหน้านี้ถูกส่งไปที่เบราว์เซอร์เลย
 */
export function LaunchpadGrid({ stats }: { stats: readonly LaunchpadStat[] }) {
  return (
    <div className="app-aurora relative min-h-dvh overflow-x-hidden">
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1180px] flex-col gap-10 px-6 py-14 sm:py-20">
        <header className="flex flex-col gap-5">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3 py-1.5 text-[11px] font-medium text-[var(--accent)]">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--accent)] opacity-70" />
              <span className="relative size-1.5 rounded-full bg-[var(--accent)]" />
            </span>
            ระบบพร้อมใช้งาน · ข้อมูลอัพเดตทุก {site.liveTickMs / 1000} วินาที
          </span>

          <div className="flex flex-col gap-3">
            <h1 className="text-[40px] leading-[1.08] font-semibold tracking-tight text-content sm:text-[52px]">
              {site.name}
              <span className="ml-3 text-[var(--accent)]">.</span>
            </h1>
            <p className="max-w-[46ch] text-[15px] leading-relaxed text-muted">
              ศูนย์กลางติดตามรถแบบเรียลไทม์ — เลือกส่วนที่ต้องการใช้งานเพื่อเริ่มต้น
            </p>
          </div>

          <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="panel flex flex-col gap-1 px-3.5 py-3"
              >
                <dt className="flex items-center gap-1.5 text-[11px] text-dim">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: stat.color, boxShadow: `0 0 8px ${stat.color}80` }}
                  />
                  {stat.label}
                </dt>
                <dd className="text-[22px] leading-none font-semibold tracking-tight text-content tabular-nums">
                  {formatNumber(stat.value)}
                </dd>
              </div>
            ))}
          </dl>
        </header>

        <nav aria-label="เลือกหน้าที่ต้องการใช้งาน" className="grid gap-3.5 sm:grid-cols-2">
          {NAV_ITEMS.map((item, index) => {
            const Icon = NAV_ICONS[item.icon];
            const featured = index === 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group panel relative flex flex-col gap-3 overflow-hidden p-5 transition-[transform,border-color] duration-200",
                  "hover:-translate-y-0.5 hover:border-[var(--accent-line)]",
                  featured && "sm:col-span-2",
                )}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-24 -right-16 size-56 rounded-full bg-[radial-gradient(closest-side,rgba(255,122,26,0.16),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <span className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl border border-line bg-surface-2 text-[var(--accent)] transition-colors duration-200 group-hover:border-[var(--accent-line)] group-hover:bg-[var(--accent-soft)]">
                    <Icon className="size-[19px]" />
                  </span>
                  <ArrowUpRight className="size-4 text-dim transition-colors duration-200 group-hover:text-[var(--accent)]" />
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="flex items-baseline gap-2">
                    <span className="text-[17px] font-semibold tracking-tight text-content">
                      {item.labelTh}
                    </span>
                    <span className="text-[11px] tracking-wide text-dim uppercase">
                      {item.label}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "text-[13px] leading-relaxed text-muted",
                      featured ? "max-w-[62ch]" : "max-w-[42ch]",
                    )}
                  >
                    {item.description}
                  </span>
                </span>
                  {
                    item.inRail ? 
                    <span className="text-[#339900] border-[1px border green] w-fit  py-[5px] px-[10px] rounded-xl text-[12px]">Ready for use</span>: 
                    <span className="text-[red] border-[1px border red] w-fit  py-[5px] px-[10px] rounded-xl text-[12px]"> Not Ready for use</span> 
                  }
              </Link>
            );
          })}
        </nav>

        <footer className="mt-auto pt-4 text-[11px] text-dim">
          {site.name} · {site.tagline}
        </footer>
      </div>
    </div>
  );
}

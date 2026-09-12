"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin } from "lucide-react";
import { NAV_ITEMS } from "@/config/navigation";
import { cn } from "@/shared/lib/cn";
import { Tooltip } from "@/shared/ui/tooltip";
import { NAV_ICONS } from "../lib/nav-icons";

function RailLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: (typeof NAV_ICONS)[keyof typeof NAV_ICONS];
  active: boolean;
}) {
  return (
    <Tooltip label={label}>
      <Link
        href={href}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative grid size-11 place-items-center rounded-xl transition-colors duration-150",
          active
            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
            : "text-dim hover:bg-surface-2 hover:text-content",
        )}
      >
        {active ? (
          <span className="absolute top-1/2 -left-3 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--accent)]" />
        ) : null}
        <Icon className="size-[18px]" />
      </Link>
    </Tooltip>
  );
}

/** แถบซ้าย: ไอคอนล้วนตามที่ตกลงกันไว้ ชื่อเมนูโผล่เป็น tooltip ตอน hover */
export function SidebarRail() {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.inRail);
  const main = items.filter((item) => !item.footer);
  const footer = items.filter((item) => item.footer);

  return (
    <nav
      aria-label="เมนูหลัก"
      className="z-30 flex w-[var(--rail-w)] shrink-0 flex-col items-center gap-1 border-r border-line bg-[rgba(9,13,19,0.72)] py-3 backdrop-blur-xl"
    >
      <Tooltip label="กลับหน้าแรก">
        <Link
          href="/"
          aria-label="กลับหน้าแรก"
          className="mb-2 grid size-11 place-items-center rounded-xl bg-[linear-gradient(145deg,#ff9145,#e2620a)] text-[#160800] shadow-[0_10px_26px_-12px_rgba(255,122,26,0.95)] transition-transform duration-150 hover:scale-[1.04]"
        >
          <MapPin className="size-[19px]" />
        </Link>
      </Tooltip>

      <span className="mb-1 h-px w-8 bg-line" />

      {main.map((item) => (
        <RailLink
          key={item.href}
          href={item.href}
          label={item.labelTh}
          icon={NAV_ICONS[item.icon]}
          active={pathname.startsWith(item.href)}
        />
      ))}

      <div className="mt-auto flex flex-col items-center gap-1">
        {footer.map((item) => (
          <RailLink
            key={item.href}
            href={item.href}
            label={item.labelTh}
            icon={NAV_ICONS[item.icon]}
            active={pathname.startsWith(item.href)}
          />
        ))}
      </div>
    </nav>
  );
}

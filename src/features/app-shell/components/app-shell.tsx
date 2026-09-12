import type { ReactNode } from "react";
import { SidebarRail } from "./sidebar-rail";
import { Topbar } from "./topbar";

/** โครงหน้าจอของโซน dashboard: แถบไอคอนซ้าย + แถบบน + เนื้อหา */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-aurora relative flex h-dvh overflow-hidden">
      <SidebarRail />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}

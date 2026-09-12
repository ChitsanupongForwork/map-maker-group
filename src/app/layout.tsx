import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoThai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: "ระบบติดตามตำแหน่งรถแบบเรียลไทม์ พร้อมตัวกรองสถานะรถและสถานะข้อมูล",
};

export const viewport: Viewport = {
  themeColor: "#06090d",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${inter.variable} ${notoThai.variable} h-full`}>
      <head>
        {/* เชื่อมต่อโดเมนไทล์ล่วงหน้า ภาพแผนที่จะขึ้นเร็วขึ้นตอนเปิดหน้าแรก */}
        <link rel="preconnect" href="https://a.basemaps.cartocdn.com" crossOrigin="" />
        <link rel="preconnect" href="https://b.basemaps.cartocdn.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://fonts.openmaptiles.org" />
      </head>
      <body className="min-h-full bg-bg text-content antialiased">{children}</body>
    </html>
  );
}

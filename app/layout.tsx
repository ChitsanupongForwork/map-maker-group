import type { Metadata } from "next";
import { Anuphan, IBM_Plex_Sans_Thai, JetBrains_Mono } from "next/font/google";

import FleetConnectionErrorDialog from "@/components/fleet/FleetConnectionErrorDialog";
import FleetRealtimeConnection from "@/components/fleet/FleetRealtimeConnection";
import MuiProvider from "@/components/providers/MuiProvider";

import "./globals.css";

// Self-hosted through next/font: no render-blocking request to Google and no
// layout shift when the faces swap in.
const body = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const display = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

const data = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-data",
  display: "swap",
});

export const metadata: Metadata = { title: "Fleet Monitor — Vehicle Tracking Portfolio", description: "An independent fleet-monitoring portfolio concept using simulated data." };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`h-full antialiased ${body.variable} ${display.variable} ${data.variable}`}>
      <body className="min-h-full flex flex-col">
        <MuiProvider>
          {/* Every page reads the same fleet store, so the connection and its
              error dialog live here rather than inside one page. */}
          <FleetRealtimeConnection />
          {children}
          <FleetConnectionErrorDialog />
        </MuiProvider>
      </body>
    </html>
  );
}

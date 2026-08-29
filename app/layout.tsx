import type { Metadata } from "next";

import MuiProvider from "@/components/providers/MuiProvider";

import "./globals.css";

export const metadata: Metadata = { title: "Fleet Monitor — Vehicle Tracking Portfolio", description: "An independent fleet-monitoring portfolio concept using simulated data." };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <MuiProvider>{children}</MuiProvider>
      </body>
    </html>
  );
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // exceljs and pdf-lib read/stream binary data with Node built-ins; keeping
  // them external stops the bundler from trying to inline that machinery.
  serverExternalPackages: ["exceljs"],
  // The PDF exporter loads its Thai font from disk at request time, so the
  // file has to travel with the server bundle.
  outputFileTracingIncludes: {
    "/api/fleet/export": ["./src/server/fonts/**"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;

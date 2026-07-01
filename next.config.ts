import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Chromium must stay as a real Node dependency so its compressed binaries
  // are copied into the serverless function instead of relocated by Turbopack.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core", "firebase-admin"],
  outputFileTracingIncludes: {
    "/api/generate-pdf": ["./node_modules/@sparticuz/chromium/bin/**"],
    "/api/email-pdf": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
  images: {
    // The hero poster (and other brand assets) are served from the 434
    // Firebase Storage bucket — allow next/image to load them.
    remotePatterns: [{ protocol: "https", hostname: "storage.googleapis.com" }],
  },
}

export default nextConfig

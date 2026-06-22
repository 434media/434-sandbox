import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // The hero poster (and other brand assets) are served from the 434
    // Firebase Storage bucket — allow next/image to load them.
    remotePatterns: [{ protocol: "https", hostname: "storage.googleapis.com" }],
  },
}

export default nextConfig

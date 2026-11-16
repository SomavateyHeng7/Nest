import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enables forbidden()/unauthorized() and the forbidden.tsx / unauthorized.tsx pages (401/403).
    authInterrupts: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

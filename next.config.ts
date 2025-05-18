import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // tambahin config lain kalo ada, misal:
  // images: { domains: ["firebasestorage.googleapis.com"] }
};

export default nextConfig;

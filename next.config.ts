import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allow production builds despite ESLint issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds despite type errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

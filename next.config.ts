import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // This line disables ESLint blocking your build
  },
  // ...other config options here
};

export default nextConfig;

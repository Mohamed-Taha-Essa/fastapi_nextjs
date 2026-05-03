import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for the multi-stage Dockerfile — produces a minimal self-contained server.js
  output: "standalone",
};

export default nextConfig;

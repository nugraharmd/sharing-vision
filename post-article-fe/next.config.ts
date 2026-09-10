import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // required by Dockerfile (runner stage)
};

export default nextConfig;

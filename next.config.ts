import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 这里不要有 "middleware": ... 这样的代码
  // 也不要有 "swcMinify": ... (新版默认开启，写了有时也会报警告)
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // This repo keeps its own CLAUDE.md, so stop `next dev` from rewriting agent files.
  agentRules: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Demo sandbox: keep every page out of search engines.
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://app.dynamic.xyz https://cdn.jsdelivr.net",
              "style-src-elem 'self' 'unsafe-inline' https://app.dynamic.xyz https://cdn.jsdelivr.net",
              "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https:",
              "frame-src 'self' https:",
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
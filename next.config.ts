import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_STATIC_EXPORT === 'true';
const isProduction = process.env.NODE_ENV === 'production';

const config: NextConfig = {
  reactStrictMode: true,
  ...(isStaticExport && {
    output: 'export',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    ...(isProduction && {
      basePath: '/plugins-doc-site',
      assetPrefix: '/plugins-doc-site',
    }),
  }),
  images: {
    unoptimized: isStaticExport, // Only unoptimize for static export
    remotePatterns: [
      {
        hostname: "nextjs.org",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default config;

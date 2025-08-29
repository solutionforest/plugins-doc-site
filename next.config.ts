import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true";
const isProduction = process.env.NODE_ENV === "production";

// GitHub Pages configuration
const basePath = isProduction && isStaticExport ? (process.env.NEXT_PUBLIC_BASE_PATH || "/plugins-doc-site") : "";

const config: NextConfig = {
  reactStrictMode: true,
  ...(isStaticExport && {
    output: "export",
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    ...(isProduction && {
      basePath: basePath,
      assetPrefix: basePath,
    }),
  }),
  images: {
    unoptimized: isStaticExport, // Only unoptimize for static export
    remotePatterns: [
      {
        hostname: "github.com",
      },
      {
        hostname: "shields.io",
      },
      {
        hostname: "img.shields.io",
      },
      {
        hostname: "demo.solutionforest.net",
      },
      {
        hostname: "user-images.githubusercontent.com",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Optimize GitHub API calls with environment variables
  env: {
    GITHUB_API_CACHE_TTL: "3600", // 1 hour
    GITHUB_RATE_LIMIT_MAX: "50",
  },
  // webpack: (config, { isServer }) => {
  //   // Prevent shiki from being externalized
  //   if (!isServer) {
  //     config.externals = config.externals || [];
  //     config.externals.push({
  //       shiki: 'shiki'
  //     });
  //   }
    
  //   return config;
  // },
  // // Alternative approach - mark shiki as not external
  // serverExternalPackages: ['shiki'],
};

export default config;
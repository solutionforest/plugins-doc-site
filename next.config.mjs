import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true";
const isProd = process.env.NODE_ENV === "production";

console.debug("Next.js Configuration:");
console.debug(`  isProd: ${isProd}`);
console.debug(`  isStaticExport: ${isStaticExport}`);

// GitHub Pages configuration
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/plugins-doc-site";

/** @type {import('next').NextConfig} */
const config = {
  output: "export",
  reactStrictMode: true,

  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  basePath: basePath,
  assetPrefix: basePath,

  images: {
    unoptimized: true, // isStaticExport, // Only unoptimize for static export
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

export default withMDX(config);

/** @type {import('next').NextConfig} */

const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true";
const isProd = process.env.NODE_ENV === "production";

// GitHub Pages configuration
const basePath = isProd && isStaticExport ? "/plugins-doc-site" : "";

const nextConfig = {
  reactStrictMode: true,
  ...(isStaticExport && {
    output: "export",
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    basePath: basePath,
    assetPrefix: basePath,
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
  webpack: (config, { isServer }) => {
    // Prevent shiki from being externalized
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        shiki: 'shiki'
      });
    }
    
    return config;
  },
  // Alternative approach - mark shiki as not external
  serverExternalPackages: ['shiki'],
};

module.exports = nextConfig;

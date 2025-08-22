/** @type {import('next').NextConfig} */

const isStaticExport = process.env.NEXT_STATIC_EXPORT === 'true';
const isProd = process.env.NODE_ENV === 'production';

// GitHub Pages configuration
const basePath = isProd && isStaticExport ? '/plugins-doc-site' : '';

const nextConfig = {
    reactStrictMode: true,
    ...(isStaticExport && {
        output: 'export',
        trailingSlash: true,
        skipTrailingSlashRedirect: true,
        basePath: basePath,
        assetPrefix: basePath,
    }),
    images: {
        unoptimized: isStaticExport, // Only unoptimize for static export
        remotePatterns: [{
            hostname: "nextjs.org",
        }, ],
    },
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
};

module.exports = nextConfig;
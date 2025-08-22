/** @type {import('next').NextConfig} */

const isStaticExport = process.env.NEXT_STATIC_EXPORT === 'true';

const nextConfig = {
    reactStrictMode: true,
    ...(isStaticExport && {
        output: 'export',
        trailingSlash: true,
        skipTrailingSlashRedirect: true,
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
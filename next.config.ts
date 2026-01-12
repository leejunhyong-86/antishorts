/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/videos/:path*',
                destination: '/downloads/:path*',
            },
        ];
    },
};

export default nextConfig;

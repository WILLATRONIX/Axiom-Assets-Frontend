/** @type {import('next').NextConfig} */

const nextConfig = {
    async redirects() {
        return [
            {
                source: '/',
                destination: '/browse',
                permanent: false,
            },
        ];
    },
};

export default nextConfig;
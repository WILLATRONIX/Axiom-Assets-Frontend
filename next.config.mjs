/** @type {import('next').NextConfig} */

const nextConfig = {
	output: 'standalone',
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
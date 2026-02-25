/** @type {import('next').NextConfig} */

const nextConfig = {
	async redirects() {
		return [
			{
				source: "/",
				destination: "/browse",
				permanent: false,
			},
		];
	},

	async rewrites() {
		return [
			{
				source: "/.well-known/microsoft-identity-association",
				destination: "/.well-known/microsoft-identity-association.json",
			},
			{
				source: "/.well-known/microsoft-identity-association/",
				destination: "/.well-known/microsoft-identity-association.json",
			},
		];
	},

	images: {
		remotePatterns: [new URL("https://cdn.axiomassets.net/**")],
	},
};

export default nextConfig;

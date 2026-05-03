/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "files.easy-orders.net" },
      { protocol: "https", hostname: "easyorders.fra1.digitaloceanspaces.com" },
    ],
  },
  async redirects() {
    return [
      // Pre-launch redirect: keep legacy EO URLs valid post-cutover
      { source: "/pages/winter-collection", destination: "/collections/hoodies", permanent: true },
      { source: "/pages/refund-policy", destination: "/pages/faq#returns", permanent: true },
    ];
  },
};

export default nextConfig;

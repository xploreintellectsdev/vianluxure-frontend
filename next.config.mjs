/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "192.168.0.24",
        port: "5000",
        pathname: "/uploads/**",
      },

      // Production backend
      {
        protocol: "https",
        hostname: "api.vianluxure.com",
        pathname: "/uploads/**",
      },
    ],
    unoptimized: true,
  },

  // Only relevant during local development
  allowedDevOrigins: ["192.168.0.24"],

  // ICICI Payment Gateway domain validation
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
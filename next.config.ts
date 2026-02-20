import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  
  reactStrictMode: false,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
    unoptimized: true,
  },
  
  // Reducir tamaño del bundle
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'framer-motion'
    ],
  },
};

export default nextConfig;

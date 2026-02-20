import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages maneja su propio output
  // output: "standalone", // Comentado para Cloudflare
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  reactStrictMode: false,
  
  // Configuración de imágenes para Cloudflare
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: '*.cloudflare.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
    ],
    // Usar configuración de imagen por defecto (compatible con CF)
    unoptimized: false,
  },
  
  // Configuración experimental necesaria para Cloudflare Pages
  experimental: {
    // Habilitar características necesarias para edge runtime
  },
};

export default nextConfig;

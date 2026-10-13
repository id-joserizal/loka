import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images from any HTTPS source (Supabase Storage, avatars, etc.)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Use WebP format for all images
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;

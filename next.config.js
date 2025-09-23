// next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Map Vercel’s injected SUPABASE_URL → NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'elnwy0xndspvgnal.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    const realtimeModuleEntry = path.resolve(
      __dirname,
      'node_modules/@supabase/realtime-js/dist/module/index.js',
    );

    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@supabase/realtime-js': realtimeModuleEntry,
      '@supabase/realtime-js/dist/main': realtimeModuleEntry,
      '@supabase/realtime-js/dist/main/index.js': realtimeModuleEntry,
      '@supabase/realtime-js/dist/module': realtimeModuleEntry,
      '@supabase/realtime-js/dist/module/index.js': realtimeModuleEntry,
    };

    return config;
  },
};

module.exports = nextConfig;

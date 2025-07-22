// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Map Vercel’s injected SUPABASE_URL → NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
  images: {
    remotePatterns: [new URL('https://elnwy0xndspvgnal.public.blob.vercel-storage.com/**')],
  },
  webpack: (config) => {
    // Use the ESM build of realtime-js to avoid dynamic require warnings
    config.resolve = config.resolve || {};
    // Silence "Critical dependency" warnings from realtime-js
    config.module.exprContextCritical = false;
    return config;
  },
};

module.exports = nextConfig;

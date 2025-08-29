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
    remotePatterns: [
      new URL('https://elnwy0xndspvgnal.public.blob.vercel-storage.com/**'),
      new URL('https://placehold.co/**'),
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [
      '@supabase/auth-helpers-nextjs',
      '@supabase/supabase-js',
    ],
  },
};

module.exports = nextConfig;

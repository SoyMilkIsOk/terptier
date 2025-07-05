'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center text-center min-h-[calc(100vh-80px)] overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-rainbow-animated" />
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-white text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg"
      >
        TerpTier
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="text-white text-xl md:text-2xl font-medium mb-2"
      >
        Top Tier Terps, Colorado Style.
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="text-white max-w-xl mb-6"
      >
        Rank & discover the best cannabis producers in CO. Join the community and share your favorites!
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
      >
        <Link
          href="/rankings"
          className="bg-white text-green-700 font-semibold px-6 py-3 rounded-full shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
        >
          Explore the Rankings
        </Link>
      </motion.div>
    </div>
  )
}

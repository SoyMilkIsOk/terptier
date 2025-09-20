"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Star, Users, TrendingUp, Cannabis, LogIn } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { AgeGateStateOption } from "./AgeGate";

type HeroHomeProps = {
  state: AgeGateStateOption;
};

export default function HeroHome({ state }: HeroHomeProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    interface MouseEventWithClient extends MouseEvent {
      clientX: number;
      clientY: number;
    }

    const handleMouseMove = (event: MouseEventWithClient): void => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  type Particle = {
    left: string;
    top: string;
    x: number;
    delay: number;
    duration: number;
  };

  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      x: Math.random() * 50 - 25,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 4,
    }));
    setParticles(generated);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 80, damping: 12 },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-20, 20, -20],
      rotate: [0, 360],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const },
    },
  };

  const headlineStateName = state.name || state.abbreviation;
  const supportingCopy = state.tagline
    ? state.tagline
    : `Rank & discover the best cannabis producers in ${headlineStateName}. Join our community of connoisseurs and share your favorites with fellow enthusiasts.`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,0,150,0.1) 0%, rgba(0,255,255,0.1) 25%, rgba(255,255,0,0.1) 50%, rgba(255,0,255,0.1) 75%, transparent 100%)`,
          }}
        />
        {particles.map((particle, index) => (
          <motion.div
            key={index}
            className="absolute w-2 h-2 bg-gradient-to-r from-green-400 to-green-400 rounded-full opacity-30"
            style={{
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, particle.x, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800/20 via-green-800/20 to-blue-800/20 animate-pulse" />
      </div>

      <motion.div variants={floatingVariants} animate="animate" className="absolute top-20 left-20 text-purple-400 opacity-20">
        <Cannabis size={48} />
      </motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-40 right-20 text-pink-400 opacity-20"
        style={{ animationDelay: "2s" }}
      >
        <Star size={36} />
      </motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute bottom-40 left-40 text-blue-400 opacity-20"
        style={{ animationDelay: "4s" }}
      >
        <TrendingUp size={40} />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] text-center px-4 pt-10 sm:pt-0"
      >
        <Image src="/TerpTier.svg" alt="TerpTier logo" className="my-8" width={170} height={50} />
        <motion.p variants={itemVariants} className="text-xl md:text-3xl font-light mb-4 text-white/90 max-w-3xl leading-relaxed">
          Discover {headlineStateName}'s
          <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent font-semibold">
            {" "}Top Tier Terps
          </span>
        </motion.p>
        <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/70 max-w-2xl mb-12 leading-relaxed">
          {supportingCopy}
        </motion.p>
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-12"
        >
          <Link href={`/${state.slug}/rankings`}>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="group relative cursor-pointer overflow-hidden bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold px-8 py-4 rounded-full shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center justify-center gap-2">
                <span>Explore Brands</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </Link>
          <Link href={`/${state.slug}/drops`}>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="group relative cursor-pointer overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold px-8 py-4 rounded-full shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center justify-center gap-2">
                <span>Upcoming Drops</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </Link>
          <Link href="/about">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative cursor-pointer overflow-hidden bg-gradient-to-r from-purple-700 to-pink-600 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center justify-center gap-2">
                <span>About Us</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </Link>
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group cursor-pointer bg-white/5 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-full border border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex items-center justify-center gap-2">
                <LogIn size={20} />
                <span>Log In</span>
              </div>
            </motion.button>
          </Link>
          <Link href="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group cursor-pointer bg-white/10 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-center gap-2">
                <Users size={20} />
                <span>Sign Up</span>
              </div>
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

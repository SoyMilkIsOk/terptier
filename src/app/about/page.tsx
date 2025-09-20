import React from "react";
import { cookies } from "next/headers";
import {
  Heart,
  Users,
  Award,
  TrendingUp,
  Mail,
  Calendar,
  Eye,
  Instagram,
  ChevronRight,
  Star,
  Flame,
  Leaf,
  Wind,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { DEFAULT_STATE_SLUG } from "@/lib/stateConstants";
import { getStateMetadata } from "@/lib/states";

const STATE_COOKIE_NAME = "preferredState";

export default async function AboutPage() {
  const cookieStore = await cookies();
  const preferredState = cookieStore.get(STATE_COOKIE_NAME)?.value ?? null;
  const state = preferredState ? await getStateMetadata(preferredState) : null;
  const stateSlug = state?.slug ?? DEFAULT_STATE_SLUG;

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
        <div className="relative max-w-full mx-auto px-4 py-16 sm:py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 sm:mb-8 shadow-lg">
              <Award className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-4 sm:mb-6">
              About TerpTier
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
              A premier community-driven platform where cannabis enthusiasts
              discover, rank, and celebrate the nation's finest producers
              through authentic peer recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-4 sm:mb-6">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                Powered by Community, Driven by Quality
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                At TerpTier, we believe the cannabis community knows best. Our
                platform harnesses the collective wisdom of passionate
                enthusiasts across the country to surface exceptional producers
                and help you discover your next favorite strain.
              </p>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Every day, our community votes to create dynamic rankings that
                reflect real-world quality and experience—not marketing budgets
                or corporate influence.
              </p>
            </div>
            <div className="relative mt-8 lg:mt-0">
              <div className="aspect-square bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-2xl transform rotate-1 sm:rotate-3">
                <div className="absolute inset-3 sm:inset-4 bg-white rounded-xl flex items-center justify-center">
                  <div className="text-center p-4">
                    <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                      Live Rankings
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Real-time community feedback shapes our leaderboards
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section - Enhanced with Strain Reviews */}
      <div className="py-12 sm:py-16 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How TerpTier Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Simple, transparent, and community-driven. Here's how we're
              revolutionizing cannabis discovery nationwide.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Live Leaderboards */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Live Rankings
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Watch producers climb or fall in real-time based on community
                votes. Rankings update daily with full historical tracking.
              </p>
            </div>

            {/* Producer Profiles */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Rich Profiles
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Explore detailed producer pages with strain cards, authentic
                tasting notes, and comprehensive community reviews.
              </p>
            </div>

            {/* Strain Tracking - Coming Soon */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Drop Tracking
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Never miss a launch. Upcoming drops show exact release dates
                while past releases display their drop history.
              </p>
            </div>

            {/* Weekly Hearts - Coming Soon */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative">
              <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                COMING SOON
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Weekly Hearts
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every Sunday at midnight, receive your Heart token. Vote for
                your favorite producer and enter community giveaways.
              </p>
            </div>
          </div>

          {/* Integrated Strain Review System */}
          <div className="mt-16 sm:mt-20">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6 shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Community-Driven Strain Reviews
              </h3>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
                Our three-part scoring system captures what matters most to
                enthusiasts. Each strain gets rated on the elements that define
                exceptional cannabis.
              </p>
            </div>

            {/* Review Categories Grid */}
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <div className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-yellow-200">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Flame className="w-7 h-7 text-orange-500" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-3 text-center">
                  Flavor
                </h4>
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  Taste and aroma profiles that showcase distinctive terpene
                  combinations and memorable flavor experiences.
                </p>
                <div className="mt-4 flex justify-center">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-green-200">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Leaf className="w-7 h-7 text-green-500" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-3 text-center">
                  Effect
                </h4>
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  How each strain feels from first hit to finish - covering
                  onset, duration, and overall experience quality.
                </p>
                <div className="mt-4 flex justify-center">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-4 h-4 fill-green-400 text-green-400"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-blue-200">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Wind className="w-7 h-7 text-blue-500" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-3 text-center">
                  Smoke
                </h4>
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  Burn quality, smoothness, and overall smoking experience that
                  separates good from great.
                </p>
                <div className="mt-4 flex justify-center">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-4 h-4 fill-blue-400 text-blue-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Review Process Highlight */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 sm:p-8 text-white text-center shadow-xl">
              <div className="flex items-center justify-center mb-4">
                <div className="flex space-x-1">
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold mb-3">
                Combined Overall Score
              </h4>
              <p className="text-green-100 leading-relaxed max-w-2xl mx-auto">
                All three ratings automatically combine into an overall average,
                making it easy to spot community favorites at a glance. The more
                reviews a strain gets, the more reliable its score becomes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 sm:p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                200+
              </div>
              <div className="text-gray-600 font-medium">Votes + Comments</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 sm:p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                35+
              </div>
              <div className="text-gray-600 font-medium">
                Producers{" "}
                <span className="block text-xs sm:text-sm mt-1 opacity-75">
                  & Growing!
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 sm:p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                Daily
              </div>
              <div className="text-gray-600 font-medium">
                Ranking Updates{" "}
                <span className="block text-xs sm:text-sm mt-1 opacity-75">
                  with Historical Tracking!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Get Started Section */}
      <div className="py-12 sm:py-16 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-4 sm:mb-6">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Ready to Discover the Nation's Best?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              Join our community of cannabis connoisseurs and start exploring
              top-tier producers from coast to coast. Vote for your favorites,
              discover new strains, and connect with fellow enthusiasts.
            </p>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8">
              <Link href={`/${stateSlug}/rankings`} className="w-full sm:w-auto">
                <button className="group w-full sm:w-auto inline-flex cursor-pointer items-center justify-center px-6 sm:px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <span>Explore Brands</span>
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href={`/${stateSlug}/drops`} className="w-full sm:w-auto">
                <button className="group w-full sm:w-auto inline-flex cursor-pointer items-center justify-center px-6 sm:px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>Upcoming Drops</span>
                </button>
              </Link>
              <Link href="/signup" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto inline-flex cursor-pointer items-center justify-center px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <Users className="w-5 h-5 mr-2" />
                  <span>Sign Up</span>
                </button>
              </Link>
            </div>

            {/* Contact Information */}
            <div className="pt-6 sm:pt-8 border-t border-gray-200">
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Have ideas, feedback, or want to get more involved? We'd love to
                hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-4 sm:mb-6">
                <a
                  href="mailto:hello@terptier.com"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200 shadow"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  hello@terptier.com
                </a>
                <span className="hidden sm:inline text-gray-600">or</span>
                <a
                  href="https://instagram.com/terptier"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow"
                >
                  <Instagram className="w-5 h-5 mr-2" />
                  Follow us on Instagram
                </a>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                Proudly built by{" "}
                <Link
                  href="https://terpmetrix.com"
                  className="font-bold text-green-600"
                >
                  <Image
                    src="/terpmetrix.png"
                    alt="terpmetrix logo"
                    width={30}
                    height={10}
                    className="inline-block ml-1"
                  />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

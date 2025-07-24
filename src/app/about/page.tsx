import React from "react";
import {
  Heart,
  Users,
  Award,
  TrendingUp,
  Mail,
  Calendar,
  Eye,
  Instagram,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Section */}
      <div className="relative ">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
        <div className="relative max-w-full mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-8 shadow-lg">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-6">
              About TerpTier
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Colorado's premier community-driven platform where cannabis
              enthusiasts discover, rank, and celebrate the state's finest
              producers through authentic peer recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Powered by Community, Driven by Quality
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At TerpTier, we believe the cannabis community knows best. Our
                platform harnesses the collective wisdom of Colorado's most
                passionate enthusiasts to surface exceptional producers and help
                you discover your next favorite strain.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Every day, our community votes to create dynamic rankings that
                reflect real-world quality and experience—not marketing budgets
                or corporate influence.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-2xl transform rotate-3">
                <div className="absolute inset-4 bg-white rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Live Rankings
                    </h3>
                    <p className="text-gray-600">
                      Real-time community feedback shapes our leaderboards
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How TerpTier Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, transparent, and community-driven. Here's how we're
              revolutionizing cannabis discovery in Colorado.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Live Leaderboards */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Live Rankings
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Watch producers climb or fall in real-time based on community
                votes. Rankings update daily with full historical tracking to
                show trends over time.
              </p>
            </div>

            {/* Producer Profiles */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Rich Profiles
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Explore detailed producer pages featuring strain cards,
                authentic tasting notes, and comprehensive release information
                from fellow enthusiasts.
              </p>
            </div>

            {/* Weekly Hearts - Coming Soon */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
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
                Every Sunday at midnight (MST), receive your Heart token. Vote
                for your favorite producer and enter community giveaways. Change
                your vote anytime during the week.
              </p>
            </div>

            {/* Strain Tracking - Coming Soon */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
              <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                COMING SOON
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Drop Tracking
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Never miss a launch. Upcoming drops show exact release dates
                while past releases display their drop history—stay ahead of the
                curve.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8">
              <div className="text-3xl font-bold text-green-600 mb-2">150+</div>
              <div className="text-gray-600 font-medium">Votes + Comments</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8">
              <div className="text-3xl font-bold text-green-600 mb-2">20+</div>
              <div className="text-gray-600 font-medium">
                Producers <span className="block text-[.3em] mt-1">& Growing! </span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8">
              <div className="text-3xl font-bold text-green-600 mb-2">
                Daily
              </div>
              <div className="text-gray-600 font-medium">
                Ranking Updates <span className="block text-[.3em] mt-1">with Historical Tracking!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Get Involved Section */}
      <div className="py-16 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join the Movement
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Have ideas, feedback, or want to get more involved? We'd love to
              hear from you. Our community thrives on collaboration and shared
              passion for quality cannabis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="mailto:hello@terptier.com"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-lg"
              >
                <Mail className="w-5 h-5 mr-2" />
                hello@terptier.com
              </a>
              <span className="text-gray-600">or</span>
              <a
                href="https://instagram.com/terptier"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                <Instagram className="w-5 h-5 mr-2" />
                Follow us on Instagram
              </a>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-gray-600">
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

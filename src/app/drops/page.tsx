// src/app/drops/page.tsx
import Link from "next/link";
import Image from "next/image";
import StrainCard from "@/components/StrainCard";
import { prisma } from "@/lib/prismadb";
import { Calendar, TrendingUp, ChevronRight } from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DropsPage() {
  noStore();

  const now = new Date();
  const mstParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const year = parseInt(mstParts.find((p) => p.type === "year")!.value, 10);
  const month = parseInt(mstParts.find((p) => p.type === "month")!.value, 10);
  const day = parseInt(mstParts.find((p) => p.type === "day")!.value, 10);

  const start = new Date(Date.UTC(year, month - 1, day));
  const end = new Date(Date.UTC(year, month - 1, day + 7));

  const strains = await prisma.strain.findMany({
    where: { releaseDate: { gte: start, lt: end } },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      releaseDate: true,
      strainSlug: true,
      _count: { select: { StrainReview: true } },
      StrainReview: { select: { aggregateRating: true } },
      producer: {
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          profileImage: true,
        },
      },
    },
    orderBy: { releaseDate: "asc" },
  });

  const strainsWithAvg = strains.map(({ StrainReview, ...rest }) => {
    const avg =
      StrainReview.length > 0
        ? StrainReview.reduce((sum, r) => sum + r.aggregateRating, 0) /
          StrainReview.length
        : null;
    return { ...rest, avgRating: avg };
  });

  const grouped = strainsWithAvg.reduce<Record<string, {
    producer: typeof strainsWithAvg[number]["producer"];
    strains: (typeof strainsWithAvg)[number][];
  }>>(
    (acc, strain) => {
      const producerId = strain.producer.id;
      if (!acc[producerId]) {
        acc[producerId] = {
          producer: strain.producer,
          strains: []
        };
      }
      acc[producerId].strains.push(strain);

      return acc;
    },
    {}
  );

  const getDaysUntilDrop = (releaseDate: Date) => {
    const diffTime = releaseDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 mb-4 sm:mb-6">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Weekly Drops</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 py-2 sm:py-4 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
              Upcoming Drops
            </h1>
            <p className="text-lg sm:text-xl text-green-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Discover the latest premium strains dropping this week from top-tier producers
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-green-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Next 7 Days</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-green-300"></div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{Object.values(grouped).reduce((acc, group) => acc + group.strains.length, 0)} Strains</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto">
        {Object.values(grouped).length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">No Drops This Week</h3>
            <p className="text-gray-600 max-w-md mx-auto px-4">
              Check back soon for the latest strain releases from your favorite producers.
            </p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {Object.values(grouped).map(({ producer, strains }) => (
              <div key={producer.id} className="group">
                {/* Producer Header Card */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                  {/* Header with gradient background */}
                  <div className="relative h-24 sm:h-28 lg:h-32 bg-gradient-to-r from-green-500 to-emerald-600">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 right-4 sm:right-6">
                      <div className="flex items-end justify-between gap-3">
                        
                        {/* Producer Info - Clickable */}
                        <Link href={`/producer/${producer.slug ?? producer.id}`} className="flex items-center gap-3 group/producer hover:opacity-90 transition-opacity flex-1 min-w-0">
                          {/* Producer Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white rounded-full p-0.5 sm:p-1 shadow-lg group-hover/producer:shadow-xl transition-shadow">
                              {producer.profileImage ? (
                                <Image
                                  src={producer.profileImage}
                                  alt={producer.name}
                                  width={64}
                                  height={64}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                                  <span className="text-white font-bold text-sm sm:text-lg lg:text-xl">
                                    {producer.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-white min-w-0 flex-1">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1 truncate group-hover/producer:underline">
                              {producer.name}
                            </h2>
                            <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                              <span className="text-xs sm:text-sm capitalize text-green-200">
                                {producer.category.toLowerCase()}
                              </span>
                            </div>
                            <div className="text-green-100">
                              <span className="text-xs sm:text-sm font-medium">
                                {strains.length} strain{strains.length !== 1 ? 's' : ''} dropping
                              </span>
                            </div>
                          </div>
                        </Link>

                        {/* Action Button */}
                        <div className="flex-shrink-0 self-end mb-1">
                          <Link
                            href={`/drops/${producer.slug ?? producer.id}`}
                            className="group/btn bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 border border-white/20 flex items-center gap-1"
                          >
                            <span className="hidden sm:inline">All Drops</span>
                            <span className="sm:hidden">View All</span>
                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                        
                      </div>
                    </div>
                  </div>

                  {/* Strains Grid */}
                  <div className="p-4 sm:p-6 bg-gray-50/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {strains
                        .slice(0, 3)
                        .map((strain, index) => {
                          if (!strain.releaseDate) return null;
                          const daysUntil = getDaysUntilDrop(strain.releaseDate);
                          return (
                            <div
                              key={strain.id}
                              className={`group/strain relative overflow-hidden transition-all duration-500 ease-out
                                ${daysUntil === 0
                                  ? "animate-pulse"
                                  : ""
                                }
                                hover:-translate-y-1 hover:shadow-xl hover:shadow-green-100/50
                              `}
                              style={{
                                opacity: 0,
                                transform: 'translateY(30px)',
                                animation: `fadeInUp 0.6s ease-out forwards`,
                                animationDelay: `${index * 150}ms`,
                              }}
                            >
                              {/* Glow effect for urgent drops */}
                              {daysUntil <= 1 && (
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg blur opacity-20 group-hover/strain:opacity-30 transition-opacity duration-300"></div>
                              )}
                              
                              {/* Card wrapper with enhanced hover effects */}
                              <div className="relative bg-white rounded-lg overflow-hidden border border-gray-100 group-hover/strain:border-green-200 transition-all duration-300">
                                <StrainCard
                                  strain={strain}
                                  producerSlug={producer.slug ?? producer.id}
                                >
                                  <div className="mt-2 sm:mt-3">
                                    <div
                                      className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 group-hover/strain:scale-105 ${
                                        daysUntil === 0
                                          ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-200"
                                          : daysUntil === 1
                                          ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-200"
                                          : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-200"
                                      }`}
                                    >
                                      {daysUntil === 0
                                        ? "🔥 Available Now"
                                        : daysUntil === 1
                                        ? "⏰ Tomorrow"
                                        : `📅 ${daysUntil} days`}
                                    </div>
                                  </div>
                                </StrainCard>
                                
                                {/* Shimmer effect overlay */}
                                <div className="absolute inset-0 -translate-x-full group-hover/strain:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 pointer-events-none"></div>
                              </div>
                            </div>
                          );
                        })
                        .filter(Boolean)}
                    </div>
                    
                    {strains.length > 3 && (
                      <div className="mt-4 sm:mt-6 text-center">
                        <Link
                          href={`/drops/${producer.slug ?? producer.id}`}
                          className="group inline-flex items-center justify-center gap-2 text-green-600 hover:text-green-700 font-semibold text-sm sm:text-base bg-white hover:bg-gray-50 px-4 py-2 rounded-lg border border-green-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <span>View all {strains.length} strains</span>
                          <TrendingUp className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inline CSS for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `
      }} />
    </div>
  );
}
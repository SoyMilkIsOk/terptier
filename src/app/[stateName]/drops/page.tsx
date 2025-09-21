// src/app/[stateName]/drops/page.tsx
import Link from "next/link";
import Image from "next/image";
import StrainCard from "@/components/StrainCard";
import { prisma } from "@/lib/prismadb";
import { Calendar, ChevronRight, TrendingUp } from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";
import { getStateMetadata } from "@/lib/states";
import { notFound } from "next/navigation";
import MarketModeToggle from "@/components/MarketModeToggle";
import { buildMarketFilters, normalizeMarketParam } from "@/lib/market";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DropsPage({
  params,
  searchParams,
}: {
  params: Promise<{ stateName: string }>;
  searchParams: Promise<{ market?: string }>;
}) {
  const [{ stateName }, { market: marketParam }] = await Promise.all([
    params,
    searchParams,
  ]);
  const state = await getStateMetadata(stateName);

  if (!state) {
    notFound();
  }

  noStore();

  const market = normalizeMarketParam(marketParam);
  const marketFilters = buildMarketFilters(market);
  const themeAttribute = market.toLowerCase();

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

  const todayUtc = Date.UTC(year, month - 1, day);
  const start = new Date(todayUtc - 7 * 24 * 60 * 60 * 1000);
  const end = new Date(todayUtc + 7 * 24 * 60 * 60 * 1000);

  const strains = await prisma.strain.findMany({
    where: {
      releaseDate: { gte: start, lt: end },
      ...(state.strainWhere ?? {}),
      producer: {
        market: { in: marketFilters },
      },
    },
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
          attributes: true,
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
    const releaseUtc = Date.UTC(
      releaseDate.getUTCFullYear(),
      releaseDate.getUTCMonth(),
      releaseDate.getUTCDate()
    );
    return Math.round((releaseUtc - todayUtc) / (1000 * 60 * 60 * 24));
  };

  const strainComparator = (
    a: (typeof strainsWithAvg)[number],
    b: (typeof strainsWithAvg)[number]
  ) => {
    if (!a.releaseDate || !b.releaseDate) return 0;
    const daysA = getDaysUntilDrop(a.releaseDate);
    const daysB = getDaysUntilDrop(b.releaseDate);
    const aFuture = daysA >= 0;
    const bFuture = daysB >= 0;
    if (aFuture && !bFuture) return -1;
    if (!aFuture && bFuture) return 1;
    if (aFuture && bFuture) return daysA - daysB;
    return daysB - daysA;
  };

  const producerGroups = Object.values(grouped)
    .map((group) => ({
      ...group,
      strains: [...group.strains].sort(strainComparator),
    }))
    .sort((a, b) => {
      const daysA = getDaysUntilDrop(a.strains[0].releaseDate!);
      const daysB = getDaysUntilDrop(b.strains[0].releaseDate!);
      const aFuture = daysA >= 0;
      const bFuture = daysB >= 0;
      if (aFuture && !bFuture) return -1;
      if (!aFuture && bFuture) return 1;
      if (aFuture && bFuture) return daysA - daysB;
      return daysB - daysA;
    });

  const totalStrainCount = producerGroups.reduce(
    (acc, group) => acc + group.strains.length,
    0
  );

  return (
    <div data-market-theme={themeAttribute} className="min-h-screen market-page">
      <MarketModeToggle
        className="fixed bottom-6 left-6 z-50"
        value={market}
      />
      <div className="relative overflow-hidden market-hero">
        <div className="absolute inset-0 market-hero-overlay"></div>
        <div className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="market-hero-chip inline-flex items-center gap-2 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 mb-4 sm:mb-6">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Weekly Drops</span>
            </div>
            <h1 className="market-hero-title text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 py-2 sm:py-4 bg-clip-text text-transparent">
              {state.name} Recent & Upcoming Drops
            </h1>
            <p className="market-hero-subtitle text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Discover premium strains from the last week and the upcoming week from top-tier producers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 market-hero-stat-group">
              <div className="market-hero-stat-text flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Last 7 & Next 7 Days</span>
              </div>
              <div className="market-hero-divider hidden sm:block w-px h-4"></div>
              <div className="market-hero-stat-text flex items-center gap-2">
                <span className="text-sm font-medium">{producerGroups.length} Producer{producerGroups.length === 1 ? "" : "s"}</span>
              </div>
              <div className="market-hero-divider hidden sm:block w-px h-4"></div>
              <div className="market-hero-stat-text flex items-center gap-2">
                <span className="text-sm font-medium">{totalStrainCount} Strain{totalStrainCount === 1 ? "" : "s"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="market-content px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto">
        {producerGroups.length === 0 ? (
          <div className="market-empty text-center py-12 sm:py-16">
            <div className="market-empty-icon w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h3 className="market-empty-heading text-xl sm:text-2xl font-semibold mb-2">No Drops This Week</h3>
            <p className="market-empty-text max-w-md mx-auto px-4">
              Check back soon for the latest strain releases from your favorite producers.
            </p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {producerGroups.map(({ producer, strains }) => (
              <div key={producer.id} className="group">
                {/* Producer Header Card */}
                <div className="market-card rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300">
                  {/* Header with gradient background */}
                  <div className="relative h-24 sm:h-28 lg:h-32 market-card-header">
                    <div className="absolute inset-0 market-card-header-overlay"></div>
                    <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 right-4 sm:right-6">
                      <div className="flex items-end justify-between gap-3">

                        {/* Producer Info - Clickable */}
                        <Link
                          href={`/${state.slug}/producer/${producer.slug ?? producer.id}`}
                          className="flex items-center gap-3 group/producer hover:opacity-90 transition-opacity flex-1 min-w-0"
                        >
                          {/* Producer Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className="market-card-avatar w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full p-0.5 sm:p-1 shadow-lg group-hover/producer:shadow-xl transition-shadow">
                              {producer.profileImage ? (
                                <Image
                                  src={producer.profileImage}
                                  alt={producer.name}
                                  width={64}
                                  height={64}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full rounded-full market-card-avatar-fallback flex items-center justify-center">
                                  <span className="font-bold text-sm sm:text-lg lg:text-xl">
                                    {producer.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="market-card-header-text min-w-0 flex-1">
                            <h2 className="market-card-title text-lg sm:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1 truncate group-hover/producer:underline">
                              {producer.name}
                            </h2>
                            <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                              <span className="market-card-header-pill text-xs sm:text-sm capitalize">
                                {producer.category.toLowerCase()}
                              </span>
                            </div>
                            <div className="market-card-header-muted">
                              <span className="text-xs sm:text-sm font-medium">
                                {strains.length} strain{strains.length !== 1 ? 's' : ''} dropping
                              </span>
                            </div>
                          </div>
                        </Link>

                        {/* Action Button */}
                        <div className="flex-shrink-0 self-end mb-1">
                          <Link
                            href={`/${state.slug}/producer/${producer.slug ?? producer.id}/strains`}
                            className="market-card-cta group/btn px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1"
                          >
                            <span className="hidden sm:inline">All Strains</span>
                            <span className="sm:hidden">View All</span>
                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Strains Grid */}
                  <div className="market-card-body p-4 sm:p-6">
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
                              {daysUntil <= 1 && daysUntil >= 0 && (
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
                                          : daysUntil > 1
                                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-200"
                                          : "bg-gradient-to-r from-gray-500 to-gray-700 text-white shadow-lg shadow-gray-200"
                                      }`}
                                    >
                                      {daysUntil === 0
                                        ? "🔥 Available Now"
                                        : daysUntil === 1
                                        ? "⏰ Tomorrow"
                                        : daysUntil > 1
                                        ? `📅 In ${daysUntil} days`
                                        : daysUntil === -1
                                        ? "✅ Yesterday"
                                        : `✅ ${Math.abs(daysUntil)} days ago`}
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
                    
                    {strains.length > 0 && (
                      <div className="mt-4 sm:mt-6 text-center">
                        <Link
                          href={`/${state.slug}/drops/${producer.slug ?? producer.id}`}
                          className="market-card-footer-link group inline-flex items-center justify-center gap-2 font-semibold text-sm sm:text-base px-4 py-2 rounded-lg border transition-all duration-200"
                        >
                          <span>See upcoming drops</span>
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
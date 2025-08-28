// src/app/drops/[producerSlug]/page.tsx
import Link from "next/link";
import Image from "next/image";
import StrainCard from "@/components/StrainCard";
import { prisma } from "@/lib/prismadb";
import {
  Calendar,
  Clock,
  Package,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import BackButton from "@/components/BackButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface DropsByProducerPageProps {
  params: Promise<{ producerSlug: string }>;
}

export default async function DropsByProducerPage({
  params,
}: DropsByProducerPageProps) {
  const { producerSlug } = await params;

  const now = new Date();
  const oneMonth = new Date();
  oneMonth.setMonth(now.getMonth() + 1);

  const producer = await prisma.producer.findFirst({
    where: { OR: [{ slug: producerSlug }, { id: producerSlug }] },
    include: {
      strains: {
        where: {
          releaseDate: {
            gte: now,
            lte: oneMonth,
          },
        },
        orderBy: { releaseDate: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
          releaseDate: true,
          strainSlug: true,
          _count: { select: { StrainReview: true } },
          StrainReview: { select: { aggregateRating: true } },
        },
      },
    },
  });

  if (!producer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-25 to-red-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 sm:w-12 sm:h-12 text-red-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-2">
            Producer Not Found
          </h1>
          <p className="text-sm sm:text-base text-red-500 mb-6">
            The producer you're looking for doesn't exist.
          </p>
          <Link
            href="/drops"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Drops
          </Link>
        </div>
      </div>
    );
  }

  // Calendar logic
  const strains = producer.strains.map(({ StrainReview, ...rest }) => {
    const avg =
      StrainReview.length > 0
        ? StrainReview.reduce((sum, r) => sum + r.aggregateRating, 0) /
          StrainReview.length
        : null;
    return { ...rest, avgRating: avg };
  });

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get calendar days for current month
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Group strains by date
  const strainsByDate = strains.reduce<
    Record<string, typeof strains>
  >((acc, strain) => {
    if (strain.releaseDate) {
      const dateKey = strain.releaseDate.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(strain);
    }
    return acc;
  }, {});

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const getDateKey = (day: number) => {
    return new Date(currentYear, currentMonth, day).toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen">
      {/* Back Button - Fixed positioning for better mobile UX */}

      <BackButton />
      {/* Producer Header - Improved mobile layout */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 to-emerald-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="relative container mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col space-y-6">
            {/* Producer Info */}
            <div className="flex items-start space-x-4">
              {/* Producer Avatar */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-2xl p-2 shadow-lg ring-2 ring-white/20">
                  {producer.profileImage ? (
                    <Image
                      src={producer.profileImage}
                      alt={producer.name}
                      width={96}
                      height={96}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg sm:text-xl lg:text-2xl">
                        {producer.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Producer Details */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                  {producer.name}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-green-100">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 flex-shrink-0" />
                    <span className="capitalize text-sm sm:text-base">
                      {producer.category.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm sm:text-base">
                      {strains.length} drop
                      {strains.length !== 1 ? "s" : ""} this month
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center sm:justify-start">
              <Link
                href={`/producer/${producer.slug ?? producer.id}`}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
              >
                View Full Profile
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Calendar Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            {/* Calendar Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span className="hidden xs:inline">
                    {monthNames[currentMonth]}{" "}
                  </span>
                  <span className="xs:hidden">
                    {monthNames[currentMonth].slice(0, 3)}{" "}
                  </span>
                  {currentYear}
                </h2>
                <div className="text-xs sm:text-sm text-green-100 bg-white/20 px-3 py-1 rounded-full">
                  {strains.length} strain
                  {strains.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-3 sm:p-6">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs sm:text-sm font-semibold text-gray-600 py-2 uppercase tracking-wide"
                  >
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.slice(0, 2)}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: startingDayOfWeek }, (_, i) => (
                  <div key={`empty-${i}`} className="aspect-square"></div>
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dateKey = getDateKey(day);
                  const strainsForDay = strainsByDate[dateKey] || [];
                  const hasDrops = strainsForDay.length > 0;
                  const todayClass = isToday(day);

                  return (
                    <div key={day} className="aspect-square">
                      <div
                        className={`
                          w-full h-full rounded-lg sm:rounded-xl p-1 sm:p-2 transition-all duration-200 relative overflow-hidden
                          ${
                            hasDrops
                              ? "bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-200 hover:shadow-lg cursor-pointer hover:scale-105"
                              : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                          }
                          ${
                            todayClass
                              ? "ring-2 ring-green-500 ring-offset-1"
                              : ""
                          }
                        `}
                      >
                        <div className="flex flex-col h-full">
                          <div
                            className={`
                              text-xs sm:text-sm font-bold mb-1
                              ${
                                todayClass
                                  ? "text-green-700"
                                  : hasDrops
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }
                            `}
                          >
                            {day}
                          </div>

                          {hasDrops && (
                            <div className="flex-1 min-h-0">
                              {/* Desktop/Tablet: Show strain names */}
                              <div className="hidden sm:block space-y-1">
                                {strainsForDay.slice(0, 2).map((strain) => (
                                  <div
                                    key={strain.id}
                                    className="bg-white rounded-md px-2 py-1 text-xs truncate shadow-sm border border-green-200 hover:shadow-md transition-shadow"
                                    title={strain.name}
                                  >
                                    {strain.name}
                                  </div>
                                ))}
                                {strainsForDay.length > 2 && (
                                  <div className="text-xs text-green-600 font-semibold px-2">
                                    +{strainsForDay.length - 2} more
                                  </div>
                                )}
                              </div>

                              {/* Mobile: Show indicator dots */}
                              <div className="sm:hidden flex flex-wrap gap-1 mt-1">
                                {strainsForDay
                                  .slice(0, 6)
                                  .map((strain, index) => (
                                    <div
                                      key={strain.id}
                                      className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-sm"
                                    ></div>
                                  ))}
                                {strainsForDay.length > 6 && (
                                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full opacity-75"></div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Drop count indicator for mobile */}
                          {hasDrops && (
                            <div className="sm:hidden absolute top-0 right-0 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold transform translate-x-1 -translate-y-1">
                              {strainsForDay.length}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Drops List */}
          {strains.length > 0 && (
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                Upcoming Releases
              </h3>
              <div className="grid gap-3 sm:gap-4">
                {strains.map((strain) => (
                  <StrainCard
                    key={strain.id}
                    strain={strain}
                    producerSlug={producer.slug ?? producer.id}
                  >
                    {strain.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {strain.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {strain.releaseDate
                          ? formatDate(strain.releaseDate)
                          : "TBD"}
                      </span>
                    </div>
                  </StrainCard>
                ))}
              </div>
            </div>
          )}

          {/* Empty State - Enhanced */}
          {strains.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                No Drops Scheduled
              </h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto mb-6">
                {producer.name} doesn't have any strains scheduled for release
                in the next month. Check back soon!
              </p>
              <Link
                href={`/producer/${producer.slug ?? producer.id}`}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm sm:text-base"
              >
                View Producer Profile
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

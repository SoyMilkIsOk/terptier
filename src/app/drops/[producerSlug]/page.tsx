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
          _count: { select: { reviews: true } },
        },
      },
    },
  });

  if (!producer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Producer Not Found
          </h1>
          <p className="text-red-500 mb-6">
            The producer you're looking for doesn't exist.
          </p>
          <Link
            href="/drops"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Drops
          </Link>
        </div>
      </div>
    );
  }

  // Calendar logic
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
  const strainsByDate = producer.strains.reduce<
    Record<string, typeof producer.strains>
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <Link
          href="/drops"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Drops
        </Link>
      </div>

      {/* Producer Header */}
      <div className="relative overflow-hidden w-full sm:w-[80%] mx-auto bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-none sm:rounded-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Producer Avatar */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl p-2 shadow-lg">
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
                    <span className="text-white font-bold text-2xl sm:text-3xl">
                      {producer.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 relative">
              <div className="pr-20 sm:pr-0">
                <div className="sm:flex sm:items-start sm:justify-between sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                      {producer.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-green-100">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span className="capitalize">
                          {producer.category.toLowerCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{producer.strains.length} drops this month</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/producer/${producer.slug ?? producer.id}`}
                    className="hidden sm:flex bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-white/20 items-center gap-2 flex-shrink-0"
                  >
                    View Profile
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Mobile absolute positioned button */}
            </div>
            <Link
              href={`/producer/${producer.slug ?? producer.id}`}
              className="sm:hidden absolute top-8 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-white/20 flex items-center gap-1"
            >
              Profile
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Calendar Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <div className="text-sm text-green-100">
                  {producer.strains.length} strain
                  drop{producer.strains.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4 sm:p-6">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-gray-500 py-2"
                  >
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.slice(0, 1)}</span>
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
                        w-full h-full border border-gray-100 rounded-lg p-1 sm:p-2 transition-all duration-200
                        ${
                          hasDrops
                            ? "bg-gradient-to-br from-green-100 to-emerald-100 border-green-200 hover:shadow-md cursor-pointer"
                            : "bg-gray-50 hover:bg-gray-100"
                        }
                        ${
                          todayClass
                            ? "ring-2 ring-green-500 ring-opacity-50"
                            : ""
                        }
                      `}
                      >
                        <div className="flex flex-col h-full">
                          <div
                            className={`
                            text-xs sm:text-sm font-medium mb-1
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
                              {/* Desktop: Show strain names */}
                              <div className="hidden sm:block space-y-0.5">
                                {strainsForDay.slice(0, 2).map((strain) => (
                                  <div
                                    key={strain.id}
                                    className="bg-white rounded px-1 py-0.5 text-xs truncate shadow-sm border border-green-200"
                                  >
                                    {strain.name}
                                  </div>
                                ))}
                                {strainsForDay.length > 2 && (
                                  <div className="text-xs text-green-600 font-medium px-1">
                                    +{strainsForDay.length - 2} more
                                  </div>
                                )}
                              </div>

                              {/* Mobile: Show green dots */}
                              <div className="sm:hidden flex flex-wrap gap-1 mt-1">
                                {strainsForDay
                                  .slice(0, 4)
                                  .map((strain, index) => (
                                    <div
                                      key={strain.id}
                                      className="w-2 h-2 bg-green-500 rounded-full"
                                    ></div>
                                  ))}
                                {strainsForDay.length > 4 && (
                                  <div className="w-2 h-2 bg-green-600 rounded-full opacity-75"></div>
                                )}
                              </div>
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
          {producer.strains.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Upcoming Releases
              </h3>
              <div className="grid gap-4">
                {producer.strains.map((strain) => (
                  <StrainCard
                    key={strain.id}
                    strain={strain}
                    producerSlug={producer.slug ?? producer.id}
                  >
                    {strain.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {strain.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <Clock className="w-4 h-4" />
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

          {/* Empty State */}
          {producer.strains.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No Drops Scheduled
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {producer.name} doesn't have any strains scheduled for release
                in the next month.
              </p>
              <Link
                href={`/producer/${producer.slug ?? producer.id}`}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
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

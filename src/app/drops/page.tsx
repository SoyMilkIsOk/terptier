// src/app/drops/page.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prismadb";
import UpcomingStrainList from "@/components/UpcomingStrainList";
import { Calendar, MapPin, TrendingUp, Clock } from "lucide-react";

export default async function DropsPage() {
  const now = new Date();
  const sevenDays = new Date();
  sevenDays.setDate(now.getDate() + 7);

  const strains = await prisma.strain.findMany({
    where: { releaseDate: { gte: now, lte: sevenDays } },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      releaseDate: true,
      strainSlug: true,
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

  const grouped = strains.reduce<Record<string, { 
    producer: typeof strains[number]["producer"]; 
    strains: (typeof strains)[number][];
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

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
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Weekly Drops</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 py-4 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
              Upcoming Drops
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Discover the latest premium strains dropping this week from top-tier producers
            </p>
            <div className="flex items-center justify-center gap-6 text-green-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Next 7 Days</span>
              </div>
              <div className="w-px h-4 bg-green-300"></div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{Object.values(grouped).reduce((acc, group) => acc + group.strains.length, 0)} Strains</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-10 py-12">
        {Object.values(grouped).length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Drops This Week</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Check back soon for the latest strain releases from your favorite producers.
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {Object.values(grouped).map(({ producer, strains }) => (
              <div key={producer.id} className="group">
                {/* Producer Header Card */}
                <div className="bg-white sm:w-full rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 hover:shadow-lg transition-all duration-300">
                  <div className="relative h-26 sm:h-32 bg-gradient-to-r from-green-500 to-emerald-600">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 right-4 sm:right-6">
                      <div className="flex items-end justify-between gap-3 sm:gap-4">
                        
                        {/* Producer Info - This entire section is now clickable */}
                        <Link href={`/producer/${producer.slug ?? producer.id}`} className="flex items-center gap-3 sm:gap-4 group/producer hover:opacity-90 transition-opacity flex-1 min-w-0">
                          {/* Producer Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full p-1 shadow-lg group-hover/producer:shadow-xl transition-shadow">
                              {producer.profileImage ? (
                                <Image
                                  src={producer.profileImage}
                                  alt={producer.name}
                                  width={60}
                                  height={60}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                                  <span className="text-white font-bold text-lg sm:text-xl">
                                    {producer.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-white min-w-0 flex-1">
                            <h2 className="text-lg sm:text-2xl font-bold mb-1 truncate group-hover/producer:underline">{producer.name}</h2>
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-xs sm:text-sm capitalize text-green-200">{producer.category.toLowerCase()}</span>
                            </div>
                            <div className="text-green-100">
                              <span className="text-xs sm:text-sm font-medium">
                                {strains.length} strain{strains.length !== 1 ? 's' : ''} dropping
                              </span>
                            </div>
                          </div>
                        </Link>

                        {/* Single Action Button */}
                        <div className="flex-shrink-0 self-end my-2">
                          <Link
                            href={`/drops/${producer.slug ?? producer.id}`}
                            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors border border-white/20"
                          >
                            All Drops
                          </Link>
                        </div>
                        
                      </div>
                    </div>
                  </div>

                  {/* Drop Timeline */}
                  <div className="p-6 bg-gray-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {strains.slice(0, 3).map((strain) => {
                        if (!strain.releaseDate) return null;
                        const daysUntil = getDaysUntilDrop(strain.releaseDate);
                        return (
                          <div key={strain.id} className="bg-white rounded-xl p-4 border border-gray-100">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-900 truncate flex-1 mr-2">
                                {strain.name}
                              </h4>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                daysUntil === 0 
                                  ? 'bg-red-100 text-red-600' 
                                  : daysUntil === 1 
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-blue-100 text-blue-600'
                              }`}>
                                {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(strain.releaseDate)}</span>
                            </div>
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                    
                    {strains.length > 3 && (
                      <div className="mt-4 text-center">
                        <Link
                          href={`/drops/${producer.slug ?? producer.id}`}
                          className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center justify-center gap-1"
                        >
                          View all {strains.length} strains
                          <TrendingUp className="w-4 h-4" />
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
    </div>
  );
}
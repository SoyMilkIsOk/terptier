import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prismadb";
import BackButton from "@/components/BackButton";
import AddStrainReviewForm from "@/components/AddStrainReviewForm";
import StrainReviewCard from "@/components/StrainReviewCard";
import { Star, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import React from "react";
import NotifyToggle from "@/components/NotifyToggle";
import { getStateMetadata } from "@/lib/states";
import { notFound } from "next/navigation";
import { getStaticPageTitle, getStrainPageTitle } from "@/lib/seo";

interface StrainPageProps {
  params: Promise<{ stateName: string; slug: string; strainSlug: string }>;
}

export async function generateMetadata({
  params,
}: StrainPageProps): Promise<Metadata> {
  const { stateName, slug: producerSlug, strainSlug } = await params;
  const state = await getStateMetadata(stateName);

  if (!state) {
    return { title: getStaticPageTitle("strain") };
  }

  const strain = await prisma.strain.findFirst({
    where: {
      AND: [
        { strainSlug },
        state.strainWhere ?? {},
        {
          producer: {
            ...(state.producerWhere ?? {}),
            OR: [{ slug: producerSlug }, { id: producerSlug }],
          },
        },
      ],
    },
    select: {
      name: true,
      producer: { select: { name: true } },
    },
  });

  if (!strain?.producer?.name) {
    return { title: getStaticPageTitle("strain") };
  }

  return { title: getStrainPageTitle(strain.name, strain.producer.name) };
}

// Client component for expandable reviews section
function ExpandableReviewSection({
  children, 
  title, 
  count, 
  initialShowCount = 3
}: {
  children: React.ReactNode;
  title: string;
  count: number;
  initialShowCount?: number;
}) {
  return (
    <div className="bg-white shadow-xl rounded-3xl border border-green-100 hover:shadow-2xl transition-shadow duration-300">
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            {title}
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
              {count}
            </span>
          </h2>
        </div>
        
        {count > 0 ? (
          <div className="space-y-6">
            <div className="space-y-4">
              {React.Children.toArray(children).slice(0, initialShowCount)}
            </div>
            
            {count > initialShowCount && (
              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-center gap-2 py-4 text-green-600 hover:text-green-700 font-medium transition-colors border-t border-green-100">
                    <span className="group-open:hidden">Show {count - initialShowCount} more reviews</span>
                    <span className="hidden group-open:block">Show less</span>
                    <ChevronDown className="w-4 h-4 group-open:hidden" />
                    <ChevronUp className="w-4 h-4 hidden group-open:block" />
                  </div>
                </summary>
                <div className="mt-4 space-y-4">
                  {React.Children.toArray(children).slice(initialShowCount)}
                </div>
              </details>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8" />
              </div>
            </div>
            <p className="text-gray-500 text-lg">No reviews yet</p>
            <p className="text-gray-400 text-sm mt-2">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function StrainPage({ params }: StrainPageProps) {
  const { stateName, slug: producerSlug, strainSlug } = await params;
  const state = await getStateMetadata(stateName);

  if (!state) {
    notFound();
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let currentUserId: string | null = null;
  if (session?.user?.email) {
    const prismaUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    currentUserId = prismaUser?.id || null;
  }

  const strain = await prisma.strain.findFirst({
    where: {
      AND: [
        { strainSlug },
        state.strainWhere ?? {},
        {
          producer: {
            ...(state.producerWhere ?? {}),
            OR: [{ slug: producerSlug }, { id: producerSlug }],
          },
        },
      ],
    },
    include: {
      StrainReview: {
        include: { user: true },
        orderBy: { updatedAt: "desc" },
      },
      producer: true,
      notifications: currentUserId ? { where: { userId: currentUserId } } : false,
    },
  });

  if (!strain) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">❌</span>
          </div>
          <p className="text-2xl font-semibold text-red-600">Strain not found</p>
          <p className="text-gray-500 mt-2">The strain you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const reviews = strain.StrainReview;
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.aggregateRating, 0) / reviews.length
      : null;
  const userReview = currentUserId
    ? reviews.find((r) => r.userId === currentUserId) ?? null
    : null;
  const otherReviews = reviews.filter((r) => r.userId !== currentUserId);

  const releaseDate = strain.releaseDate ? new Date(strain.releaseDate) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Strain Header Card */}
        <div className="bg-white shadow-xl rounded-3xl border border-green-100 p-6 md:p-10 mb-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100/30 to-emerald-100/30 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-100/20 to-cyan-100/20 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-start mb-8">
              {/* Strain Image */}
              <div className="mb-6 lg:mb-0 lg:mr-8 flex-shrink-0">
                <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-3xl overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 ring-4 ring-green-200 shadow-xl">
                  <Image
                    src={
                      strain.imageUrl ||
                      "https://placehold.co/160x160/22c55e/ffffff.png?text=%F0%9F%8C%BF"
                    }
                    alt={strain.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              
              {/* Strain Info */}
              <div className="flex-grow text-center lg:text-left">
                <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent mb-4">
                  {strain.name}
                </h1>
                
                {/* Producer Link */}
                <div className="mb-6">
                  <span className="text-gray-600 text-lg">by </span>
                  <Link
                    href={`/${state.slug}/producer/${strain.producer.slug ?? strain.producer.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full hover:from-green-200 hover:to-emerald-200 transition-all duration-200 hover:scale-105 font-semibold"
                  >
                    {strain.producer.name}
                  </Link>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
                  {averageRating !== null && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full">
                      <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                      <span className="text-lg font-bold text-yellow-700">

                        {averageRating.toFixed(1)}
                      </span>
                      <span className="text-yellow-600 text-sm">
                        ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                  )}
                  
                  {releaseDate && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-700 font-semibold">
                        {releaseDate.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <NotifyToggle 
                    strainId={strain.id} 
                    initialSubscribed={strain.notifications?.length > 0} 
                    isLoggedIn={!!currentUserId}
                  />
                </div>

                {/* Quick Stats */}
                {reviews.length > 0 && (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                    <div className="text-center p-3 lg:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                      <div className="text-xl lg:text-2xl font-bold text-green-700 mb-1">
                        {reviews.length}
                      </div>
                      <div className="text-xs lg:text-sm text-green-600 font-medium">Reviews</div>
                    </div>
                    <div className="text-center p-3 lg:p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100">
                      <div className="text-xl lg:text-2xl font-bold text-yellow-700 mb-1">
                        {averageRating ? averageRating.toFixed(1) : 'N/A'}
                      </div>
                      <div className="text-xs lg:text-sm text-yellow-600 font-medium">Average</div>
                    </div>
                    <div className="text-center p-3 lg:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 col-span-2 lg:col-span-1">
                      <div className="text-xl lg:text-2xl font-bold text-purple-700 mb-1">
                        {Math.max(...reviews.map(r => r.aggregateRating), 0).toFixed(1)}
                      </div>
                      <div className="text-xs lg:text-sm text-purple-600 font-medium">Highest</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        {strain.description && (
          <div className="bg-white shadow-lg rounded-2xl border border-green-100 p-6 md:p-8 mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
              About this strain
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {strain.description}
            </p>
          </div>
        )}

        {/* Reviews Section */}
        <div className="space-y-6">
          {/* User's Review or Add Review Form */}
          {userReview ? (
            <div className="bg-white shadow-lg rounded-2xl border-2 border-green-200 p-6 md:p-8">
              <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                <Star className="w-6 h-6" fill="currentColor" />
                Your Review
              </h3>
              <StrainReviewCard
                review={userReview}
                currentUserId={currentUserId ?? undefined}
                highlighted
              />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg rounded-2xl border border-green-100 p-6 md:p-8">
              <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                <Star className="w-6 h-6" />
                Share Your Experience
              </h3>
              <AddStrainReviewForm
                strainId={strain.id}
                producerId={strain.producerId}
              />
            </div>
          )}

          {/* Other Reviews */}
          {otherReviews.length > 0 && (
            <ExpandableReviewSection 
              title="Community Reviews" 
              count={otherReviews.length}
              initialShowCount={3}
            >
              {otherReviews.map((review) => (
                <div key={review.id} className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
                  <StrainReviewCard
                    review={review}
                    currentUserId={currentUserId ?? undefined}
                  />
                </div>
              ))}
            </ExpandableReviewSection>
          )}
        </div>
      </div>
    </div>
  );
}
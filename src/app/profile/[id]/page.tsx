// src/app/profile/[id]/page.tsx
import React from "react";
import CommentCard from "@/components/CommentCard";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import NotificationOptInToggle from "@/components/NotificationOptInToggle";
import BackButton from "@/components/BackButton";
import StrainReviewCard from "@/components/StrainReviewCard";
import ExpandableSection from "@/components/ExpandableSection";
import Link from "next/link";
import { prisma } from "@/lib/prismadb";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Instagram, ExternalLink, Link as LinkIcon } from "lucide-react";

export const dynamic = "force-dynamic";

// Helper function to detect social platform
const getSocialPlatform = (url: string) => {
  if (url.includes('instagram.com') || url.includes('instagr.am')) {
    return 'instagram';
  }
  if (url.includes('twitter.com') || url.includes('x.com')) {
    return 'x';
  }
  return 'other';
};


export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Calling cookies() ensures this page is rendered dynamically per request
  cookies();

  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let user = await prisma.user.findUnique({
    where: { username: id },
    include: {
      votes: {
        // producer.votes is needed for ProducerCard to calculate total score
        include: { producer: { include: { votes: true, _count: { select: { comments: true } } } } },
      },
      comments: {
        include: { producer: true, user: true },
        orderBy: { updatedAt: "desc" },
      },
      StrainReview: {
        include: {
          strain: { include: { producer: true } },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              profilePicUrl: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!user) {
    user = await prisma.user.findUnique({
      where: { id },
      include: {
        votes: {
          include: { producer: { include: { votes: true, _count: { select: { comments: true } } } } },
        },
        comments: {
          include: { producer: true, user: true },
          orderBy: { updatedAt: "desc" },
        },
        StrainReview: {
          include: {
            strain: { include: { producer: true } },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
                profilePicUrl: true,
              },
            },
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    });
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">❌</span>
          </div>
          <p className="text-2xl font-semibold text-red-600">User not found</p>
          <p className="text-gray-500 mt-2">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isOwner = session?.user?.email === user.email;
  const currentViewerId = session?.user?.id;

  // Process votes into liked and disliked producers
  const likedProducers = user.votes
    .filter((vote) => vote.value > 0)
    .map((vote) => ({ ...vote.producer, userActualVote: vote.value })); // Pass producer and the user's vote value

  const dislikedProducers = user.votes
    .filter((vote) => vote.value < 0)
    .map((vote) => ({ ...vote.producer, userActualVote: vote.value })); // Pass producer and the user's vote value

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-6">
          <BackButton />
        </div>
        
        {/* Profile Header Card */}
        <div className="bg-white shadow-xl rounded-3xl border border-green-100 p-8 md:p-10 mb-8 relative overflow-hidden">          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-start mb-8">
              <div className="mb-6 lg:mb-0 lg:mr-8 flex-shrink-0">
                {isOwner ? (
                  <ProfileImageUpload initialUrl={user.profilePicUrl} />
                ) : user.profilePicUrl ? (
                  <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 ring-4 ring-green-200 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={user.profilePicUrl} 
                      alt="profile" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-br from-green-200 to-emerald-200 flex items-center justify-center ring-4 ring-green-200 shadow-lg">
                    <span className="text-white text-4xl lg:text-5xl font-bold">
                      {(user.username || user.name || user.email || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-grow text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent mb-4">
                  {user.username || user.name || user.email}
                </h1>
                
                {user.socialLink && (
                  <div className="flex items-center justify-center lg:justify-start mb-6">
                    {(() => {
                      const platform = getSocialPlatform(user.socialLink);
                      
                      return (
                        <a 
                          href={user.socialLink} 
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 ${
                            platform === 'instagram' 
                              ? "bg-gradient-to-r from-pink-100 to-orange-100 text-pink-600 hover:from-pink-200 hover:to-orange-200" 
                              : platform === 'x'
                              ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          aria-label={
                            platform === 'instagram' 
                              ? "Instagram Profile" 
                              : platform === 'x'
                              ? "X (Twitter) Profile"
                              : "Social Link"
                          }
                        >
                          {platform === 'instagram' ? (
                            <Instagram className="w-5 h-5" />
                          ) : platform === 'x' ? (
                            <div className="w-5 h-5 flex items-center justify-center">
                              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                            </div>
                          ) : (
                            <LinkIcon className="w-5 h-5" />
                          )}
                          <span className="font-medium">
                            {platform === 'instagram' ? 'Instagram' : platform === 'x' ? 'X' : 'Website'}
                          </span>
                        </a>
                      );
                    })()}
                  </div>
                )}
                
                {/* Enhanced Stats */}
                <div className="grid grid-cols-3 gap-2 lg:gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                    <div className="text-2xl lg:text-3xl font-bold text-green-700 mb-1">
                      {user.votes.length}
                    </div>
                    <div className="text-sm text-green-600 font-medium">Ratings</div>
                  </div>
                  <div className="text-center pt-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                    <div className="text-2xl lg:text-3xl font-bold text-blue-700 mb-1">
                      {user.comments.length}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">Comments</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                    <div className="text-2xl lg:text-3xl font-bold text-purple-700 mb-1">
                      {user.StrainReview.length}
                    </div>
                    <div className="text-sm text-purple-600 font-medium">Reviews</div>
                  </div>
                </div>
              </div>
            </div>
            
            {isOwner && (
              <div className="border-t border-green-100 pt-6">
                <NotificationOptInToggle initial={(user as any).notificationOptIn} />
              </div>
            )}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Comments Section */}
          <ExpandableSection title="Comments" count={user.comments.length} initialShowCount={5}>
            {user.comments.map((c) => (
              <CommentCard 
                key={c.id} 
                comment={c} 
                currentUserId={currentViewerId} 
                showRating={false} 
              />
            ))}
          </ExpandableSection>

          {/* Rated Producers Section
          <ExpandableSection 
            title="Rated Producers" 
            count={likedProducers.length} 
            initialShowCount={6}
            className="max-w-none"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {likedProducers.map((producer, index) => {
                const rank = index + 1;
                const j = rank % 10;
                const k = rank % 100;
                const suffix = j === 1 && k !== 11 ? "st" : j === 2 && k !== 12 ? "nd" : j === 3 && k !== 13 ? "rd" : "th";

                return (
                  <ProducerCard
                    key={producer.id}
                    rank={rank}
                    rankSuffix={suffix}
                    producer={producer}
                    userVoteValue={producer.userActualVote}
                    color="none"
                    useColors={false}
                    showRank={false}
                  />
                );
              })}
            </div>
          </ExpandableSection> */}

          {/* Strain Reviews Section */}
          <ExpandableSection title="Strain Reviews" count={user.StrainReview.length} initialShowCount={4}>
            {user.StrainReview.map((review) => (
              <div key={review.id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <Link
                  href={`/producer/${review.strain.producer.slug}/${review.strain.strainSlug}`}
                  className="inline-block text-xl font-semibold text-green-700 hover:text-green-800 transition-colors mb-3 hover:underline"
                >
                  {review.strain.name}
                </Link>
                <StrainReviewCard
                  review={review}
                  currentUserId={currentViewerId}
                />
              </div>
            ))}
          </ExpandableSection>
        </div>
      </div>
    </div>
  );
}
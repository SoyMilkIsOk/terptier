// src/app/profile/[id]/page.tsx
import ProducerCard from "@/components/ProducerCard";
import CommentCard from "@/components/CommentCard";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import BackButton from "@/components/BackButton";
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
      },
    });
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4 mt-8 text-center">
        <p className="text-xl text-red-500">User not found.</p>
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
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <BackButton />

      </div>
      
      {/* Profile Header Card */}
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 max-w-3xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start mb-6 pb-6 border-b border-gray-300">
          <div className="mb-4 md:mb-0 md:mr-6 flex-shrink-0">
            {isOwner ? (
              <ProfileImageUpload initialUrl={user.profilePicUrl} />
            ) : user.profilePicUrl ? (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={user.profilePicUrl} 
                  alt="profile" 
                  className="w-full h-full object-cover" 
                />
              </div>
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500 text-2xl md:text-3xl font-bold">
                  {(user.username || user.name || user.email || '?').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              {user.username || user.name || user.email}
            </h1>
            
            {user.socialLink && (
              <div className="flex items-center justify-center md:justify-start">
                {(() => {
                  const platform = getSocialPlatform(user.socialLink);
                  
                  return (
                    <a 
                      href={user.socialLink} 
                      className={`transition-colors duration-200 ${
                        platform === 'instagram' 
                          ? "text-green-700 hover:text-green-900" 
                          : platform === 'x'
                          ? "text-green hover:text-green-700"
                          : "text-green-600 hover:text-green-800"
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
                        <Instagram className="w-6 h-6" />
                      ) : platform === 'x' ? (
                        <div className="w-6 h-6 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </div>
                      ) : (
                        <LinkIcon className="w-6 h-6" />
                      )}
                    </a>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 text-lg justify-center md:justify-start">
          <div className="flex items-center justify-center md:justify-start mb-2 sm:mb-0">
            <span className="mr-2 font-semibold text-gray-700">Total Ratings:</span>
            <span className="text-blue-600 font-bold">{user.votes.length}</span>
          </div>
          <div className="flex items-center justify-center md:justify-start mb-2 sm:mb-0">
            <span className="mr-2 font-semibold text-gray-700">Comments:</span>
            <span className="text-green-600 font-bold">{user.comments.length}</span>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 max-w-3xl mx-auto mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-300">
          Comments ({user.comments.length})
        </h2>
        {user.comments.length > 0 ? (
          <div className="space-y-4">
            {user.comments.map((c) => (
              <CommentCard 
                key={c.id} 
                comment={c} 
                currentUserId={currentViewerId} 
                showRating={false} 
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No comments yet.</p>
        )}
      </div>

      {/* Rated Producers Section */}
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-300">
          Rated Producers ({likedProducers.length})
        </h2>
        {likedProducers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        ) : (
          <p className="text-gray-600 text-center py-8">No rated producers yet.</p>
        )}
      </div>
    </div>
  );
}
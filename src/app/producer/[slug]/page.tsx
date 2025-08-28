// src/app/producer/[slug]/page.tsx
import { prisma } from "@/lib/prismadb";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@prisma/client"; // Import Category enum if needed for type safety
import CommentCard from "@/components/CommentCard";
import AddCommentForm from "@/components/AddCommentForm";
import VoteButton from "@/components/VoteButton";
import IngredientsButton from "@/components/IngredientsButton";
import BackButton from "@/components/BackButton";
import ChartToggleWrapper from "@/components/ChartToggleWrapper";
import UpcomingStrainList from "@/components/UpcomingStrainList";
import { ExternalLink } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { ATTRIBUTE_OPTIONS } from "@/constants/attributes";
import Tooltip from "@/components/Tooltip";

// Helper function to capitalize category
const capitalize = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

interface ProducerProfilePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProducerProfilePage({
  params,
}: ProducerProfilePageProps) {
  const { slug } = await params;

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

  const producer = await prisma.producer.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: {
      votes: true, // To calculate total score
      comments: false,
      _count: { select: { comments: true } },
      strains: {
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
      <div className="container mx-auto p-4 mt-8 text-center">
        <p className="text-xl text-red-500">Producer not found.</p>
      </div>
    );
  }

  const totalScore = producer.votes.reduce((sum, vote) => sum + vote.value, 0);
  const averageRating =
    producer.votes.length > 0 ? totalScore / producer.votes.length : 0;

  const userVoteRecord = currentUserId
    ? await prisma.vote.findUnique({
        where: {
          userId_producerId: { userId: currentUserId, producerId: producer.id },
        },
      })
    : null;
  const userVoteValue = userVoteRecord?.value ?? null;

  const comments = await prisma.comment.findMany({
    where: { producerId: producer.id },
    include: { user: true },
    orderBy: { updatedAt: "desc" },
  });

  const commentVotes = await prisma.vote.findMany({
    where: {
      producerId: producer.id,
      userId: { in: comments.map((c) => c.userId) },
    },
  });

  const voteMap: Record<string, number> = {};
  commentVotes.forEach((v) => {
    voteMap[v.userId] = v.value;
  });

  const commentsWithVotes = comments.map((c) => ({
    ...c,
    voteValue: voteMap[c.userId] ?? null,
  }));

  const userComment = currentUserId
    ? commentsWithVotes.find((c) => c.userId === currentUserId) ?? null
    : null;

  const otherComments = commentsWithVotes.filter(
    (c) => c.userId !== currentUserId
  );

  // Calculate rank
  let rank = 0;
  const allProducersOfCategory = await prisma.producer.findMany({
    where: { category: producer.category },
    include: { votes: true },
  });

  const scoredProducers = allProducersOfCategory.map((p) => {
    const total = p.votes.reduce((sum, v) => sum + v.value, 0);
    const avg = p.votes.length > 0 ? total / p.votes.length : 0;
    return { ...p, score: avg };
  });

  scoredProducers.sort((a, b) => b.score - a.score);

  const producerIndex = scoredProducers.findIndex((p) => p.id === producer.id);
  if (producerIndex !== -1) {
    rank = producerIndex + 1;
  }
  const producerCategoryFormatted = capitalize(producer.category);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <BackButton />
      </div>
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 max-w-3xl mx-auto relative">
        <div className="flex flex-col md:flex-row items-start md:items-center mb-6 pb-6 border-b border-gray-300">
          {(producer.profileImage || producer.logoUrl) && (
            <div className="w-24 h-24 md:w-32 md:h-32 mr-0 md:mr-6 mb-4 md:mb-0 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
              <Image
                src={producer.profileImage || producer.logoUrl!}
                alt={`${producer.name} logo`}
                layout="fill"
                className="object-contain"
              />
            </div>
          )}
          <div className="flex-grow text-left md:text-left">
            <div className="flex items-center mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                {producer.name}
              </h1>
              <div className="flex items-center space-x-4 absolute right-6 top-6">
                {producer.website && (
                  <a
                    href={producer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700"
                    aria-label="Website"
                  >
                    <ExternalLink className="w-6 h-6" />
                  </a>
                )}
                {producer.ingredients && (
                  <IngredientsButton ingredients={producer.ingredients} />
                )}
              </div>
            </div>
            {rank > 0 && (
              <p className="text-gray-600 mt-4 ml-0">
                Rank: <span className="font-bold">#{rank}</span>{" "}
                <span className="text-sm">
                  in{" "}
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold tracking-wide">
                    {producerCategoryFormatted}
                  </span>
                </span>
              </p>
            )}
            {/* Attributes positioned below rank, aligned to right edge of profile picture */}
            {producer.attributes && producer.attributes.length > 0 && (
              <div className="flex flex-wrap gap-2 my-4">
                {producer.attributes.map((a) => {
                  const opt = ATTRIBUTE_OPTIONS[producer.category].find(
                    (o) => o.key === a
                  );
                  return (
                    <Tooltip key={a} content={opt?.tooltip}>
                      <span className="text-sm bg-gray-200 rounded-full px-3 py-1 flex items-center gap-1">
                        <span>{opt?.icon}</span>
                        <span>{opt?.label || a}</span>
                      </span>
                    </Tooltip>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-lg justify-center md:justify-start">
          <div className="flex items-center mb-2 sm:mb-0">
            <span className="mr-2 font-semibold">Avg. Rating:</span>
            <VoteButton
              producerId={producer.id}
              initialAverage={averageRating}
              userRating={null}
              readOnly
            />
          </div>
          <div className="flex items-center mb-2 sm:mb-0">
            <span className="mr-1.5 font-semibold">Your Rating:</span>
            <VoteButton
              producerId={producer.id}
              initialAverage={userVoteValue ?? 0}
              userRating={userVoteValue}
              showNumber={true}
            />
          </div>
          </div>

          {/* Placeholder for description or other details */}
        {/* Example:
        {producer.description && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">About {producer.name}</h3>
            <p className="text-gray-700 leading-relaxed">{producer.description}</p>
          </div>
        )}
          */}

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Strains</h3>
            </div>
            <UpcomingStrainList
              strains={producer.strains}
              producerSlug={producer.slug ?? producer.id}
            />
          </div>

          {/* Chart Toggle Wrapper - replaces the direct RatingHistoryChart */}
          <ChartToggleWrapper
            producerId={producer.id}
            voteCount={producer.votes.length}
        />

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">
            Comments ({producer._count?.comments ?? 0})
          </h3>
          {userComment ? (
            <CommentCard
              comment={userComment}
              currentUserId={currentUserId ?? undefined}
              highlighted
            />
          ) : (
            <AddCommentForm producerId={producer.id} />
          )}
          {otherComments.map((c) => (
            <CommentCard
              key={c.id}
              comment={c}
              currentUserId={currentUserId ?? undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

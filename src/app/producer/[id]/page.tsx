// src/app/producer/[id]/page.tsx
import { prisma } from "@/lib/prismadb";
import Image from "next/image";
import { Category } from "@prisma/client"; // Import Category enum if needed for type safety
import CommentCard from "@/components/CommentCard";
import AddCommentForm from "@/components/AddCommentForm";
import VoteButton from "@/components/VoteButton";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

// Helper function to capitalize category
const capitalize = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

interface ProducerProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProducerProfilePage({
  params,
}: ProducerProfilePageProps) {
  const { id } = await params;

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

  const producer = await prisma.producer.findUnique({
    where: { id },
    include: {
      votes: true, // To calculate total score
      comments: false,
      _count: { select: { comments: true } },
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
          userId_producerId: { userId: currentUserId, producerId: id },
        },
      })
    : null;
  const userVoteValue = userVoteRecord?.value ?? null;

  const comments = await prisma.comment.findMany({
    where: { producerId: id },
    include: { user: true },
    orderBy: { updatedAt: "desc" },
  });

  const commentVotes = await prisma.vote.findMany({
    where: { producerId: id, userId: { in: comments.map((c) => c.userId) } },
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

  const otherComments = commentsWithVotes.filter((c) => c.userId !== currentUserId);

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
    <div className="container mx-auto p-4 mt-8">
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center mb-6 pb-6 border-b border-gray-300">
          {producer.logoUrl && (
            <div className="relative w-24 h-24 md:w-32 md:h-32 mr-0 md:mr-6 mb-4 md:mb-0 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              <Image
                src={producer.logoUrl}
                alt={`${producer.name} logo`}
                layout="fill"
                className="object-contain"
              />
            </div>
          )}
          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-col sm:flex-row sm:items-baseline items-center sm:justify-start mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mr-0 sm:mr-3 mb-2 sm:mb-0">
                {producer.name}
              </h1>
            </div>
            {rank > 0 && (
              <p className="text-gray-600 mt-4">
                Rank: <span className="font-bold">#{rank}</span>{" "}
                <span className="text-sm">
                  in{" "}
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold tracking-wide">
                    {producerCategoryFormatted}
                  </span>
                </span>
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-lg justify-center md:justify-start">
          <div className="flex items-center mb-2 sm:mb-0">
            <span className="mr-2 font-semibold">Avg. Rating:</span>
            <VoteButton
              producerId={id}
              initialAverage={averageRating}
              userRating={null}
              readOnly
            />
          </div>
          <div className="flex items-center mb-2 sm:mb-0">
            <span className="mr-2 font-semibold">Your Rating:</span>
            <VoteButton
              producerId={id}
              initialAverage={averageRating}
              userRating={userVoteValue}
              showNumber={false}
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
            <AddCommentForm producerId={id} />
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

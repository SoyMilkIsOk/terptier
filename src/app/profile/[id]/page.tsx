// src/app/profile/[id]/page.tsx
import ProducerCard from "@/components/ProducerCard";
import CommentCard from "@/components/CommentCard";
import { prisma } from "@/lib/prismadb";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id }, // Query by id
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
    // Consider a more user-friendly "not found" page or redirect
    return <p>User not found. (ID: {id})</p>;
  }

  // Process votes into liked and disliked producers
  const likedProducers = user.votes
    .filter((vote) => vote.value > 0)
    .map((vote) => ({ ...vote.producer, userActualVote: vote.value })); // Pass producer and the user's vote value

  const dislikedProducers = user.votes
    .filter((vote) => vote.value < 0)
    .map((vote) => ({ ...vote.producer, userActualVote: vote.value })); // Pass producer and the user's vote value

  return (
    <div>
      <div className="flex flex-col items-center mb-6 space-y-2">
        {user.profilePicUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.profilePicUrl} alt="profile" className="w-24 h-24 rounded-full object-cover" />
        )}
        <h1 className="text-2xl font-semibold">
          {user.username || user.name || user.email}
        </h1>
        {user.socialLink && (
          <a href={user.socialLink} className="text-blue-600 underline break-words" target="_blank" rel="noopener noreferrer">
            {user.socialLink}
          </a>
        )}
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Comments</h2>
        {user.comments.length > 0 ? (
          <div>
            {user.comments.map((c) => (
              <CommentCard key={c.id} comment={c} currentUserId={id} showRating={false} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No comments yet.</p>
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Rated Producers</h2>
        {likedProducers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {likedProducers.map((producer, index) => (
              <ProducerCard
                key={producer.id}
                rank={index + 1} // Rank within the liked list
                producer={producer} // producer is already ProducerWithVotes
                userVoteValue={producer.userActualVote} // User's actual vote (e.g. 1)
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No rated producers yet.</p>
        )}
      </section>

    </div>
  );
}

// src/app/profile/[email]/page.tsx
import ProducerCard from "@/components/ProducerCard";
import { prisma } from "@/lib/prismadb";

export default async function ProfilePage({
  params,
}: {
  params: { email: string }; // Parameter changed to email
}) {
  const { email: encodedEmail } = params; // Destructure and rename
  const email = decodeURIComponent(encodedEmail); // Decode email

  const user = await prisma.user.findUnique({
    where: { email }, // Query by email
    include: {
      votes: {
        // producer.votes is needed for ProducerCard to calculate total score
        include: { producer: { include: { votes: true } } },
      },
    },
  });

  if (!user) {
    // Consider a more user-friendly "not found" page or redirect
    return <p>User not found. (Email: {email})</p>; // Updated message for email
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
      <h1 className="text-2xl font-semibold mb-6 text-center">
        {user.name || user.email}'s Profile
      </h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Liked Producers</h2>
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
          <p className="text-gray-600">No liked producers yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Disliked Producers</h2>
        {dislikedProducers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dislikedProducers.map((producer, index) => (
              <ProducerCard
                key={producer.id}
                rank={index + 1} // Rank within the disliked list
                producer={producer} // producer is already ProducerWithVotes
                userVoteValue={producer.userActualVote} // User's actual vote (e.g. -1)
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No disliked producers yet.</p>
        )}
      </section>
    </div>
  );
}

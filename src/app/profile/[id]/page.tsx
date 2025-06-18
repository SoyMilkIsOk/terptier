// src/app/profile/[id]/page.tsx
import ProducerCard from "@/components/ProducerCard";
import { prisma } from "@/lib/prismadb";

export default async function ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  // ✨ Await params before destructuring
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      votes: {
        include: { producer: { include: { votes: true } } },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return (
    <div>
      <h1 className="text-2xl mb-4">{user.name || user.email}</h1>
      <h2 className="text-xl mb-2">Your Votes</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {user.votes.map((v) => (
          <ProducerCard rank={v.producer.votes.length} key={v.producer.id} producer={v.producer} />
        ))}
      </div>
    </div>
  );
}

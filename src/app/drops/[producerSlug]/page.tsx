// src/app/drops/[producerSlug]/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prismadb";
import UpcomingStrainList from "@/components/UpcomingStrainList";

interface DropsByProducerPageProps {
  params: Promise<{ producerSlug: string }>;
}

export default async function DropsByProducerPage({ params }: DropsByProducerPageProps) {
  const { producerSlug } = await params;

  const now = new Date();
  const sevenDays = new Date();
  sevenDays.setDate(now.getDate() + 7);

  const producer = await prisma.producer.findFirst({
    where: { OR: [{ slug: producerSlug }, { id: producerSlug }] },
    include: {
      strains: {
        where: { releaseDate: { gte: now, lte: sevenDays } },
        orderBy: { releaseDate: "asc" },
      },
    },
  });

  if (!producer) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500">Producer not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{producer.name}</h1>
      {producer.strains.length === 0 ? (
        <p>No upcoming strains.</p>
      ) : (
        <UpcomingStrainList strains={producer.strains} />
      )}
      <div className="mt-4">
        <Link
          href={`/producer/${producer.slug ?? producer.id}`}
          className="text-green-700 hover:underline"
        >
          View profile
        </Link>
      </div>
    </div>
  );
}

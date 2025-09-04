// src/app/producer/[slug]/strains/page.tsx
import Link from "next/link";
import BackButton from "@/components/BackButton";
import ProducerStrainList from "@/components/ProducerStrainList";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prismadb";

interface ProducerStrainsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProducerStrainsPage({
  params,
}: ProducerStrainsPageProps) {
  const { slug } = await params;

  const producer = await prisma.producer.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: {
      strains: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          releaseDate: true,
          strainSlug: true,
          _count: { select: { StrainReview: true } },
          StrainReview: { select: { aggregateRating: true } },
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

  const strainsWithAvg = producer.strains.map(({ StrainReview, ...rest }) => {
    const avg =
      StrainReview.length > 0
        ? StrainReview.reduce((sum, r) => sum + r.aggregateRating, 0) /
          StrainReview.length
        : null;
    return { ...rest, avgRating: avg };
  });

  const sortedStrains = strainsWithAvg.sort((a, b) => {
    if (a.releaseDate && b.releaseDate) {
      return b.releaseDate.getTime() - a.releaseDate.getTime();
    }
    if (a.releaseDate) return -1;
    if (b.releaseDate) return 1;
    return a.name.localeCompare(b.name);
  });

  const producerSlug = producer.slug ?? slug;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <BackButton />
        <Link
          href={`/drops/${producerSlug}`}
          className="flex items-center text-green-600 hover:underline"
        >
          Upcoming Drops
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      <ProducerStrainList
        strains={sortedStrains}
        producerSlug={producerSlug}
      />
    </div>
  );
}


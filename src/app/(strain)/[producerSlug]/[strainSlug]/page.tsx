import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prismadb";
import BackButton from "@/components/BackButton";
import AddStrainReviewForm from "@/components/AddStrainReviewForm";
import StrainReviewCard from "@/components/StrainReviewCard";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

interface StrainPageProps {
  params: Promise<{ producerSlug: string; strainSlug: string }>;
}

export default async function StrainPage({ params }: StrainPageProps) {
  const { producerSlug, strainSlug } = await params;

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
    where: { strainSlug: Number(strainSlug), producer: { slug: producerSlug } },
    include: {
      reviews: { include: { user: true }, orderBy: { updatedAt: "desc" } },
      producer: true,
    },
  });

  if (!strain) {
    return (
      <div className="container mx-auto p-4 mt-8 text-center">
        <p className="text-xl text-red-500">Strain not found.</p>
      </div>
    );
  }

  const userReview = currentUserId
    ? strain.reviews.find((r) => r.userId === currentUserId) ?? null
    : null;
  const otherReviews = strain.reviews.filter((r) => r.userId !== currentUserId);

  const releaseDate = strain.releaseDate ? new Date(strain.releaseDate) : null;

  return (
    <div className="container mx-auto p-4 mt-8">
      <BackButton />
      <div className="flex flex-col md:flex-row items-start md:items-center mb-6 pb-6 border-b border-gray-300">
        <div className="relative w-32 h-32 rounded overflow-hidden mr-4">
          <Image
            src={strain.imageUrl || "https://placehold.co/128"}
            alt={strain.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-grow text-left md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            {strain.name}
          </h1>
          {releaseDate && (
            <p className="text-gray-600 mt-2">
              Released on {releaseDate.toLocaleDateString()}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            by {" "}
            <Link
              href={`/producer/${strain.producer.slug ?? strain.producer.id}`}
              className="underline hover:text-blue-600"
            >
              {strain.producer.name}
            </Link>
          </p>
        </div>
      </div>

      {strain.description && (
        <p className="text-gray-700 mb-8 whitespace-pre-wrap">
          {strain.description}
        </p>
      )}

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">
          Reviews ({strain.reviews.length})
        </h3>
        {userReview ? (
          <StrainReviewCard
            review={userReview}
            currentUserId={currentUserId ?? undefined}
            highlighted
          />
        ) : (
          <AddStrainReviewForm
            strainId={strain.id}
            producerId={strain.producerId}
          />
        )}
        {otherReviews.map((r) => (
          <StrainReviewCard
            key={r.id}
            review={r}
            currentUserId={currentUserId ?? undefined}
          />
        ))}
      </div>
    </div>
  );
}


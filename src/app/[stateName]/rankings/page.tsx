// src/app/[stateName]/rankings/page.tsx
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import AgeGate from "@/components/AgeGate";
import ProducerList, { ProducerWithVotes } from "@/components/ProducerList";
import Link from "next/link";
import { prisma } from "@/lib/prismadb";
import { Category } from "@prisma/client";
import { getStateMetadata } from "@/lib/states";
import { notFound } from "next/navigation";

export default async function RankingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ stateName: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { stateName } = await params;
  const state = getStateMetadata(stateName);

  if (!state) {
    notFound();
  }

  // Age gate
  const cookieStore = await cookies();
  const is21 = cookieStore.get("ageVerify")?.value === "true";
  if (!is21) return <AgeGate />;

  // Auth (unchanged)
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Map of current user's votes (producerId -> value)
  let userVotes: Record<string, number> = {};

  if (session?.user?.email) {
    const prismaUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (prismaUser) {
      const votes = await prisma.vote.findMany({
        where: { userId: prismaUser.id },
      });

      votes.forEach((vote) => {
        userVotes[vote.producerId] = vote.value;
      });
    }
  }

  // Load producers + votes
  const flowerRaw = (await prisma.producer.findMany({
    where: {
      ...(state.producerWhere ?? {}),
      category: Category.FLOWER,
    },
    include: { votes: true, _count: { select: { comments: true } } },
  })) as ProducerWithVotes[];

  const hashRaw = (await prisma.producer.findMany({
    where: {
      ...(state.producerWhere ?? {}),
      category: Category.HASH,
    },
    include: { votes: true, _count: { select: { comments: true } } },
  })) as ProducerWithVotes[];

  // Score helper (average of vote values)
  const score = (p: ProducerWithVotes) => {
    const total = p.votes.reduce((sum, v) => sum + v.value, 0);
    return p.votes.length > 0 ? total / p.votes.length : 0;
    // If you later move to "hearts per week" tokens, update this accordingly.
  };

  // Sorted lists
  const flower = flowerRaw.sort((a, b) => score(b) - score(a));
  const hash = hashRaw.sort((a, b) => score(b) - score(a));

  // View selection
  const { view } = await searchParams;
  const initialViewParam = view === "hash" ? "hash" : "flower";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-10 md:py-12">
      <div className="container mx-auto px-2 md:px-4">
        <ProducerList
          initialData={{ flower, hash }}
          userVotes={userVotes}
          initialView={initialViewParam}
        />

        <div className="text-center mt-8">
          <Link
            href="/feedback"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            Missing Your Favorite?
          </Link>
        </div>
      </div>
    </div>
  );
}

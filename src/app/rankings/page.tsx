// src/app/rankings/page.tsx
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import AgeGate from "@/components/AgeGate";
import ProducerList, { ProducerWithVotes } from "@/components/ProducerList";
import Link from "next/link";
import { prisma } from "@/lib/prismadb";
import { Category } from "@prisma/client";
import {
  Crown,
  TrendingUp,
  Users,
  Star,
  Flower2,
  FlaskConical,
} from "lucide-react";

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
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
    where: { category: Category.FLOWER },
    include: { votes: true, _count: { select: { comments: true } } },
  })) as ProducerWithVotes[];

  const hashRaw = (await prisma.producer.findMany({
    where: { category: Category.HASH },
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

  // Hero metrics
  const totalProducers = flower.length + hash.length;
  const totalVotes =
    [...flower, ...hash].reduce((acc, p) => acc + p.votes.length, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Section — modeled after /drops */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Community Rankings</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4 py-4 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
              Colorado Producer Rankings
            </h1>

            <p className="text-lg md:text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Vote for your favorite producers and see who&apos;s in the lead! Scores are
              community-driven and update as votes roll in.
            </p>

            {/* Quick metrics */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-green-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {totalProducers} Producers
                </span>
              </div>
              <div className="w-px h-4 bg-green-300"></div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {totalVotes} Vote{totalVotes === 1 ? "" : "s"}
                </span>
              </div>
              <div className="w-px h-4 bg-green-300"></div>
              <div className="flex items-center gap-2">
                <Flower2 className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {flower.length} Growers
                </span>
              </div>
              <div className="w-px h-4 bg-green-300"></div>
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                <span className="text-sm font-medium">{hash.length} Hashers</span>
              </div>
            </div>

            {/* View toggles (links keep SSR simple and reflect state in URL) */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-2 md:px-4 py-10 md:py-12">
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

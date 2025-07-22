// src/app/rankings/page.tsx
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/ssr";
import AgeGate from "@/components/AgeGate";
import ProducerList, { ProducerWithVotes } from "@/components/ProducerList";
import Link from "next/link";
import { prisma } from "@/lib/prismadb";
import { Category, Vote } from "@prisma/client";

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const cookieStore = await cookies();
  const is21 = cookieStore.get("ageVerify")?.value === "true";
  if (!is21) return <AgeGate />;

  const supabase = createServerComponentClient({ cookies: () => cookieStore } as any);
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let userVotes: Record<string, number> = {};

  if (authUser?.email) {
    const prismaUser = await prisma.user.findUnique({
      where: { email: authUser.email },
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

  const flowerRaw = (await prisma.producer.findMany({
    where: { category: Category.FLOWER },
    include: { votes: true, _count: { select: { comments: true } } },
  })) as ProducerWithVotes[];

  const hashRaw = (await prisma.producer.findMany({
    where: { category: Category.HASH },
    include: { votes: true, _count: { select: { comments: true } } },
  })) as ProducerWithVotes[];

  const score = (p: ProducerWithVotes) => {
    const total = p.votes.reduce((sum, v) => sum + v.value, 0);
    return p.votes.length > 0 ? total / p.votes.length : 0;
  };

  const flower = flowerRaw.sort((a, b) => score(b) - score(a));
  const hash = hashRaw.sort((a, b) => score(b) - score(a));

  const { view } = await searchParams;
  const initialViewParam = view === "hash" ? "hash" : "flower";

  return (
    <div className="bg-white min-h-[100vh] py-4">
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
  );
}

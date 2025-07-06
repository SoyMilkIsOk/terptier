// src/app/rankings/page.tsx
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import AgeGate from "@/components/AgeGate";
import ProducerList, { ProducerWithVotes } from "@/components/ProducerList";
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

  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

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
    <ProducerList
      initialData={{ flower, hash }}
      userVotes={userVotes}
      initialView={initialViewParam}
    />
  );
}

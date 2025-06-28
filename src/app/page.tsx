// src/app/page.tsx
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import AgeGate from "@/components/AgeGate";
import ProducerList, { ProducerWithVotes } from "@/components/ProducerList";
import { prisma } from "@/lib/prismadb";
import { Category, Vote } from "@prisma/client";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  // 1) Age‐gate
  const cookieStore = await cookies();
  const is21 = cookieStore.get("ageVerify")?.value === "true";
  if (!is21) return <AgeGate />;

  // Initialize Supabase client
  const supabase = createServerComponentClient({
    cookies: () => Promise.resolve(cookieStore),
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userVotes: Record<string, number> = {};

  if (user?.email) {
    const prismaUser = await prisma.user.findUnique({
      where: { email: user.email },
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
  console.log("[HomePage] Constructed userVotes map:", JSON.stringify(userVotes, null, 2)); // Enhanced log

  // 2) Fetch all producers with their votes
  let flowerRaw: ProducerWithVotes[] = [];
  let hashRaw: ProducerWithVotes[] = [];
  try {
    flowerRaw = (await prisma.producer.findMany({
      where: { category: Category.FLOWER },
      include: { votes: true, _count: { select: { comments: true } } },
    })) as ProducerWithVotes[];

    hashRaw = (await prisma.producer.findMany({
      where: { category: Category.HASH },
      include: { votes: true, _count: { select: { comments: true } } },
    })) as ProducerWithVotes[];
  } catch (err) {
    console.error("[HomePage] Failed to query producers:", err);
    return (
      <div className="p-4 text-center text-red-600">
        Failed to load producers. Please try again later.
      </div>
    );
  }

  // 3) Sort by average rating desc
  const score = (p: ProducerWithVotes) => {
    const total = p.votes.reduce((sum, v) => sum + v.value, 0);
    return p.votes.length > 0 ? total / p.votes.length : 0;
  };

  const flower = flowerRaw.sort((a, b) => score(b) - score(a));

  const hash = hashRaw.sort((a, b) => score(b) - score(a));

  const { view } = await searchParams;
  const initialViewParam = view === "hash" ? "hash" : "flower";

  // 4) Render the client list with initialData and userVotes
  return (
    <ProducerList
      initialData={{ flower, hash }}
      userVotes={userVotes}
      initialView={initialViewParam}
    />
  );
}

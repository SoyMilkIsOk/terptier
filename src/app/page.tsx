// src/app/page.tsx
import { cookies } from "next/headers";
import AgeGate from "@/components/AgeGate";
import ProducerList, { ProducerWithVotes } from "@/components/ProducerList";
import { prisma } from "@/lib/prismadb";
import { Category } from "@prisma/client";

export default async function HomePage() {
  // 1) Age‐gate
  const cookieStore = await cookies();
  const is21 = cookieStore.get("ageVerify")?.value === "true";
  if (!is21) return <AgeGate />;

  // 2) Fetch all producers with their votes
  const flowerRaw = (await prisma.producer.findMany({
    where:    { category: Category.FLOWER },
    include:  { votes: true },
  })) as ProducerWithVotes[];

  const hashRaw = (await prisma.producer.findMany({
    where:    { category: Category.HASH },
    include:  { votes: true },
  })) as ProducerWithVotes[];

  // 3) Sort by total votes desc and take top 10
  const score = (p: ProducerWithVotes) =>
    p.votes.reduce((sum, v) => sum + v.value, 0);

  const flower = flowerRaw
    .sort((a, b) => score(b) - score(a))
    .slice(0, 10);

  const hash = hashRaw
    .sort((a, b) => score(b) - score(a))
    .slice(0, 10);

  // 4) Render the client list with initialData
  return <ProducerList initialData={{ flower, hash }} />;
}

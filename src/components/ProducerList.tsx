// src/components/ProducerList.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProducerCard from "./ProducerCard";
import CategoryToggle from "./CategoryToggle"; // Import CategoryToggle
import type { Producer, Vote } from "@prisma/client";

// merge the generated Prisma Producer with its votes
export type ProducerWithVotes = Producer & {
  votes: Vote[];
  _count?: { comments: number };
};

interface Props {
  initialData: {
    flower: ProducerWithVotes[];
    hash:   ProducerWithVotes[];
  };
  userVotes?: Record<string, number>; // Added userVotes to Props
  initialView?: "flower" | "hash";
}

export default function ProducerList({ initialData, userVotes, initialView }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"flower" | "hash">(initialView ?? "flower");

  // Sync state with url search params
  useEffect(() => {
    const param = searchParams.get("view");
    if (param === "flower" || param === "hash") {
      setView(param);
    }
  }, [searchParams]);

  const updateView = (v: "flower" | "hash") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", v);
    router.push(`/?${params.toString()}`);
    setView(v);
  };
  const list =
    view === "flower" ? initialData.flower : initialData.hash;

  console.log("[ProducerList.tsx] userVotes prop:", userVotes);

  return (
    <>
      <div className="flex justify-center mb-4">
        <CategoryToggle view={view} setView={updateView} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {list.map((producer, i) => {
          const userVoteValue = userVotes?.[producer.id];
          console.log(`[ProducerList.tsx] Mapping producer ${producer.id}: userVoteValue =`, userVoteValue);
          return (
            <ProducerCard
              key={producer.id}
              rank={i + 1}
              producer={producer}
              userVoteValue={userVoteValue} // Pass down the specific user vote
              isTopTen={i < 10}
            />
          );
        })}
      </div>
    </>
  );
}

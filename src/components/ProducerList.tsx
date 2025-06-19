// src/components/ProducerList.tsx
"use client";

import { useState } from "react";
import ProducerCard from "./ProducerCard";
import CategoryToggle from "./CategoryToggle"; // Import CategoryToggle
import type { Producer, Vote } from "@prisma/client";

// merge the generated Prisma Producer with its votes
export type ProducerWithVotes = Producer & { votes: Vote[] };

interface Props {
  initialData: {
    flower: ProducerWithVotes[];
    hash:   ProducerWithVotes[];
  };
  userVotes?: Record<string, number>; // Added userVotes to Props
}

export default function ProducerList({ initialData, userVotes }: Props) { // Added userVotes to destructuring
  const [view, setView] = useState<"flower" | "hash">("flower");
  const list =
    view === "flower" ? initialData.flower : initialData.hash;

  console.log("[ProducerList.tsx] userVotes prop:", userVotes);

  return (
    <>
      <div className="flex justify-center mb-4">
        <CategoryToggle view={view} setView={setView} />
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
            />
          );
        })}
      </div>
    </>
  );
}

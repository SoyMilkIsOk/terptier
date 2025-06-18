// src/components/ProducerList.tsx
"use client";

import { useState } from "react";
import ProducerCard from "./ProducerCard";
import type { Producer, Vote } from "@prisma/client";

// merge the generated Prisma Producer with its votes
export type ProducerWithVotes = Producer & { votes: Vote[] };

interface Props {
  initialData: {
    flower: ProducerWithVotes[];
    hash:   ProducerWithVotes[];
  };
}

export default function ProducerList({ initialData }: Props) {
  const [view, setView] = useState<"flower" | "hash">("flower");
  const list =
    view === "flower" ? initialData.flower : initialData.hash;

  return (
    <>
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setView("flower")}
          className={view === "flower" ? "underline" : ""}
        >
          Flower
        </button>
        <button
          onClick={() => setView("hash")}
          className={view === "hash" ? "underline" : ""}
        >
          Hash
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {list.map((producer, i) => (
          <ProducerCard
            key={producer.id}
            rank={i + 1}
            producer={producer}
          />
        ))}
      </div>
    </>
  );
}

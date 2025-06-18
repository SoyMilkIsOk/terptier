// src/components/ProducerCard.tsx
"use client";

import Link from "next/link";
import VoteButton from "./VoteButton";
import type { ProducerWithVotes } from "./ProducerList";

export default function ProducerCard({
  rank,
  producer,
}: {
  rank: number;
  producer: ProducerWithVotes;
}) {
  const total = producer.votes.reduce((sum, v) => sum + v.value, 0);
  const userVote = null; // plug in your user logic

  return (
    <div className="bg-white p-4 rounded shadow flex flex-col">
      <div className="flex items-center mb-2">
        <span className="font-bold mr-2">{rank}.</span>
        {producer.logoUrl && (
          <img
            src={producer.logoUrl}
            alt={producer.name}
            className="h-6 w-6 object-contain mr-2"
          />
        )}
        <Link href={`/profile/${producer.id}`}>
          <h2 className="text-lg font-semibold">
            {producer.name}{" "}
            {producer.category === "FLOWER" ? "🌼" : "🪨"}
          </h2>
        </Link>
      </div>
      <VoteButton
        producerId={producer.id}
        initial={total}
        userVote={userVote}
      />
    </div>
  );
}

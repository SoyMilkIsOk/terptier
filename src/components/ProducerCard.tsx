// src/components/ProducerCard.tsx
"use client";

import Link from "next/link";
import VoteButton from "./VoteButton";
import { MessageCircle } from "lucide-react";
import type { ProducerWithVotes } from "./ProducerList";

export default function ProducerCard({
  rank,
  producer,
  userVoteValue, // Added userVoteValue prop
  isTopTen,
}: {
  rank: number;
  producer: ProducerWithVotes;
  userVoteValue?: number | null; // Added userVoteValue prop type
  isTopTen?: boolean;
}) {
  const total = producer.votes.reduce((sum, v) => sum + v.value, 0);
  const average = producer.votes.length ? total / producer.votes.length : 0;
  const userVote = userVoteValue; // Use the passed prop

  console.log(`[ProducerCard.tsx] producer ${producer.id}: received userVoteValue =`, userVoteValue, "Passing to VoteButton:", userVote);

  return (
    <div className={`${isTopTen === false ? "bg-gray-100" : "bg-white"} p-4 rounded shadow flex flex-col`}>
      <div className="flex items-center mb-2">
        <span className="font-bold mr-2">{rank}.</span>
        {producer.logoUrl && (
          <img
            src={producer.logoUrl}
            alt={producer.name}
            className="h-6 w-6 object-contain mr-2"
          />
        )}
        <Link href={`/producer/${producer.id}`}>
          <h2 className="text-lg font-semibold hover:underline">
            {producer.name}
          </h2>
        </Link>
        <Link href={`/producer/${producer.id}`} className="flex items-center ml-auto">
          <MessageCircle className="w-4 h-4 text-gray-500" />
          <span className="text-sm ml-1">{producer._count?.comments ?? 0}</span>
        </Link>
      </div>
      <VoteButton
        producerId={producer.id}
        initialAverage={average}
        userRating={userVote}
      />
    </div>
  );
}

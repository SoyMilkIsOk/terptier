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

  const link = `/producer/${producer.slug ?? producer.id}`;

  return (
    <Link
      href={link}
      className={`${isTopTen === false ? "bg-gray-100" : "bg-white"} p-4 rounded shadow flex items-center space-x-4 hover:bg-gray-50 transition`}
    >
      <div className="flex items-center justify-center bg-green-600 text-white rounded-md w-10 h-10 font-bold">
        #{rank}
      </div>
      {producer.profileImage || producer.logoUrl ? (
        <img
          src={producer.profileImage || producer.logoUrl!}
          alt={producer.name}
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : null}
      <div className="flex-1">
        <h2 className="text-lg font-semibold">{producer.name}</h2>
        <VoteButton
          producerId={producer.id}
          initialAverage={average}
          userRating={userVote}
          readOnly
          compact
          navigateOnClick
          linkSlug={producer.slug ?? producer.id}
        />
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <MessageCircle className="w-4 h-4 mr-1" />
        {producer._count?.comments ?? 0}
      </div>
    </Link>
  );
}

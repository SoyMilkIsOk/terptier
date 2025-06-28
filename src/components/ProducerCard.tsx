// src/components/ProducerCard.tsx
"use client";

import Link from "next/link";
import VoteButton from "./VoteButton";
import { MessageCircle } from "lucide-react";
import type { ProducerWithVotes } from "./ProducerList";

export default function ProducerCard({
  rank,
  producer,
  userVoteValue,
  isTopTen,
  color = "green",
  rankSuffix = "",
}: {
  rank: number;
  producer: ProducerWithVotes;
  userVoteValue?: number | null;
  isTopTen?: boolean;
  color?: "gold" | "silver" | "bronze" | "gray" | "green";
  rankSuffix?: string;
}) {
  const total = producer.votes.reduce((sum, v) => sum + v.value, 0);
  const average = producer.votes.length ? total / producer.votes.length : 0;
  const userVote = userVoteValue;

  const colorClasses: Record<string, string> = {
    gold: "bg-gradient-to-br from-yellow-300 to-yellow-600 text-yellow-100",
    silver: "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-100",
    bronze: "bg-gradient-to-br from-orange-300 to-orange-700 text-orange-100",
    gray: "bg-gray-400 text-white",
    green: "bg-green-600 text-white",
  };

  const glowClass =
    color === "gold"
      ? "glow-gold"
      : color === "silver"
      ? "glow-silver"
      : color === "bronze"
      ? "glow-bronze"
      : "";

  const link = `/producer/${producer.slug ?? producer.id}`;

  return (
    <Link
      href={link}
      className={`${isTopTen === false ? "bg-gray-100" : "bg-white"} ${glowClass} p-4 rounded shadow flex items-center space-x-4 hover:bg-gray-50 transition`}
    >
      <div className={`flex items-center justify-center ${colorClasses[color]} rounded-md w-10 h-10 font-bold`}>
        {rank}
        {rankSuffix && (
          <sup className="text-[0.6rem] ml-0.5 align-super">{rankSuffix}</sup>
        )}
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

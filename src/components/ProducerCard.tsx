// src/components/ProducerCard.tsx
"use client";

import Link from "next/link";
import VoteButton from "./VoteButton";
import { MessageCircle } from "lucide-react";
import type { ProducerWithVotes } from "./ProducerList";
import { ATTRIBUTE_OPTIONS } from "@/constants/attributes";
import Tooltip from "./Tooltip";
import { useStateSlug } from "./StateProvider";

export default function ProducerCard({
  rank,
  producer,
  userVoteValue,
  isTopTen,
  color = "green",
  rankSuffix = "",
  showRank = true,
  useColors = true,
  appearance = "light",
}: {
  rank: number;
  producer: ProducerWithVotes;
  userVoteValue?: number | null;
  isTopTen?: boolean;
  color?: "gold" | "silver" | "bronze" | "gray" | "green" | "none";
  rankSuffix?: string;
  showRank?: boolean;
  useColors?: boolean;
  appearance?: "light" | "gray" | "dark";
}) {
  const stateSlug = useStateSlug();
  const total = producer.votes.reduce((sum, v) => sum + v.value, 0);
  const average = producer.votes.length ? total / producer.votes.length : 0;
  const userVote = userVoteValue;

  const colorClasses: Record<string, string> = {
    gold: "bg-gradient-to-br from-yellow-300 to-yellow-600 text-yellow-100",
    silver: "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-100",
    bronze: "bg-gradient-to-br from-orange-300 to-orange-700 text-orange-100",
    gray: "bg-gray-400 text-white",
    green: "bg-green-600 text-white",
    none: "bg-gray-200 text-gray-700",
  };

  const glowClass =
    useColors && color === "gold"
      ? "glow-gold"
      : useColors && color === "silver"
      ? "glow-silver"
      : useColors && color === "bronze"
      ? "glow-bronze"
      : "";

  const appearanceStyles: Record<
    "light" | "gray" | "dark",
    {
      container: string;
      secondary: string;
      hover: string;
      text: string;
      comment: string;
      commentIcon: string;
      attributeTag: string;
      attributeIcon: string;
    }
  > = {
    light: {
      container: "bg-white border border-green-100/80",
      secondary: "bg-white border border-green-50",
      hover: "hover:bg-green-50/60",
      text: "text-slate-900",
      comment: "text-green-700",
      commentIcon: "text-green-600",
      attributeTag: "bg-green-200/30 text-green-700",
      attributeIcon: "text-green-400",
    },
    gray: {
      container:
        "bg-white/85 border border-green-200/60 backdrop-blur shadow-sm",
      secondary:
        "bg-white/75 border border-green-200/40 backdrop-blur shadow-sm",
      hover: "hover:bg-green-50/40",
      text: "text-slate-900",
      comment: "text-green-700",
      commentIcon: "text-green-600",
      attributeTag: "bg-green-200/30 text-green-700",
      attributeIcon: "text-green-500",
    },
    dark: {
      container: "bg-green-950/60 border border-green-800",
      secondary: "bg-green-950/40 border border-green-900/60",
      hover: "hover:bg-green-900/40",
      text: "text-green-50",
      comment: "text-green-200",
      commentIcon: "text-green-300",
      attributeTag: "bg-green-200/30 text-green-200",
      attributeIcon: "text-green-200",
    },
  };

  const activeAppearance = appearanceStyles[appearance];
  const containerClass =
    isTopTen === false ? activeAppearance.secondary : activeAppearance.container;

  const link = `/${stateSlug}/producer/${producer.slug ?? producer.id}`;

  const badgeClasses = `flex items-center justify-center ${colorClasses[useColors ? color : "none"]} rounded-full w-10 h-10 font-bold`;

  return (
    <Link
      href={link}
      className={`${containerClass} ${activeAppearance.hover} ${glowClass} ${activeAppearance.text} p-4 rounded shadow flex items-center space-x-4 transition-colors duration-300`}
    >
      {showRank && (
        <div className={badgeClasses}>
          {rank}
          {rankSuffix && (
            <sup className="text-[0.5rem] ml-0.25 align-super">{rankSuffix}</sup>
          )}
        </div>
      )}
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
        {producer.attributes && producer.attributes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {producer.attributes.map((a) => {
              const opt = ATTRIBUTE_OPTIONS[producer.category].find(
                (o) => o.key === a
              );
              return (
                <Tooltip key={a} content={opt?.tooltip}>
                  <span
                    className={`text-xs rounded-full px-2 py-0.5 flex items-center gap-1 ${activeAppearance.attributeTag}`}
                  >
                    <span className={activeAppearance.attributeIcon}>
                      {opt?.icon}
                    </span>
                  </span>
                </Tooltip>
              );
            })}
          </div>
        )}
      </div>
      <div className={`flex items-center text-sm ${activeAppearance.comment}`}>
        <MessageCircle
          className={`w-4 h-4 mr-1 ${activeAppearance.commentIcon}`}
        />
        {producer._count?.comments ?? 0}
      </div>
    </Link>
  );
}

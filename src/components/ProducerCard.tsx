// src/components/ProducerCard.tsx
"use client";

import Link from "next/link";
import VoteButton from "./VoteButton";
import { MessageCircle } from "lucide-react";
import type { ProducerWithVotes } from "./ProducerList";
import { ATTRIBUTE_OPTIONS } from "@/constants/attributes";
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
    gold: "bg-gradient-to-br from-yellow-300 to-yellow-600 text-yellow-50",
    silver: "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-50",
    bronze: "bg-gradient-to-br from-orange-300 to-orange-700 text-orange-50",
    gray: "bg-gray-500 text-white",
    green: "bg-emerald-600 text-white",
    none: "bg-gray-200 text-gray-700",
  };

  const topRank = useColors && rank <= 3;
  const accentRing =
    color === "gold"
      ? "ring-yellow-400/40 shadow-[0_0_24px_rgba(250,204,21,0.25)]"
      : color === "silver"
      ? "ring-gray-300/40 shadow-[0_0_24px_rgba(209,213,219,0.22)]"
      : color === "bronze"
      ? "ring-orange-400/40 shadow-[0_0_24px_rgba(251,146,60,0.22)]"
      : color === "green"
      ? "ring-emerald-400/30 shadow-[0_0_24px_rgba(16,185,129,0.20)]"
      : "ring-transparent shadow-none";

  const appearanceStyles: Record<
    "light" | "gray" | "dark",
    {
      container: string;
      secondary: string;
      hover: string;
      text: string;
      comment: string;
      commentIcon: string;
      attributeIcon: string;
      baseRing: string;
      borderColor: string;
      fadeFrom: string;
    }
  > = {
    light: {
      container: "bg-white border border-green-100/80",
      secondary: "bg-white border border-green-50",
      hover: "hover:bg-green-50/60",
      text: "text-slate-900",
      comment: "text-green-700",
      commentIcon: "text-green-600",
      attributeIcon: "text-green-500",
      baseRing: "ring-0",
      borderColor: "border-green-100/80",
      fadeFrom: "from-white",
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
      attributeIcon: "text-green-600",
      baseRing: "ring-1 ring-black/5",
      borderColor: "border-green-200/60",
      fadeFrom: "from-white/85",
    },
    dark: {
      container: "bg-green-950/60 border border-green-800",
      secondary: "bg-green-950/40 border border-green-900/60",
      hover: "hover:bg-green-900/40",
      text: "text-green-50",
      comment: "text-green-200",
      commentIcon: "text-green-300",
      attributeIcon: "text-emerald-200",
      baseRing: "ring-1 ring-white/5",
      borderColor: "border-green-800",
      fadeFrom: "from-green-950/60",
    },
  };

  const activeAppearance = appearanceStyles[appearance];
  const containerBase =
    isTopTen === false ? activeAppearance.secondary : activeAppearance.container;

  const link = `/${stateSlug}/producer/${producer.slug ?? producer.id}`;

  // Triangle size (matches rounded card edge visually)
  const TRI_SIZE_REM = 4.5; // ~72px; tweak as needed

  return (
    <Link
      href={link}
      className={[
        "relative isolate overflow-hidden",
        containerBase,
        activeAppearance.hover,
        activeAppearance.text,
        "p-5 rounded-2xl shadow transition-colors duration-300",
        "flex items-center gap-4",
        topRank ? `ring-2 ${accentRing}` : activeAppearance.baseRing,
      ].join(" ")}
    >
      {/* Top-left triangle rank medallion */}
      {showRank && (
        <div
          className={[
            "absolute top-0 left-0",
            useColors ? colorClasses[color] : colorClasses["none"],
            "border-t",
            "border-l",
            activeAppearance.borderColor,
          ].join(" ")}
          style={{
            width: `${TRI_SIZE_REM}rem`,
            height: `${TRI_SIZE_REM}rem`,
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
            zIndex: 1,
          }}
        >
          {/* Rank text aligned along the hypotenuse (nudged) */}
          <div
            className="absolute origin-top-left"
            style={{
              transform: "translate(0rem, 1.3rem) rotate(-45deg)",
            }}
          >
            <span className="flex items-baseline gap-1 font-extrabold leading-none tracking-tight">
              <span className="text-2xl">{rank}</span>
              {rankSuffix ? (
                <sup className="text-xs align-super">{rankSuffix}</sup>
              ) : null}
            </span>
          </div>
        </div>
      )}

      {/* Big image */}
      {producer.profileImage || producer.logoUrl ? (
        <img
          src={producer.profileImage || producer.logoUrl!}
          alt={producer.name}
          className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl object-cover flex-shrink-0"
          style={{ zIndex: 0 }}
        />
      ) : (
        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-gray-200/50 flex items-center justify-center text-xs uppercase tracking-wide text-gray-500">
          No Image
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Header row: Title + Stars on left, Comments on right */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-semibold leading-tight line-clamp-1">
              {producer.name}
            </h2>
            <div className="mt-1 origin-left scale-[1.15]">
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
          </div>

          {/* Comments bubble */}
          <div
            className={`flex flex-none items-center text-base ${activeAppearance.comment}`}
            title="Comments"
          >
            <MessageCircle
              className={`w-5 h-5 mr-1.5 ${activeAppearance.commentIcon}`}
            />
            {producer._count?.comments ?? 0}
          </div>
        </div>

        {/* Attributes row: single line, horizontal scroll with gradient fades (no tooltips) */}
        {producer.attributes && producer.attributes.length > 0 && (
          <div className="relative mt-3">
            {/* Left fade */}
            <div
              className={[
                "pointer-events-none absolute inset-y-0 left-0 w-6 z-10",
                "bg-gradient-to-r",
                activeAppearance.fadeFrom,
                "to-transparent",
                "rounded-l-xl",
              ].join(" ")}
            />
            {/* Right fade */}
            <div
              className={[
                "pointer-events-none absolute inset-y-0 right-0 w-6 z-10",
                "bg-gradient-to-l",
                activeAppearance.fadeFrom,
                "to-transparent",
                "rounded-r-xl",
              ].join(" ")}
            />
            <div
              className={[
                "flex items-center gap-3 pr-4 pl-2",
                "overflow-x-auto whitespace-nowrap",
                // let icons be vertically unclipped if needed
                "overflow-y-visible",
                // hide scrollbars cross-browser
                "[scrollbar-width:none]",
                "[&::-webkit-scrollbar]:hidden",
              ].join(" ")}
            >
              {producer.attributes.map((a) => {
                const opt = ATTRIBUTE_OPTIONS[producer.category].find(
                  (o) => o.key === a,
                );
                return (
                  <span
                    key={a}
                    className={[
                      "flex-none inline-flex items-center justify-center",
                      "h-8 w-8 rounded-lg",
                      activeAppearance.attributeIcon,
                      appearance === "dark"
                        ? "bg-emerald-400/10"
                        : "bg-emerald-50",
                    ].join(" ")}
                    aria-label={opt?.tooltip ?? a}
                    title={opt?.tooltip ?? a}
                  >
                    <span className="text-xl leading-none">{opt?.icon}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

// src/components/ProducerList.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import SearchBar from "./SearchBar";
import ProducerCard from "./ProducerCard";
import CategoryToggle from "./CategoryToggle";
import type { Producer, Vote } from "@prisma/client";

// merge the generated Prisma Producer with its votes
export type ProducerWithVotes = Producer & {
  votes: Vote[];
  attributes: string[];
  _count?: { comments: number };
};

interface Props {
  initialData: {
    flower: ProducerWithVotes[];
    hash: ProducerWithVotes[];
  };
  userVotes?: Record<string, number>; // Added userVotes to Props
  initialView?: "flower" | "hash";
  useColors?: boolean;
}

export default function ProducerList({
  initialData,
  userVotes,
  initialView,
  useColors = true,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [view, setView] = useState<"flower" | "hash">(initialView ?? "flower");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);

  // Initialize view from url params or localStorage
  useEffect(() => {
    const param = searchParams.get("view");
    if (param === "flower" || param === "hash") {
      setView(param);
      return;
    }
    const stored = localStorage.getItem("terptier_view");
    if (stored === "flower" || stored === "hash") {
      setView(stored);
    }
  }, [searchParams]);

  // Persist view selection and update url without full reload
  useEffect(() => {
    localStorage.setItem("terptier_view", view);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [view, router, searchParams, pathname]);

  const updateView = (v: "flower" | "hash") => {
    setView(v);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", v);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    localStorage.setItem("terptier_view", v);
  };
  const list = view === "flower" ? initialData.flower : initialData.hash;

  const filteredList = list.filter((producer) => {
    if (!searchTerm && selectedAttributes.length === 0) return true;
    try {
      const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(?<!['’])\\b${escaped}`, "i");
      const nameMatch = searchTerm ? regex.test(producer.name) : true;
      const attrMatch = selectedAttributes.every((a) =>
        (producer.attributes || []).includes(a)
      );
      return nameMatch && attrMatch;
    } catch {
      const nameMatch = searchTerm
        ? producer.name.toLowerCase().startsWith(searchTerm.toLowerCase())
        : true;
      const attrMatch = selectedAttributes.every((a) =>
        (producer.attributes || []).includes(a)
      );
      return nameMatch && attrMatch;
    }
  });

  const getSuffix = (n: number) => {
    const j = n % 10;
    const k = n % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };


  return (
    <>
      <div className="flex justify-center mb-4">
        <CategoryToggle view={view} setView={updateView} />
      </div>
      <SearchBar
        onSearch={setSearchTerm}
        selectedAttributes={selectedAttributes}
        onAttributesChange={setSelectedAttributes}
      />
      <div className="grid md:grid-cols-2 gap-4 mx-4 mb-4">
        {filteredList.map((producer, i) => {
          const userVoteValue = userVotes?.[producer.id];
          const rank = i + 1;
          let color: "gold" | "silver" | "bronze" | "gray" | "green" = "green";
          if (rank === 1) color = "gold";
          else if (rank === 2) color = "silver";
          else if (rank === 3) color = "bronze";
          else if (rank > 10) color = "gray";
          const suffix = getSuffix(rank);

          const finalColor = useColors ? color : ("none" as const);

          return (
            <ProducerCard
              key={producer.id}
              rank={rank}
              rankSuffix={suffix}
              producer={producer}
              userVoteValue={userVoteValue}
              isTopTen={i < 10}
              color={finalColor}
              useColors={useColors}
            />
          );
        })}
      </div>
    </>
  );
}

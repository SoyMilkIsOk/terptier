// src/components/ProducerList.tsx
"use client";

import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
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
  const [view, setView] = useState<"flower" | "hash">(initialView ?? "flower");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Initialize view from localStorage if available
  useEffect(() => {
    const stored = localStorage.getItem("terptier_view");
    if (stored === "flower" || stored === "hash") {
      setView(stored);
    }
  }, []);

  // Persist view selection
  useEffect(() => {
    localStorage.setItem("terptier_view", view);
  }, [view]);

  const updateView = (v: "flower" | "hash") => {
    setView(v);
  };
  const list = view === "flower" ? initialData.flower : initialData.hash;

  const filteredList = list.filter((producer) => {
    if (!searchTerm) return true;
    try {
      const regex = new RegExp(searchTerm, "i");
      return regex.test(producer.name);
    } catch {
      return producer.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

  console.log("[ProducerList.tsx] userVotes prop:", userVotes);

  return (
    <>
      <div className="flex justify-center mb-4">
        <CategoryToggle view={view} setView={updateView} />
      </div>

      <SearchBar onSearch={setSearchTerm} />
      <div className="grid md:grid-cols-2 gap-4">
        {filteredList.map((producer, i) => {
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

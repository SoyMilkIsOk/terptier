"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import StrainCard from "@/components/StrainCard";
import type { Strain } from "@prisma/client";

interface StrainListItem extends Pick<
  Strain,
  "id" | "name" | "imageUrl" | "releaseDate" | "strainSlug"
> {
  _count?: { StrainReview: number };
  avgRating?: number | null;
}

interface ProducerStrainListProps {
  strains: StrainListItem[];
  producerSlug: string;
}

export default function ProducerStrainList({
  strains,
  producerSlug,
}: ProducerStrainListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const term = searchTerm.toLowerCase();
  const filteredStrains = strains.filter((strain) => {
    if (!term) return true;
    return strain.name
      .toLowerCase()
      .split(/\s+/)
      .some((word) => word.startsWith(term));
  });

  return (
    <>
      <SearchBar
        onSearch={setSearchTerm}
        placeholder="Search strains..."
        enableFilters={false}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStrains.map((strain) => (
          <StrainCard
            key={strain.id}
            strain={strain}
            producerSlug={producerSlug}
          />
        ))}
      </div>
    </>
  );
}


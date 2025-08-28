// src/components/UpcomingStrainList.tsx
import type { Strain } from "@prisma/client";
import StrainCard from "./StrainCard";

type StrainListItem = Pick<
  Strain,
  "id" | "name" | "description" | "imageUrl" | "releaseDate" | "strainSlug"
> & { _count?: { StrainReview: number } };

interface UpcomingStrainListProps {
  strains: StrainListItem[];
  producerSlug: string;
}

export default function UpcomingStrainList({
  strains,
  producerSlug,
}: UpcomingStrainListProps) {
  if (strains.length === 0) {
    return <p className="text-gray-500 italic">No strains.</p>;
  }

  return (
    <ul className="space-y-4">
      {strains.map((strain) => {
        const releaseDate = strain.releaseDate
          ? new Date(strain.releaseDate)
          : null;
        const hasDropped = releaseDate ? releaseDate < new Date() : false;

        return (
          <li key={strain.id}>
            <StrainCard strain={strain} producerSlug={producerSlug}>
              {releaseDate && (
                <p className="text-sm text-gray-500">
                  {hasDropped ? "Dropped on" : "Drops on"}{" "}
                  {releaseDate.toLocaleDateString()}
                </p>
              )}
            </StrainCard>
          </li>
        );
      })}
    </ul>
  );
}

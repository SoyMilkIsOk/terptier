// src/components/UpcomingStrainList.tsx
import type { Strain } from "@prisma/client";
import StrainCard from "./StrainCard";

type StrainListItem = Pick<
  Strain,
  "id" | "name" | "description" | "imageUrl" | "releaseDate" | "strainSlug"
> & { _count?: { StrainReview: number }; avgRating?: number | null };

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

  const now = new Date();

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
    }).format(date);

  return (
    <ul className="space-y-4">
      {strains.map((strain) => {
        const releaseDate = strain.releaseDate
          ? new Date(strain.releaseDate)
          : null;
        const diffDays = releaseDate
          ? Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null;
        const showBadge = diffDays !== null && diffDays >= 0 && diffDays <= 30;
        const hasDropped = releaseDate ? releaseDate < now : false;

        return (
          <li key={strain.id}>
            <StrainCard strain={strain} producerSlug={producerSlug}>
              {releaseDate && (
                showBadge && !hasDropped ? (
                  <div className="mt-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                        diffDays === 0
                          ? "bg-red-100 text-red-700"
                          : diffDays === 1
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {diffDays === 0
                        ? "Today"
                        : diffDays === 1
                        ? "Tomorrow"
                        : `${diffDays}d`}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {hasDropped ? "Dropped on" : "Drops on"} {formatDate(releaseDate)}
                  </p>
                )
              )}
            </StrainCard>
          </li>
        );
      })}
    </ul>
  );
}

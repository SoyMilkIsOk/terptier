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
  const mstParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const year = parseInt(mstParts.find((p) => p.type === "year")!.value, 10);
  const month = parseInt(mstParts.find((p) => p.type === "month")!.value, 10);
  const day = parseInt(mstParts.find((p) => p.type === "day")!.value, 10);
  const todayUtc = Date.UTC(year, month - 1, day);

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
          ? Math.round(
              (Date.UTC(
                releaseDate.getUTCFullYear(),
                releaseDate.getUTCMonth(),
                releaseDate.getUTCDate()
              ) - todayUtc) /
                (1000 * 60 * 60 * 24)
            )
          : null;
        const showBadge = diffDays !== null && diffDays >= 0 && diffDays <= 30;
        const hasDropped = releaseDate
          ? Date.UTC(
              releaseDate.getUTCFullYear(),
              releaseDate.getUTCMonth(),
              releaseDate.getUTCDate()
            ) < todayUtc
          : false;

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

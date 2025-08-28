// src/components/UpcomingStrainList.tsx
import type { Strain } from "@prisma/client";
import Image from "next/image";

type StrainListItem = Pick<
  Strain,
  "id" | "name" | "description" | "imageUrl" | "releaseDate" | "strainSlug"
>;

interface UpcomingStrainListProps {
  strains: StrainListItem[];
}

export default function UpcomingStrainList({ strains }: UpcomingStrainListProps) {
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
          <li
            key={strain.id}
            className="bg-white shadow rounded p-4 flex items-center space-x-4"
          >
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={strain.imageUrl || "https://placehold.co/64"}
                alt={strain.name}
                fill
                className="object-cover rounded"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{strain.name}</h3>
              {releaseDate && (
                <p className="text-sm text-gray-500">
                  {hasDropped ? "Dropped on" : "Drops on"} {releaseDate.toLocaleDateString()}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

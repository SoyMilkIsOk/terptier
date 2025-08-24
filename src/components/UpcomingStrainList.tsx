// src/components/UpcomingStrainList.tsx
import type { Strain } from "@prisma/client";
import Image from "next/image";

interface UpcomingStrainListProps {
  strains: Strain[];
}

export default function UpcomingStrainList({ strains }: UpcomingStrainListProps) {
  if (strains.length === 0) {
    return <p className="text-gray-500">No upcoming strains.</p>;
  }

  return (
    <ul className="space-y-4">
      {strains.map((strain) => (
        <li
          key={strain.id}
          className="bg-white shadow rounded p-4 flex items-center space-x-4"
        >
          {strain.imageUrl && (
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={strain.imageUrl}
                alt={strain.name}
                fill
                className="object-cover rounded"
              />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold">{strain.name}</h3>
            {strain.releaseDate && (
              <p className="text-sm text-gray-500">
                Releases on {new Date(strain.releaseDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

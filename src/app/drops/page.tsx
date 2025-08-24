// src/app/drops/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prismadb";
import UpcomingStrainList from "@/components/UpcomingStrainList";

export default async function DropsPage() {
  const now = new Date();
  const sevenDays = new Date();
  sevenDays.setDate(now.getDate() + 7);

  const strains = await prisma.strain.findMany({
    where: { releaseDate: { gte: now, lte: sevenDays } },
    include: { producer: true },
    orderBy: { releaseDate: "asc" },
  });

  const grouped = strains.reduce<Record<string, { producer: typeof strains[number]["producer"]; strains: typeof strains }>>(
    (acc, strain) => {
      const producerId = strain.producer.id;
      if (!acc[producerId]) {
        acc[producerId] = { producer: strain.producer, strains: [] };
      }
      acc[producerId].strains.push(strain);
      return acc;
    },
    {}
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Upcoming Drops</h1>
      {Object.values(grouped).length === 0 ? (
        <p>No upcoming strains this week.</p>
      ) : (
        Object.values(grouped).map(({ producer, strains }) => (
          <div key={producer.id} className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">
              <Link
                href={`/drops/${producer.slug ?? producer.id}`}
                className="text-green-700 hover:underline"
              >
                {producer.name}
              </Link>
              <Link
                href={`/producer/${producer.slug ?? producer.id}`}
                className="ml-2 text-sm text-gray-500 hover:underline"
              >
                Profile
              </Link>
            </h2>
            <UpcomingStrainList strains={strains} />
          </div>
        ))
      )}
    </div>
  );
}

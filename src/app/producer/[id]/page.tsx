// src/app/producer/[id]/page.tsx
import { prisma } from "@/lib/prismadb";
import Image from "next/image"; // For optimized images if using producer.logoUrl

interface ProducerProfilePageProps {
  params: {
    id: string;
  };
}

export default async function ProducerProfilePage({ params }: ProducerProfilePageProps) {
  const { id } = params;

  const producer = await prisma.producer.findUnique({
    where: { id },
    include: {
      votes: true, // To calculate total score
    },
  });

  if (!producer) {
    return <p>Producer not found.</p>;
  }

  const totalScore = producer.votes.reduce((sum, vote) => sum + vote.value, 0);

  return (
    <div className="container mx-auto p-4 mt-8">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center mb-6 pb-6 border-b border-gray-200">
          {producer.logoUrl && (
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 mr-0 sm:mr-6 mb-4 sm:mb-0 flex-shrink-0">
              <Image
                src={producer.logoUrl}
                alt={`${producer.name} logo`}
                layout="fill"
                className="rounded-lg object-contain"
              />
            </div>
          )}
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold text-gray-800">{producer.name}</h1>
            <p className="text-gray-600 text-xl capitalize">{producer.category.toLowerCase()}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Current Score:
            <span className={`ml-2 font-bold ${totalScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalScore}
            </span>
          </h2>
        </div>

        {/* Placeholder for more details */}
        {/* For example:
        {producer.description && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">About {producer.name}</h3>
            <p className="text-gray-700 leading-relaxed">{producer.description}</p>
          </div>
        )}
        */}

        {/* You could also list individual votes or comments here if desired in a future iteration */}

      </div>
    </div>
  );
}

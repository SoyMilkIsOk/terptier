"use client";

import ProducerCard from "./ProducerCard";
import StrainCard from "./StrainCard";
import type { SearchResultItem } from "@/app/api/search/route";
import { Category } from "@prisma/client";

export default function SearchResults({
  results,
}: {
  results: SearchResultItem[];
}) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No results found.</p>
        <p className="text-sm">Try adjusting your search terms or filters.</p>
      </div>
    );
  }

  const producers = results.filter((r) => r.type === "PRODUCER");
  const strains = results.filter((r) => r.type === "STRAIN");

  return (
    <div className="space-y-8">
      {producers.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-4">
             <h2 className="text-xl font-bold text-gray-800">Producers</h2>
             <div className="h-px bg-gray-200 flex-1"></div>
          </div>
          <div className="space-y-4">
            {producers.map((item) => (
              <ProducerCard
                key={item.id}
                rank={0}
                showRank={false}
                producer={{
                  id: item.id,
                  name: item.name,
                  slug: item.slug,
                  profileImage: item.imageUrl,
                  category: item.category,
                  votes: [], // Using explicit rating props
                  _count: { comments: item.commentCount || 0 }, // Pass comment count
                  attributes: [],
                } as any}
                stateSlug={item.state.slug}
                stateName={item.state.name}
                averageRating={item.averageRating}
                voteCount={item.voteCount}
                showTags={true}
              />
            ))}
          </div>
        </section>
      )}

      {strains.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-4">
             <h2 className="text-xl font-bold text-gray-800">Strains</h2>
             <div className="h-px bg-gray-200 flex-1"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strains.map((item) => (
              <StrainCard
                key={item.id}
                strain={{
                  id: item.id,
                  name: item.name,
                  imageUrl: item.imageUrl,
                  strainSlug: item.strainSlug!,
                  _count: { StrainReview: item.reviewCount || 0 }, // Pass review count
                  avgRating: null,
                }}
                producerSlug={item.producerSlug || item.producerName || ""}
                stateSlug={item.state.slug}
              >
                <div className="flex flex-col text-sm text-gray-500">
                    <span>by {item.producerName}</span>
                    <span className="text-xs text-gray-400 capitalize">{item.state.name}</span>
                </div>
              </StrainCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

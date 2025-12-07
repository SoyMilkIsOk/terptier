import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { Category, Market, Producer, Strain } from "@prisma/client";

export const dynamic = "force-dynamic";

type SearchResultType = "PRODUCER" | "STRAIN";

export interface SearchResultItem {
  type: SearchResultType;
  id: string;
  name: string;
  slug: string | null; // For producer
  strainSlug: string | null; // For strain
  description: string | null;
  imageUrl: string | null;
  state: {
    name: string;
    slug: string;
  };
  producerName?: string; // For strain
  producerSlug?: string; // For strain
  category?: Category; // For producer
  market?: Market; // For producer
  averageRating?: number;
  voteCount?: number;
  commentCount?: number;
  reviewCount?: number;
  relevance: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const stateFilter = searchParams.get("state");
    const categoryFilter = searchParams.get("category"); // FLOWER or HASH
    const typeFilter = searchParams.get("type"); // PRODUCER or STRAIN

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const whereState = stateFilter
      ? { state: { slug: stateFilter } }
      : {};

    const categoryEnum =
      categoryFilter === "FLOWER"
        ? Category.FLOWER
        : categoryFilter === "HASH"
          ? Category.HASH
          : undefined;

    // --- Search Producers ---
    let producers: (Producer & {
      state: { name: string; slug: string };
      votes: { value: number }[];
      _count: { comments: number };
    })[] = [];

    if (!typeFilter || typeFilter === "PRODUCER") {
      producers = await prisma.producer.findMany({
        where: {
          AND: [
            stateFilter ? { state: { slug: stateFilter } } : {},
            categoryEnum ? { category: categoryEnum } : {},
            {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { slug: { contains: query, mode: "insensitive" } },
              ],
            },
          ],
        },
        include: {
          votes: { select: { value: true } },
          _count: { select: { comments: true } },
          state: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        take: 20,
      });
    }

    // --- Search Strains ---
    let strains: (Strain & {
      state: { name: string; slug: string };
      producer: { name: string; slug: string | null; id: string };
      _count: { StrainReview: number };
    })[] = [];

    if (!typeFilter || typeFilter === "STRAIN") {
      // For strains, we might want to filter by producer category if that filter is on,
      // but usually strains don't have a direct category field unless we check their producer.
      // The schema shows Producer has category, Strain does not.
      // So if categoryFilter is present, we should filter strains where strain.producer.category == categoryFilter

      strains = await prisma.strain.findMany({
        where: {
          AND: [
            stateFilter ? { state: { slug: stateFilter } } : {},
            categoryEnum ? { producer: { category: categoryEnum } } : {},
            {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { producer: { name: { contains: query, mode: "insensitive" } } }, // NEW: Search by producer name
              ],
            },
          ],
        },
        include: {
          state: {
            select: {
              name: true,
              slug: true,
            },
          },
          producer: {
            select: {
              name: true,
              slug: true,
              id: true, // fallback if slug is missing
            },
          },
          _count: { select: { StrainReview: true } },
        },
        take: 20,
      });
    }

    // Calculate Relevance & Format
    const calculateRelevance = (text: string | null, q: string) => {
      if (!text) return 0;
      const lowerText = text.toLowerCase();
      const lowerQuery = q.toLowerCase();
      if (lowerText === lowerQuery) return 100;
      if (lowerText.startsWith(lowerQuery)) return 80;
      if (lowerText.includes(lowerQuery)) return 60;
      return 0;
    };

    const mappedProducers: SearchResultItem[] = producers.map((p) => {
      let relevance = calculateRelevance(p.name, query);
      // Boost producer relevance slightly to prioritize them in mixed view if names match
      relevance += 20;
      // Also check slug
      const slugRelevance = calculateRelevance(p.slug, query);
      if (slugRelevance > relevance) relevance = slugRelevance;

      const total = p.votes.reduce((sum, v) => sum + v.value, 0);
      const count = p.votes.length;
      const averageRating = count ? total / count : 0;

      return {
        type: "PRODUCER",
        id: p.id,
        name: p.name,
        slug: p.slug,
        strainSlug: null,
        description: null,
        imageUrl: p.profileImage || p.logoUrl,
        state: p.state,
        category: p.category,
        market: p.market,
        averageRating,
        voteCount: count,
        commentCount: p._count.comments,
        relevance,
      };
    });

    const mappedStrains: SearchResultItem[] = strains.map((s) => {
      let relevance = calculateRelevance(s.name, query);
      // Check producer name relevance too
      const producerRelevance = calculateRelevance(s.producer.name, query) - 10; // Slightly lower than direct strain match
      if (producerRelevance > relevance) relevance = producerRelevance;

      return {
        type: "STRAIN",
        id: s.id,
        name: s.name,
        slug: null, // Strains don't have a top-level slug usually? StrainCard uses strainSlug.
        strainSlug: s.strainSlug,
        description: s.description,
        imageUrl: s.imageUrl,
        state: s.state,
        producerName: s.producer.name,
        producerSlug: s.producer.slug ?? s.producer.id,
        reviewCount: s._count.StrainReview,
        relevance,
      };
    });

    const allResults = [...mappedProducers, ...mappedStrains].sort(
      (a, b) => b.relevance - a.relevance,
    );

    return NextResponse.json({ results: allResults });
  } catch (error: any) {
    console.error("[/api/search] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

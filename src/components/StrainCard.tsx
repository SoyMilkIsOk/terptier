// src/components/StrainCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Star } from "lucide-react";
import type { Strain } from "@prisma/client";
import type { ReactNode } from "react";
import { useStateSlug } from "./StateProvider";

interface StrainCardProps {
  strain: Pick<
    Strain,
    "id" | "name" | "imageUrl" | "strainSlug"
  > & { _count?: { StrainReview: number }; avgRating?: number | null };
  producerSlug: string;
  children?: ReactNode;
}

export default function StrainCard({
  strain,
  producerSlug,
  children,
}: StrainCardProps) {
  const stateSlug = useStateSlug();
  return (
    <Link
      href={`/${stateSlug}/producer/${producerSlug}/${strain.strainSlug}`}
      className="flex items-center space-x-4 bg-white shadow rounded p-4 hover:bg-gray-50 transition"
    >
      <div className="relative w-16 h-16 flex-shrink-0">
        <Image
          src={strain.imageUrl || "https://placehold.co/64/png"}
          alt={strain.name}
          fill
          className="object-cover rounded"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{strain.name}</h3>
        {children}
      </div>
      <div className="flex flex-col items-end text-sm text-gray-600">
        {typeof strain.avgRating === "number" && (
          <div className="flex items-center mb-1 text-yellow-500">
            <Star className="w-4 h-4 mr-1" fill="currentColor" />
            {strain.avgRating.toFixed(1)}
          </div>
        )}
        <div className="flex items-center">
          <MessageCircle className="w-4 h-4 mr-1" />
          {strain._count?.StrainReview ?? 0}
        </div>
      </div>
    </Link>
  );
}


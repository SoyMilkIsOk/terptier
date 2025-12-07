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
  className?: string;
  titleClassName?: string;
  metaClassName?: string;
  stateSlug?: string;
}

export default function StrainCard({
  strain,
  producerSlug,
  children,
  className,
  titleClassName,
  metaClassName,
  stateSlug: propsStateSlug,
}: StrainCardProps) {
  const contextStateSlug = useStateSlug();
  const stateSlug = propsStateSlug ?? contextStateSlug;
  const baseClass =
    "flex items-center space-x-4 rounded p-4 shadow transition-colors duration-300";
  const containerClass = [
    baseClass,
    className ?? "bg-white text-gray-900 hover:bg-gray-50",
  ]
    .filter(Boolean)
    .join(" ");
  const titleClass = ["text-lg font-semibold", titleClassName]
    .filter(Boolean)
    .join(" ");
  const metaClass = [
    "flex flex-col items-end text-sm",
    metaClassName ?? "text-gray-600",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <Link
      href={`/${stateSlug}/producer/${producerSlug}/${strain.strainSlug}`}
      className={containerClass}
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
        <h3 className={titleClass}>{strain.name}</h3>
        {children}
      </div>
      <div className={metaClass}>
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


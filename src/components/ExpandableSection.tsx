"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandableSectionProps {
  children: React.ReactNode;
  title: string;
  count: number;
  initialShowCount?: number;
  className?: string;
}

export default function ExpandableSection({
  children,
  title,
  count,
  initialShowCount = 3,
  className = "",
}: ExpandableSectionProps) {
  const items = React.Children.toArray(children);
  const [visibleCount, setVisibleCount] = useState(
    Math.min(initialShowCount, items.length)
  );

  const showMore = () =>
    setVisibleCount((prev) => Math.min(prev + initialShowCount, items.length));

  const showLess = () => setVisibleCount(Math.min(initialShowCount, items.length));

  const allVisible = visibleCount >= items.length;

  return (
    <div
      className={`bg-white shadow-lg rounded-2xl border border-green-100 hover:shadow-xl transition-shadow duration-300 ${className}`}
    >
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {title}
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
              {count}
            </span>
          </h2>
        </div>

        {count > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {items.slice(0, visibleCount)}
            </div>

            {count > initialShowCount && (
              <div className="flex justify-center">
                {!allVisible ? (
                  <button
                    onClick={showMore}
                    className="flex items-center justify-center gap-2 py-3 text-green-600 hover:text-green-700 font-medium transition-colors"
                  >
                    <span>See more</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={showLess}
                    className="flex items-center justify-center gap-2 py-3 text-green-600 hover:text-green-700 font-medium transition-colors"
                  >
                    <span>See less</span>
                    <ChevronUp className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
            <p className="text-gray-500 text-lg">No {title.toLowerCase()} yet</p>
          </div>
        )}
      </div>
    </div>
  );
}


// src/components/ChartToggleWrapper.tsx
"use client";
import { useState } from "react";
import { TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import RatingHistoryChart from "./RatingHistoryChart";

interface ChartToggleWrapperProps {
  producerId: string;
  voteCount: number;
}

export default function ChartToggleWrapper({
  producerId,
  voteCount,
}: ChartToggleWrapperProps) {
  const [showChart, setShowChart] = useState(false);

  return (
    <div className="mt-6">
      {/* Chart Toggle Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowChart(!showChart)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            showChart
              ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          aria-label={showChart ? "Hide rating chart" : "Show rating chart"}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{showChart ? 'Hide' : 'Show'} Rating History</span>
          {showChart ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Chart Section */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        showChart ? 'max-h-[615px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {showChart && (
          <div className="animate-fade-in">
            <RatingHistoryChart producerId={producerId} voteCount={voteCount} />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
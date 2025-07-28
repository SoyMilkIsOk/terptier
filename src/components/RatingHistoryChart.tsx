"use client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Calendar, Star } from "lucide-react";

interface DataPoint {
  createdAt: string;
  averageRating: number;
  totalVotes: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const date = new Date(label || "").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[180px]">
        <div className="flex items-center gap-2 mb-2 text-gray-600 text-sm">
          <Calendar className="w-3 h-3" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="font-semibold text-gray-800">
            {payload[0].value.toFixed(2)} / 5.0
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const formatXAxisLabel = (tickItem: string) => {
  const date = new Date(tickItem);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="#3b82f6"
      stroke="#ffffff"
      strokeWidth={2}
      className="drop-shadow-sm hover:r-6 transition-all duration-200"
    />
  );
};

export default function RatingHistoryChart({
  producerId,
  voteCount,
}: {
  producerId: string;
  voteCount: number;
}) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetch(`/api/producers/${producerId}/history`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((d) => {
        setData(d.snapshots || []);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [producerId]);

  if (isLoading) {
    return (
      <div className="w-full h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-gray-600 text-sm">
            Loading rating history...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-80 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-700 text-sm">Failed to load rating history</p>
          <p className="text-red-600 text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm mb-1">
            No rating history available
          </p>
          <p className="text-gray-500 text-xs">
            Ratings will appear here as they're submitted
          </p>
        </div>
      </div>
    );
  }

  const trend =
    data.length >= 2
      ? data[data.length - 1].averageRating - data[0].averageRating
      : 0;
  const isPositiveTrend = trend > 0;
  const isNeutralTrend = Math.abs(trend) < 0.1;

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Rating History
              </h3>
              <p className="text-sm text-gray-600">{voteCount} votes</p>
            </div>
          </div>

          {/* Trend indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              isNeutralTrend
                ? "bg-gray-100 text-gray-700"
                : isPositiveTrend
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <span
              className={`text-xs ${
                isNeutralTrend ? "→" : isPositiveTrend ? "↗" : "↘"
              }`}
            >
              {isNeutralTrend ? "→" : isPositiveTrend ? "↗" : "↘"}
            </span>
            <span>
              {isNeutralTrend
                ? "Stable"
                : `${isPositiveTrend ? "+" : ""}${trend.toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="h-40 md:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="createdAt"
                tickFormatter={formatXAxisLabel}
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                domain={[0, 5]}
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="averageRating"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{
                  r: 6,
                  fill: "#1d4ed8",
                  stroke: "#ffffff",
                  strokeWidth: 3,
                  className: "drop-shadow-md",
                }}
                className="drop-shadow-sm"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="mt-6 grid grid-cols-3 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {Math.min(...data.map((d) => d.averageRating)).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Lowest</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data[data.length - 1]?.averageRating.toFixed(2) || "0.00"}
            </div>
            <div className="text-xs text-gray-500 mt-1">Current Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {Math.max(...data.map((d) => d.averageRating)).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Highest</div>
          </div>
        </div>
        {/* upadtes daily text */}
        <p className="text-center text-xs text-gray-500 mt-4 italic">
          <span className="text-gray-300">
            Last updated{" "}
            {new Date(data[data.length - 1].createdAt).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            )}
          </span>
          </p>
      </div>
    </div>
  );
}

// src/components/CategoryToggle.tsx
"use client";

import type { KeyboardEvent } from "react";
import type { ToggleTheme } from "@/lib/market-theme";

interface CategoryToggleProps {
  view: "flower" | "hash";
  setView: (view: "flower" | "hash") => void;
  appearance?: ToggleTheme;
}

const defaultTheme: ToggleTheme = {
  container:
    "bg-gradient-to-r from-gray-100 to-gray-200 shadow-inner border border-gray-400",
  indicator: {
    base:
      "absolute left-1.5 top-1.5 bottom-1.5 rounded-full transform transition-all duration-300 ease-out shadow-lg",
    flower: "bg-gradient-to-r from-green-600 to-green-700 translate-x-0 w-24",
    hash: "bg-gradient-to-r from-green-500 to-green-600 translate-x-24 w-24",
  },
  label: {
    base: "font-semibold text-sm transition-all duration-300 ease-out",
    active: "text-white drop-shadow-sm",
    inactive: "text-gray-600 hover:text-gray-800",
  },
  focusRing: "ring-green-400 ring-opacity-0 focus-within:ring-opacity-50",
};

export default function CategoryToggle({
  view,
  setView,
  appearance,
}: CategoryToggleProps) {
  const isFlower = view === "flower";
  const theme = appearance ?? defaultTheme;

  const handleToggle = () => {
    setView(isFlower ? "hash" : "flower");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      className={`relative flex items-center w-50 h-11 rounded-full p-1.5 cursor-pointer select-none transition-all duration-200 focus:outline-none ${theme.container}`}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="switch"
      aria-checked={isFlower}
      aria-label="Toggle between flower and hash view"
    >
      <div
        className={`${theme.indicator.base} ${
          isFlower ? theme.indicator.flower : theme.indicator.hash
        }`}
        style={{
          boxShadow:
            "0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
        }}
      />

      <div className="relative z-10 flex w-full">
        <div className="flex items-center justify-center w-24 h-full">
          <span
            className={`${theme.label.base} ${
              isFlower ? theme.label.active : theme.label.inactive
            }`}
          >
            🌸 Flower
          </span>
        </div>
        <div className="flex items-center justify-center w-24 h-full">
          <span
            className={`${theme.label.base} ${
              !isFlower ? theme.label.active : theme.label.inactive
            }`}
          >
            🍯 Hash
          </span>
        </div>
      </div>

      <div
        className={`absolute inset-0 rounded-full ring-2 pointer-events-none transition-all duration-200 ${theme.focusRing}`}
      />
    </div>
  );
}

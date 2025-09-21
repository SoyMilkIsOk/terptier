"use client";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import type { SearchTheme } from "@/lib/market-theme";
import AttributesFilter from "./AttributesFilter";

const defaultTheme: SearchTheme = {
  icon: "text-gray-400",
  input:
    "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 placeholder-gray-400 border-gray-300 hover:border-gray-400",
  inputFocus: "border-green-400 shadow-md bg-white",
  filterButton: "text-gray-500 hover:text-gray-700",
  filterButtonActive: "text-green-600",
  clearButton: "text-gray-400 hover:text-gray-600",
  focusRing: "ring-green-300",
  panel: "bg-white shadow border border-gray-200", // border handled by rounded container
  attributeTag: "bg-gray-100 text-gray-700",
  attributeTagSelected: "bg-emerald-100 text-emerald-800",
  attributeCheckbox: "text-green-600",
  attributeIcon: "",
  attributeText: "",
};

export default function SearchBar({
  onSearch,
  initialQuery = "",
  selectedAttributes = [],
  onAttributesChange,
  category,
  placeholder = "Search producers...",
  enableFilters = true,
  appearance,
}: {
  onSearch: (q: string) => void;
  initialQuery?: string;
  selectedAttributes?: string[];
  onAttributesChange?: (attrs: string[]) => void;
  category?: "FLOWER" | "HASH";
  placeholder?: string;
  enableFilters?: boolean;
  appearance?: SearchTheme;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const theme = appearance ?? defaultTheme;

  // Trigger search automatically with a short debounce
  useEffect(() => {
    const id = setTimeout(() => {
      onSearch(query.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [query, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setQuery("");
      (e.target as HTMLInputElement).blur();
    }
  };

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <div className="mb-6 flex flex-col items-center">
      <div className="relative w-5/6 md:w-2/3 max-w-md">
        {/* Search icon */}
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 transform pointer-events-none"
          aria-hidden="true"
        >
          <Search className={`w-5 h-5 ${theme.icon}`} strokeWidth={2} />
        </span>

        {/* Input field */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full h-12 pl-12 pr-12 py-3 rounded-full border font-medium transition-all duration-200 shadow-inner focus:outline-none ${theme.input} ${
            isFocused ? theme.inputFocus : ""
          }`}
        />

        {/* Filter toggle button */}
        {enableFilters && (
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 transform p-1 transition-colors duration-200 ${
              theme.filterButton
            } ${showFilters ? theme.filterButtonActive : ""}`}
            aria-label="Toggle filters"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 4h18M6 12h12M10 20h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* Clear button */}
        {query && (
          <button
            onClick={clearSearch}
            className={`absolute right-8 top-1/2 -translate-y-1/2 transform transition-colors duration-200 ${theme.clearButton}`}
            aria-label="Clear search"
          >
            <svg
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M18 6L6 18M6 6L18 18" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* Focus ring */}
        <div
          className={`absolute inset-0 rounded-full ring-1 ${theme.focusRing} transition-all duration-200 pointer-events-none ${
            isFocused ? "ring-opacity-40" : "ring-opacity-0"
          }`}
        />
      </div>

      {enableFilters && showFilters && onAttributesChange && category && (
        <div
          className={`mt-3 w-5/6 md:w-2/3 max-w-md rounded-xl p-3 transition-colors duration-300 ${theme.panel}`}
        >
          <AttributesFilter
            selected={selectedAttributes}
            onChange={onAttributesChange}
            category={category}
            appearance={{
              attributeTag: theme.attributeTag,
              attributeTagSelected: theme.attributeTagSelected,
              attributeCheckbox: theme.attributeCheckbox,
              attributeIcon: theme.attributeIcon,
              attributeText: theme.attributeText,
            }}
          />
        </div>
      )}
    </div>
  );
}
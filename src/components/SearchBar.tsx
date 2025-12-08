"use client";
import { useState, useEffect } from "react";
import type { SearchTheme } from "@/lib/market-theme";
import AttributesFilter from "./AttributesFilter";

const defaultTheme: SearchTheme = {
  searchIcon: "text-gray-400", // applied below
  input:
    "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 placeholder-gray-400 border-gray-300 hover:border-gray-400",
  inputFocus: "border-green-400 shadow-md bg-white",
  filterButton: "text-gray-500 hover:text-gray-700",
  filterButtonActive: "text-green-600",
  clearButton: "text-gray-400 hover:text-gray-600",
  focusRing: "ring-green-300",
  panel: "bg-white shadow border border-gray-200",
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

  // Sync internal state with prop changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const theme = appearance ?? defaultTheme;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSearch(query.trim());
    (document.activeElement as HTMLElement)?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
        // Revert to initial query or clear? 
        // Let's clear for now as it's standard "escape" behavior in inputs
      setQuery(""); 
      (e.target as HTMLInputElement).blur();
    }
  };

  const clearSearch = () => {
    setQuery("");
    // If we want "clear" to also search for empty string immediately:
    // onSearch("");
  };

  const isDirty = query.trim() !== initialQuery.trim();
  const showArrow = isDirty && query.trim().length > 0;

  return (
    <div className="mb-6 flex flex-col items-center">
      <form onSubmit={handleSubmit} className="relative w-5/6 md:w-2/3 max-w-md">
        {/* Search icon */}
        <div
          className={`absolute left-4 top-1/2 -translate-y-1/2 transform pointer-events-none z-10 ${theme.searchIcon}`}
          aria-hidden="true"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19S2 15.194 2 10.5 5.806 2 10.5 2 19 5.806 19 10.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

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

        {/* Action Button: Arrow (Submit) or X (Clear) */}
        {/* Priority: If text changed -> Arrow. Else if has text -> X. Else -> Filters (if enabled) */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
             {showArrow ? (
                <button
                    type="submit"
                    className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-sm"
                    aria-label="Search"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </button>
             ) : query ? (
                <button
                    type="button"
                    onClick={clearSearch}
                    className={`p-1 transition-colors duration-200 ${theme.clearButton}`}
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
             ) : null}

            {/* Filter toggle button */}
            {enableFilters && (
            <button
                type="button"
                onClick={() => setShowFilters((s) => !s)}
                className={`p-1 transition-colors duration-200 ${
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
        </div>
        
        {/* Focus ring */}
        <div
          className={`absolute inset-0 rounded-full ring-1 ${theme.focusRing} transition-all duration-200 pointer-events-none ${
            isFocused ? "ring-opacity-40" : "ring-opacity-0"
          }`}
        />
      </form>

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

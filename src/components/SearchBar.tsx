"use client";
import { useState, useEffect } from "react";

export default function SearchBar({
  onSearch,
  initialQuery = "",
}: {
  onSearch: (q: string) => void;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);

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
    <div className="mb-6 flex justify-center">
      <div className="relative w-5/6 md:w-2/3 max-w-md">
        {/* Search icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
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
          placeholder="Search producers..."
          className={`w-full h-12 pl-12 pr-12 py-3 rounded-full border bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 placeholder-gray-400 font-medium transition-all duration-200 shadow-inner focus:outline-none ${
            isFocused 
              ? "border-green-400 shadow-md bg-white" 
              : "border-gray-300 hover:border-gray-400"
          }`}
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
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
        <div className={`absolute inset-0 rounded-full ring-1 ring-green-300 ring-opacity-0 transition-all duration-200 pointer-events-none ${
          isFocused ? "ring-opacity-40" : ""
        }`} />
      </div>
    </div>
  );
}
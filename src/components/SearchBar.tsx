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

  // Trigger search automatically with a short debounce
  useEffect(() => {
    const id = setTimeout(() => {
      onSearch(query.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [query, onSearch]);

  return (
    <div className="mb-4 flex justify-center">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search producers..."
        className="border px-3 py-2 rounded w-2/3 md:w-1/3"
      />
    </div>
  );
}

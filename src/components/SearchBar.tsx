"use client";
import { useState } from "react";

export default function SearchBar({
  onSearch,
  initialQuery = "",
}: {
  onSearch: (q: string) => void;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form onSubmit={submit} className="mb-4 flex justify-center">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search producers..."
        className="border rounded-l px-3 py-2 w-2/3 md:w-1/3"
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded-r"
      >
        Search
      </button>
    </form>
  );
}

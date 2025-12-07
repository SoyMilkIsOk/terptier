"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import SearchResults from "@/components/SearchResults";
import { Loader2 } from "lucide-react";
import type { SearchResultItem } from "@/app/api/search/route";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-green-600" /></div>}>
        <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const stateFilter = searchParams.get("state") || "";
  const categoryFilter = searchParams.get("category") || ""; // FLOWER, HASH
  const typeFilter = searchParams.get("type") || ""; // PRODUCER, STRAIN

  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [states, setStates] = useState<{name: string, slug: string}[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch states on mount
  useEffect(() => {
    (async () => {
        try {
            const res = await fetch("/api/states");
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.states) {
                    setStates(data.states);
                }
            }
        } catch (e) {
            console.error("Failed to fetch states", e);
        }
    })();
  }, [])

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("q", query);
        if (stateFilter) params.set("state", stateFilter);
        if (categoryFilter) params.set("category", categoryFilter);
        if (typeFilter) params.set("type", typeFilter);

        const res = await fetch(`/api/search?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, stateFilter, categoryFilter, typeFilter]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
        params.set(key, value);
    } else {
        params.delete(key);
    }
    // Use replace to avoid adding to history stack
    router.replace(`/search?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center gap-4">
            <button 
                onClick={() => router.back()} 
                className="p-2 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                aria-label="Go back"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 leading-tight break-words">
                Search Results for "{query}"
            </h1>
        </div>

        {/* Filters - Dropdowns/Selects for mobile friendliness */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {/* Type Filter */}
            <div className="relative">
                <select
                    value={typeFilter}
                    onChange={(e) => updateFilter("type", e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-green-500 font-medium"
                >
                    <option value="">All Types</option>
                    <option value="PRODUCER">Producers</option>
                    <option value="STRAIN">Strains</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>

            {/* Category Filter */}
            <div className="relative">
                <select
                    value={categoryFilter}
                    onChange={(e) => updateFilter("category", e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-green-500 font-medium"
                >
                     <option value="">All Categories</option>
                     <option value="FLOWER">Flower</option>
                     <option value="HASH">Hash</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>

            {/* State Filter */}
             <div className="relative col-span-2 md:col-span-1">
                <select
                    value={stateFilter}
                    onChange={(e) => updateFilter("state", e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-green-500 font-medium"
                >
                     <option value="">All States</option>
                     {states.map(s => (
                         <option key={s.slug} value={s.slug}>{s.name}</option>
                     ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
        </div>

        {loading ? (
             <div className="flex justify-center py-20">
                <Loader2 className="animate-spin w-10 h-10 text-green-600" />
             </div>
        ) : (
            <SearchResults results={results} />
        )}
      </div>
    </main>
  );
}

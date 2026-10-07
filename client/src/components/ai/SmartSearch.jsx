import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import aiService from "../../services/aiService";
import PropertyCard from "../property/PropertyCard";

const SUGGESTIONS = [
  "3 bedroom house in Westlands under 20 million",
  "Furnished apartment for rent in Kilimani",
  "Villa with pool in Karen under 50 million",
  "Studio apartment for rent in Nairobi CBD",
  "Commercial space in Westlands",
  "Land for sale in Ngong under 5 million",
];

export default function SmartSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSugg, setShowSugg] = useState(false);
  const inputRef = useRef(null);

  const search = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setShowSugg(false);
    try {
      const data = await aiService.naturalLanguageSearch(q);
      setResults(data);
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (s) => {
    setQuery(s);
    search(s);
  };

  return (
    <div className="w-full">
      {/* Search input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-brand-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span className="text-xs text-brand-400 font-medium hidden sm:block">
                AI
              </span>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSugg(true);
              }}
              onFocus={() => setShowSugg(true)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Describe your ideal property... e.g. 3 bed house in Karen under 15M"
              className="input pl-16 pr-4"
            />
          </div>
          <button
            onClick={() => search()}
            disabled={loading || !query.trim()}
            className="btn-primary px-6 disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSugg && !results && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-surface-200 shadow-modal z-20 overflow-hidden"
            >
              <p className="text-xs text-surface-400 px-4 pt-3 pb-2 font-medium uppercase tracking-wider">
                Try these searches
              </p>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(s)}
                  className="w-full text-left px-4 py-2.5 text-sm text-surface-700 hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-3.5 h-3.5 text-surface-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="mt-8">
          <div className="skeleton h-4 w-48 rounded mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton h-52 rounded-none" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-5 w-24 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-3 w-32 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 text-center py-8">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-surface-500 text-sm">
                {results.interpretation}
              </p>
              {results.parsedFilters && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(results.parsedFilters)
                    .filter(
                      ([k, v]) => v && k !== "keywords" && !Array.isArray(v),
                    )
                    .map(([k, v]) => (
                      <span
                        key={k}
                        className="badge bg-brand-50 text-brand-700 capitalize"
                      >
                        {k}: {String(v)}
                      </span>
                    ))}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setResults(null);
                setQuery("");
                inputRef.current?.focus();
              }}
              className="text-sm text-surface-400 hover:text-surface-600 transition-colors"
            >
              Clear
            </button>
          </div>

          {results.listings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-surface-500 text-lg font-medium">
                No properties found
              </p>
              <p className="text-surface-400 text-sm mt-2">
                Try a different description or broaden your search
              </p>
              <button
                onClick={() => {
                  setResults(null);
                  setQuery("");
                }}
                className="btn-secondary mt-4 text-sm"
              >
                New search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.listings.map((listing, i) => (
                <PropertyCard key={listing._id} listing={listing} index={i} />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

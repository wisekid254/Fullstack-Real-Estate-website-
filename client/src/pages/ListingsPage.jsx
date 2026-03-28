import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import PropertyCard from "../components/property/PropertyCard";
import listingService from "../services/listingService";

const CATEGORIES = ["All", "house", "apartment", "villa", "land", "commercial"];
const SORT_OPTIONS = [
  { label: "Newest first", value: "-createdAt" },
  { label: "Oldest first", value: "createdAt" },
  { label: "Price: low–high", value: "price" },
  { label: "Price: high–low", value: "-price" },
];

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "",
    category: searchParams.get("category") || "",
    city: searchParams.get("city") || "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    sort: "-createdAt",
    page: 1,
  });

  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });
      if (searchInput) params.search = searchInput;
      const data = await listingService.getListings(params);
      setListings(data.listings);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchListings();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <SEO
        title="Property listings — Buy and rent in Kenya"
        description="Browse houses, apartments, villas and commercial properties for sale and rent across Kenya."
      />
      <div className="mb-6">
        <h1 className="text-display-md text-surface-900 mb-1">
          {filters.type === "rent"
            ? "Properties for rent"
            : filters.type === "sale"
              ? "Properties for sale"
              : "All properties"}
        </h1>
        <p className="text-surface-500 text-sm">{total} properties found</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by title, location…"
          className="input flex-1"
        />
        <button type="submit" className="btn-primary px-6">
          Search
        </button>
      </form>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="card p-5 space-y-6">
            {/* Type */}
            <div>
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
                Listing type
              </p>
              <div className="flex gap-2">
                {["", "sale", "rent"].map((t) => (
                  <button
                    key={t}
                    onClick={() => updateFilter("type", t)}
                    className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                      filters.type === t
                        ? "bg-brand-500 text-white border-brand-500"
                        : "border-surface-200 text-surface-600 hover:border-brand-300"
                    }`}
                  >
                    {t === "" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
                Category
              </p>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      updateFilter("category", cat === "All" ? "" : cat)
                    }
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors capitalize ${
                      (cat === "All" && !filters.category) ||
                      filters.category === cat
                        ? "bg-brand-50 text-brand-700 font-medium"
                        : "text-surface-600 hover:bg-surface-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
                Price range (KES)
              </p>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Min price"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter("minPrice", e.target.value)}
                  className="input text-sm"
                />
                <input
                  type="number"
                  placeholder="Max price"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter("maxPrice", e.target.value)}
                  className="input text-sm"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
                Min bedrooms
              </p>
              <div className="flex gap-2">
                {["", "1", "2", "3", "4"].map((n) => (
                  <button
                    key={n}
                    onClick={() => updateFilter("bedrooms", n)}
                    className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                      filters.bedrooms === n
                        ? "bg-brand-500 text-white border-brand-500"
                        : "border-surface-200 text-surface-600 hover:border-brand-300"
                    }`}
                  >
                    {n === "" ? "Any" : n + "+"}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            <button
              onClick={() =>
                setFilters({
                  type: "",
                  category: "",
                  city: "",
                  minPrice: "",
                  maxPrice: "",
                  bedrooms: "",
                  sort: "-createdAt",
                  page: 1,
                })
              }
              className="btn-secondary w-full text-sm"
            >
              Clear filters
            </button>
          </div>
        </aside>

        {/* Listings grid */}
        <div className="flex-1">
          {/* Sort + count bar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-surface-500">
              Showing{" "}
              <span className="font-medium text-surface-900">
                {listings.length}
              </span>{" "}
              of <span className="font-medium text-surface-900">{total}</span>{" "}
              properties
            </p>
            <select
              value={filters.sort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="input w-auto text-sm py-1.5"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-surface-400 text-lg">
                No properties match your filters
              </p>
              <p className="text-surface-400 text-sm mt-1">
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((listing, i) => (
                <PropertyCard key={listing._id} listing={listing} index={i} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateFilter("page", i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    filters.page === i + 1
                      ? "bg-brand-500 text-white"
                      : "bg-white border border-surface-200 text-surface-600 hover:border-brand-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

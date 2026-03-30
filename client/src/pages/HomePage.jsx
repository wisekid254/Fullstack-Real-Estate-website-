import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PropertyCard from "../components/property/PropertyCard";
import listingService from "../services/listingService";
import SEO from "../components/common/SEO";

const CITIES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"];

const STATS = [
  { value: "12,400+", label: "Active listings" },
  { value: "3,200+", label: "Happy buyers" },
  { value: "480+", label: "Verified agents" },
  { value: "98%", label: "Satisfaction rate" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ type: "sale", city: "", query: "" });

  useEffect(() => {
    listingService
      .getFeatured()
      .then((data) => setFeatured(data.listings))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.type) params.set("type", search.type);
    if (search.city) params.set("city", search.city);
    if (search.query) params.set("search", search.query);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="nestHaven — Find your perfect home in Kenya"
        description="Search thousands of properties for sale and rent across Kenya. Connect with verified agents on nestHaven."
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative bg-surface-900 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 50%, #3b6ef4 0%, transparent 50%),
                              radial-gradient(circle at 75% 20%, #6b96f5 0%, transparent 40%)`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-sm px-4 py-1.5 rounded-full mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Over 12,000 verified listings across Kenya
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6"
            >
              Find your perfect
              <span className="text-brand-400"> home</span>,
              <br />
              anywhere in Kenya.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/70 text-lg mb-10 max-w-xl mx-auto"
            >
              Search thousands of properties for sale and rent. Connect directly
              with verified agents.
            </motion.p>

            {/* Search card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl p-2 shadow-modal max-w-2xl mx-auto"
            >
              <div className="flex gap-1 mb-2 px-1 pt-1">
                {["sale", "rent"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSearch((s) => ({ ...s, type: t }))}
                    className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                      search.type === t
                        ? "bg-brand-500 text-white"
                        : "text-surface-600 hover:bg-surface-100"
                    }`}
                  >
                    {t === "sale" ? "Buy" : "Rent"}
                  </button>
                ))}
              </div>

              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-2 p-1"
              >
                <input
                  type="text"
                  value={search.query}
                  onChange={(e) =>
                    setSearch((s) => ({ ...s, query: e.target.value }))
                  }
                  placeholder="Search by title or keyword…"
                  className="input flex-1 text-surface-900"
                />
                <select
                  value={search.city}
                  onChange={(e) =>
                    setSearch((s) => ({ ...s, city: e.target.value }))
                  }
                  className="input w-full sm:w-40 text-surface-900"
                >
                  <option value="">Any city</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="btn-primary px-8 py-2.5 whitespace-nowrap"
                >
                  Search
                </button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-3 mt-6"
            >
              {[
                "Apartments in Nairobi",
                "Houses in Karen",
                "Villas for sale",
                "Studios for rent",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() =>
                    navigate(`/listings?search=${encodeURIComponent(q)}`)
                  }
                  className="text-sm text-white/60 hover:text-white/90 transition-colors underline underline-offset-2"
                >
                  {q}
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="bg-brand-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/20">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="py-8 px-6 text-center"
              >
                <p className="text-2xl lg:text-3xl font-bold mb-1">
                  {stat.value}
                </p>
                <p className="text-white/70 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured listings ────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <p className="text-brand-500 text-sm font-medium mb-1">
              Hand-picked for you
            </p>
            <h2 className="text-display-md text-surface-900">
              Featured properties
            </h2>
          </div>
          <button
            onClick={() => navigate("/listings")}
            className="btn-secondary text-sm hidden sm:flex"
          >
            View all →
          </button>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((listing, i) => (
              <PropertyCard key={listing._id} listing={listing} index={i} />
            ))}
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <button
            onClick={() => navigate("/listings")}
            className="btn-secondary"
          >
            View all properties →
          </button>
        </div>
      </section>

      {/* ── Why nestHaven ────────────────────────────────── */}
      <section className="bg-surface-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-display-md text-surface-900 mb-3">
              Why nestHaven?
            </h2>
            <p className="text-surface-500 max-w-xl mx-auto">
              We make finding your next home simple, transparent, and
              stress-free.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                title: "Verified listings",
                desc: "Every property is checked by our team before going live. No scams, no surprises.",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                title: "Direct agent contact",
                desc: "Message verified agents and owners directly — no middlemen, no hidden fees.",
                icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
              },
              {
                title: "Save and compare",
                desc: "Bookmark your favourites and compare properties side by side before deciding.",
                icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="card p-6 text-center"
              >
                <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-brand-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={item.icon}
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-surface-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-surface-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-surface-900 rounded-3xl px-8 py-14 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-3">Ready to find your home?</h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Join over 3,000 people who found their perfect property on
            nestHaven.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/listings?type=sale")}
              className="btn-primary px-8 py-3"
            >
              Browse properties
            </button>
            <button
              onClick={() => navigate("/register")}
              className="btn-secondary px-8 py-3 border-white/20 text-white hover:bg-white/10"
            >
              Create free account
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

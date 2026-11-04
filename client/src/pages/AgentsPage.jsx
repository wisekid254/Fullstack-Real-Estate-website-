import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import SEO from "../components/common/SEO";

const formatPrice = (price) => {
  if (!price || price === 0) return null;
  if (price >= 1000000) return "KES " + (price / 1000000).toFixed(1) + "M";
  if (price >= 1000) return "KES " + (price / 1000).toFixed(0) + "K";
  return "KES " + price.toLocaleString();
};

const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

function StarRating({ rating, numReviews }) {
  return (
    <div className="flex items-center gap-1.5 bg-surface-50 rounded-xl px-3 py-1.5 flex-shrink-0">
      <span className="font-bold text-surface-900 text-sm">
        {Number(rating || 0).toFixed(1)}
      </span>
      <svg
        className="w-4 h-4 text-amber-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {numReviews > 0 && (
        <span className="text-xs text-surface-500">
          ({Number(numReviews).toLocaleString()})
        </span>
      )}
    </div>
  );
}

function AgentCard({ agent, index }) {
  const p = agent.agentProfile || {};
  const isTeam = p.teamType === "team";
  const minFmt = formatPrice(p.minPrice);
  const maxFmt = formatPrice(p.maxPrice);
  const priceRange = minFmt && maxFmt ? minFmt + " – " + maxFmt : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        to={"/agents/" + agent._id}
        className="block bg-white rounded-2xl border border-surface-200 hover:border-brand-300 hover:shadow-lg transition-all duration-200 overflow-hidden group"
      >
        <div className="flex p-5 gap-5">
          {/* Photo */}
          <div className="relative flex-shrink-0">
            {agent.avatar ? (
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover object-top border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white text-3xl sm:text-4xl font-bold flex items-center justify-center border-4 border-white shadow-md select-none group-hover:scale-105 transition-transform duration-200">
                {getInitials(agent.name)}
              </div>
            )}

            {/* Top Agent badge like Zillow */}
            {p.isTopAgent && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-lg px-2 py-1 shadow-md">
                  <div className="w-4 h-4 bg-brand-500 rounded flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-surface-700">
                    Top Agent
                  </span>
                  <span className="text-xs text-surface-400">on nestHaven</span>
                </div>
              </div>
            )}

            {/* Verified badge */}
            {p.verified && !p.isTopAgent && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow">
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0">
                {/* TEAM or AGENT label — amber like Zillow */}
                <span
                  className={
                    "text-xs font-bold tracking-wider uppercase block mb-0.5 " +
                    (isTeam ? "text-amber-500" : "text-brand-500")
                  }
                >
                  {isTeam ? "TEAM" : (p.title || "AGENT").toUpperCase()}
                </span>

                {/* Name */}
                <h3 className="text-xl font-bold text-surface-900 leading-tight">
                  {agent.name}
                </h3>

                {/* Brokerage */}
                {p.brokerage && (
                  <p className="text-sm text-surface-500 mt-0.5">
                    {p.brokerage}
                  </p>
                )}
              </div>

              {/* Rating top right like Zillow */}
              {(agent.numReviews > 0 || agent.rating > 0) && (
                <StarRating
                  rating={agent.rating}
                  numReviews={agent.numReviews}
                />
              )}
            </div>

            {/* Stats — exactly like Zillow */}
            <div className="mt-4 space-y-1.5">
              {priceRange && (
                <p className="text-sm">
                  <span className="font-bold text-surface-900">
                    {priceRange}
                  </span>
                  <span className="text-brand-500 text-xs ml-1.5">
                    {isTeam ? "team" : "agent"} price range
                  </span>
                </p>
              )}

              {p.salesLast12 > 0 && (
                <p className="text-sm">
                  <span className="font-bold text-surface-900">
                    {p.salesLast12}
                  </span>
                  <span className="text-brand-500 text-xs ml-1.5">
                    {isTeam ? "team" : "agent"} sales last 12 months
                  </span>
                </p>
              )}

              {p.totalSales > 0 && (
                <p className="text-sm">
                  <span className="font-bold text-surface-900">
                    {p.totalSales.toLocaleString()}
                  </span>
                  <span className="text-brand-500 text-xs ml-1.5">
                    {isTeam ? "team" : "agent"} sales
                    {p.serviceAreas?.[0] ? " in " + p.serviceAreas[0] : ""}
                  </span>
                </p>
              )}

              {/* Fallback when no sales data */}
              {!p.salesLast12 && !p.totalSales && (
                <div className="flex items-center gap-4">
                  <p className="text-sm">
                    <span className="font-bold text-surface-900">
                      {agent.listingCount || 0}
                    </span>
                    <span className="text-surface-500 text-xs ml-1">
                      active listings
                    </span>
                  </p>
                  {p.experience > 0 && (
                    <p className="text-sm">
                      <span className="font-bold text-surface-900">
                        {p.experience}
                      </span>
                      <span className="text-surface-500 text-xs ml-1">
                        yrs experience
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Service areas chips */}
            {p.serviceAreas?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {p.serviceAreas.slice(0, 3).map((area) => (
                  <span
                    key={area}
                    className="text-xs bg-surface-50 border border-surface-100 text-surface-600 px-2 py-0.5 rounded-full"
                  >
                    {area}
                  </span>
                ))}
                {p.serviceAreas.length > 3 && (
                  <span className="text-xs text-brand-500">
                    +{p.serviceAreas.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Response time */}
            {p.responseTime && (
              <div className="flex items-center gap-1.5 mt-3">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-xs text-surface-500">
                  Responds {p.responseTime.toLowerCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("rating");

  useEffect(() => {
    api
      .get("/users/agents")
      .then((res) => setAgents(res.data.agents))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = agents
    .filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.agentProfile?.brokerage || "").toLowerCase().includes(q) ||
        (a.agentProfile?.serviceAreas || []).some((area) =>
          area.toLowerCase().includes(q),
        );
      const matchFilter =
        filter === "all" ||
        (filter === "verified" && a.agentProfile?.verified) ||
        (filter === "top" && a.agentProfile?.isTopAgent) ||
        (filter === "team" && a.agentProfile?.teamType === "team");
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sort === "reviews") return (b.numReviews || 0) - (a.numReviews || 0);
      if (sort === "listings")
        return (b.listingCount || 0) - (a.listingCount || 0);
      if (sort === "sales")
        return (
          (b.agentProfile?.totalSales || 0) - (a.agentProfile?.totalSales || 0)
        );
      return 0;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO
        title="Real Estate Agents in Kenya — nestHaven"
        description="Find verified real estate agents in Nairobi, Mombasa and across Kenya."
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-3">
          Real Estate Agents in Kenya
        </h1>
        <p className="text-surface-500 max-w-2xl mx-auto text-sm sm:text-base">
          With verified agents from top brokerages across Kenya, a local agent
          knows your market and can guide you through the process from start to
          finish.
        </p>
      </motion.div>

      {/* Search and sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400"
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
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brokerage or area..."
            className="input pl-9"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input w-auto"
        >
          <option value="rating">Best rated</option>
          <option value="reviews">Most reviewed</option>
          <option value="listings">Most listings</option>
          <option value="sales">Most sales</option>
        </select>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { key: "all", label: "All agents" },
          { key: "verified", label: "Verified" },
          { key: "top", label: "Top agents" },
          { key: "team", label: "Teams" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={
              "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-colors " +
              (filter === f.key
                ? "bg-brand-500 text-white border-brand-500"
                : "border-surface-200 text-surface-600 hover:border-brand-300 bg-white")
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-surface-500 mb-4">
          {filtered.length} agent{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-surface-200 p-5"
            >
              <div className="flex gap-5">
                <div className="skeleton w-32 h-32 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-3 pt-2">
                  <div className="skeleton h-3 w-16 rounded" />
                  <div className="skeleton h-6 w-40 rounded" />
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-4 w-48 rounded" />
                  <div className="skeleton h-4 w-40 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-surface-200">
          <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-surface-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <p className="text-surface-500 font-medium text-lg">
            No agents found
          </p>
          <p className="text-surface-400 text-sm mt-1">
            {search ? "Try a different name or area" : "No agents yet"}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="btn-secondary mt-4 text-sm px-6"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Agent cards — 2 column Zillow layout */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((agent, i) => (
            <AgentCard key={agent._id} agent={agent} index={i} />
          ))}
        </div>
      )}

      {/* Get help CTA — Zillow style */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6"
      >
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
          <svg
            className="w-7 h-7 text-brand-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </div>
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-bold text-surface-900 mb-1">
            Get help finding an agent
          </h3>
          <p className="text-surface-600 text-sm mb-3">
            We will pair you with a nestHaven Premier Agent who has the inside
            scoop on your market.
          </p>
          <Link
            to="/register?role=agent"
            className="text-brand-500 font-semibold text-sm hover:text-brand-700 transition-colors"
          >
            Connect with a local agent →
          </Link>
        </div>
      </motion.div>

      {/* Join as agent CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-4 bg-surface-900 rounded-2xl px-8 py-10 text-center text-white"
      >
        <h2 className="text-2xl font-bold mb-2">Are you a property agent?</h2>
        <p className="text-white/60 mb-6 max-w-md mx-auto text-sm">
          Join nestHaven and reach thousands of buyers and renters across Kenya.
        </p>
        <Link to="/register?role=agent" className="btn-primary px-8 py-3">
          Join as an agent
        </Link>
      </motion.div>
    </div>
  );
}

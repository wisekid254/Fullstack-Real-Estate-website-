import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import SEO from "../components/common/SEO";

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/users/agents")
      .then((res) => setAgents(res.data.agents))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getInitials = (name) => {
    if (!name) return "";

    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO
        title="Verified agents — nestHaven"
        description="Connect with verified real estate agents on nestHaven."
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-brand-500 text-sm font-medium mb-1">Our team</p>

        <h1 className="text-display-md text-surface-900 mb-2">
          Verified agents
        </h1>

        <p className="text-surface-500 max-w-xl">
          Connect directly with our verified property agents. No middlemen, no
          hidden fees.
        </p>
      </motion.div>

      <div className="mb-8 max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="input"
        />
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="skeleton w-16 h-16 rounded-full" />

                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-3 w-24 rounded" />
                </div>
              </div>

              <div className="skeleton h-9 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
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

          <p className="text-surface-500 font-medium">No agents found</p>

          <p className="text-surface-400 text-sm mt-1">
            {search ? "Try a different search term" : "No verified agents yet"}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((agent, i) => {
            const badgeClass =
              agent.role === "admin"
                ? "badge bg-purple-50 text-purple-800 capitalize mt-1"
                : "badge badge-blue capitalize mt-1";

            const mailtoLink = "mailto:" + agent.email;

            return (
              <motion.div
                key={agent._id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="card p-6 flex flex-col"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-800 text-xl font-bold flex items-center justify-center flex-shrink-0">
                    {getInitials(agent.name)}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-surface-900 truncate">
                      {agent.name}
                    </h3>

                    <p className="text-xs text-surface-500 truncate">
                      {agent.email}
                    </p>

                    <span className={badgeClass}>{agent.role}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-surface-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-surface-900">
                      {agent.listingCount}
                    </p>

                    <p className="text-xs text-surface-500">Active listings</p>
                  </div>

                  <div className="bg-surface-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-surface-900">
                      {new Date(agent.createdAt).getFullYear()}
                    </p>

                    <p className="text-xs text-surface-500">Member since</p>
                  </div>
                </div>

                {agent.phone && (
                  <div className="flex items-center gap-2 text-sm text-surface-600 mb-4">
                    <svg
                      className="w-4 h-4 text-surface-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>

                    {agent.phone}
                  </div>
                )}

                <div className="flex gap-2 mt-auto">
                  <Link
                    to="/listings"
                    className="btn-secondary flex-1 text-sm text-center py-2"
                  >
                    View listings
                  </Link>

                  <a
                    href={mailtoLink}
                    className="btn-primary flex-1 text-sm text-center py-2"
                  >
                    Contact
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 bg-surface-900 rounded-3xl px-8 py-12 text-center text-white"
      >
        <h2 className="text-2xl font-bold mb-2">Are you a property agent?</h2>

        <p className="text-white/60 mb-6 max-w-md mx-auto text-sm">
          Join nestHaven and reach thousands of buyers and renters.
        </p>

        <Link to="/register?role=agent" className="btn-primary px-8 py-3">
          Join as an agent
        </Link>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api";
import SEO from "../components/common/SEO";
import PropertyCard from "../components/property/PropertyCard";
import useAuth from "../hooks/useAuth";

const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

function StarFull({ filled }) {
  return (
    <svg
      className={"w-5 h-5 " + (filled ? "text-amber-400" : "text-surface-200")}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function RatingBar({ stars, count, total }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-surface-600 w-4">{stars}</span>
      <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: total > 0 ? (count / total) * 100 + "%" : "0%" }}
        />
      </div>
      <span className="text-xs text-surface-500 w-6 text-right">{count}</span>
    </div>
  );
}

const formatPrice = (price) => {
  if (!price || price === 0) return null;
  if (price >= 1000000) return "KES " + (price / 1000000).toFixed(1) + "M";
  if (price >= 1000) return "KES " + (price / 1000).toFixed(0) + "K";
  return "KES " + price.toLocaleString();
};

export default function AgentProfilePage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [agent, setAgent] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("about");
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    api
      .get("/users/agents/" + id)
      .then((res) => {
        setAgent(res.data.agent);
        setListings(res.data.listings);
        if (user) {
          setContactForm((f) => ({ ...f, name: user.name, email: user.email }));
        }
      })
      .catch(() => toast.error("Agent not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!review.comment.trim()) {
      toast.error("Please write a comment");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/users/agents/" + id + "/reviews", review);
      toast.success("Review submitted!");
      const res = await api.get("/users/agents/" + id);
      setAgent(res.data.agent);
      setReview({ rating: 5, comment: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const sendContact = async (e) => {
    e.preventDefault();
    if (!contactForm.message.trim()) {
      toast.error("Please write a message");
      return;
    }
    setSending(true);
    try {
      await api.post("/inquiries", {
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone,
        message: contactForm.message,
        listingId: listings[0]?._id,
      });
      toast.success("Message sent! The agent will contact you soon.");
      setContactForm((f) => ({ ...f, message: "" }));
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const ratingDist = (reviews) => {
    const d = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews?.forEach((r) => {
      d[r.rating] = (d[r.rating] || 0) + 1;
    });
    return d;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="card p-6 space-y-4">
            <div className="skeleton w-32 h-32 rounded-full mx-auto" />
            <div className="skeleton h-6 w-48 rounded mx-auto" />
            <div className="skeleton h-4 w-32 rounded mx-auto" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-10 rounded-xl" />
            <div className="skeleton h-10 rounded-xl" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-12 rounded-xl" />
            <div className="skeleton h-48 rounded-xl" />
            <div className="skeleton h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-20">
        <p className="text-surface-500 text-lg">Agent not found</p>
        <Link to="/agents" className="btn-primary mt-4 inline-block px-6">
          Back to agents
        </Link>
      </div>
    );
  }

  const p = agent.agentProfile || {};
  const dist = ratingDist(agent.reviews);
  const minFmt = formatPrice(p.minPrice);
  const maxFmt = formatPrice(p.maxPrice);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title={agent.name + " — nestHaven Agent"}
        description={p.bio || "Real estate agent on nestHaven"}
        image={agent.avatar}
      />

      {/* Back link */}
      <Link
        to="/agents"
        className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 mb-6 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to agents
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left sidebar ──────────────────────────────── */}
        <div className="space-y-6">
          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 text-center"
          >
            <div className="relative inline-block mb-4">
              {agent.avatar ? (
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-32 h-32 rounded-full object-cover object-top border-4 border-white shadow-md mx-auto"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white text-4xl font-bold flex items-center justify-center mx-auto border-4 border-white shadow-md">
                  {getInitials(agent.name)}
                </div>
              )}
              {p.isTopAgent && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-lg px-2 py-1 shadow-md">
                    <div className="w-4 h-4 bg-brand-500 rounded flex items-center justify-center">
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
                  </div>
                </div>
              )}
              {p.verified && !p.isTopAgent && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow">
                  <svg
                    className="w-4 h-4 text-white"
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

            <span
              className={
                "text-xs font-bold tracking-wider uppercase block mb-1 " +
                (p.teamType === "team" ? "text-amber-500" : "text-brand-500")
              }
            >
              {p.teamType === "team"
                ? "TEAM"
                : (p.title || "AGENT").toUpperCase()}
            </span>

            <h1 className="text-xl font-bold text-surface-900 mb-0.5">
              {agent.name}
            </h1>

            {p.brokerage && (
              <p className="text-sm text-surface-500 mb-3">{p.brokerage}</p>
            )}

            {agent.numReviews > 0 && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarFull key={s} filled={s <= Math.round(agent.rating)} />
                  ))}
                </div>
                <span className="text-sm font-medium text-surface-900">
                  {Number(agent.rating).toFixed(1)}
                </span>
                <span className="text-sm text-surface-500">
                  ({agent.numReviews} reviews)
                </span>
              </div>
            )}

            {/* Sales stats */}
            {minFmt && maxFmt && (
              <div className="bg-surface-50 rounded-xl p-3 mb-3 text-sm">
                <p className="text-surface-500 text-xs mb-1">Price range</p>
                <p className="font-bold text-surface-900">
                  {minFmt} – {maxFmt}
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="bg-surface-50 rounded-xl p-3">
                <p className="text-xl font-bold text-surface-900">
                  {agent.listingCount || 0}
                </p>
                <p className="text-xs text-surface-500">Listings</p>
              </div>
              <div className="bg-surface-50 rounded-xl p-3">
                <p className="text-xl font-bold text-surface-900">
                  {p.salesLast12 || 0}
                </p>
                <p className="text-xs text-surface-500">Sales/yr</p>
              </div>
              <div className="bg-surface-50 rounded-xl p-3">
                <p className="text-xl font-bold text-surface-900">
                  {p.experience || 0}
                </p>
                <p className="text-xs text-surface-500">Years</p>
              </div>
            </div>

            {agent.phone && (
              <a
                href={"tel:" + agent.phone}
                className="btn-secondary w-full text-sm flex items-center justify-center gap-2 mb-2"
              >
                <svg
                  className="w-4 h-4"
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
              </a>
            )}

            <a
              href={"mailto:" + agent.email}
              className="btn-primary w-full text-sm flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Send email
            </a>

            {/* Social links */}
            {(p.social?.linkedin ||
              p.social?.twitter ||
              p.social?.facebook ||
              p.social?.website) && (
              <div className="flex justify-center gap-2 mt-4">
                {p.social?.website && (
                  <a
                    href={p.social.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-surface-100 hover:bg-brand-50 hover:text-brand-500 rounded-lg flex items-center justify-center text-surface-500 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
                      />
                    </svg>
                  </a>
                )}
                {p.social?.linkedin && (
                  <a
                    href={p.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-surface-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg flex items-center justify-center text-surface-500 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                )}
                {p.social?.twitter && (
                  <a
                    href={p.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-surface-100 hover:bg-sky-50 hover:text-sky-500 rounded-lg flex items-center justify-center text-surface-500 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                )}
                {p.social?.facebook && (
                  <a
                    href={p.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-surface-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center justify-center text-surface-500 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </motion.div>

          {/* Quick info card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-5 space-y-3"
          >
            {p.license && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-surface-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-surface-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-surface-400">License</p>
                  <p className="text-sm font-medium text-surface-900">
                    {p.license}
                  </p>
                </div>
              </div>
            )}
            {p.responseTime && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-surface-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-surface-400">Response time</p>
                  <p className="text-sm font-medium text-surface-900">
                    {p.responseTime}
                  </p>
                </div>
              </div>
            )}
            {p.languages?.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-surface-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-surface-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-surface-400 mb-1">Languages</p>
                  <div className="flex flex-wrap gap-1">
                    {p.languages.map((l) => (
                      <span
                        key={l}
                        className="badge bg-surface-100 text-surface-600 text-xs"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-surface-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-surface-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-surface-400">Member since</p>
                <p className="text-sm font-medium text-surface-900">
                  {new Date(agent.createdAt).getFullYear()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-5"
          >
            <h3 className="font-semibold text-surface-900 mb-4">
              Send a message
            </h3>
            <form onSubmit={sendContact} className="space-y-3">
              <input
                value={contactForm.name}
                onChange={(e) =>
                  setContactForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Your name"
                required
                className="input text-sm"
              />
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) =>
                  setContactForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="Email address"
                required
                className="input text-sm"
              />
              <input
                value={contactForm.phone}
                onChange={(e) =>
                  setContactForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="Phone (optional)"
                className="input text-sm"
              />
              <textarea
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm((f) => ({ ...f, message: e.target.value }))
                }
                placeholder={"Hi " + agent.name + ", I would like to..."}
                rows={3}
                required
                className="input text-sm resize-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full text-sm"
              >
                {sending ? "Sending..." : "Send message"}
              </button>
            </form>
          </motion.div>
        </div>

        {/* ── Right main content ─────────────────────────── */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-surface-100 rounded-xl p-1">
            {[
              { key: "about", label: "About" },
              { key: "listings", label: "Listings (" + listings.length + ")" },
              {
                key: "reviews",
                label: "Reviews (" + (agent.numReviews || 0) + ")",
              },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={
                  "flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors " +
                  (tab === t.key
                    ? "bg-white text-surface-900 shadow-sm"
                    : "text-surface-500 hover:text-surface-700")
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* About tab */}
          {tab === "about" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {p.bio && (
                <div className="card p-6">
                  <h3 className="font-semibold text-surface-900 mb-3">
                    About {agent.name}
                  </h3>
                  <p className="text-surface-600 leading-relaxed text-sm">
                    {p.bio}
                  </p>
                </div>
              )}

              {p.specializations?.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-semibold text-surface-900 mb-3">
                    Specializations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {p.specializations.map((s) => (
                      <span
                        key={s}
                        className="badge bg-brand-50 text-brand-700 text-sm px-3 py-1"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {p.serviceAreas?.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-semibold text-surface-900 mb-3">
                    Service areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {p.serviceAreas.map((a) => (
                      <div
                        key={a}
                        className="flex items-center gap-1.5 bg-surface-50 border border-surface-200 rounded-lg px-3 py-1.5 text-sm text-surface-700"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-surface-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                        </svg>
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Active listings", value: agent.listingCount || 0 },
                  { label: "Sales last 12 mo", value: p.salesLast12 || 0 },
                  {
                    label: "Total career sales",
                    value: (p.totalSales || 0).toLocaleString(),
                  },
                  { label: "Client reviews", value: agent.numReviews || 0 },
                ].map((stat) => (
                  <div key={stat.label} className="card p-4 text-center">
                    <p className="text-2xl font-bold text-brand-500">
                      {stat.value}
                    </p>
                    <p className="text-xs text-surface-500 mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Listings tab */}
          {tab === "listings" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {listings.length === 0 ? (
                <div className="text-center py-16 card">
                  <p className="text-surface-400">No active listings</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {listings.map((listing, i) => (
                    <PropertyCard
                      key={listing._id}
                      listing={listing}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Reviews tab */}
          {tab === "reviews" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Rating summary */}
              {agent.numReviews > 0 && (
                <div className="card p-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <div className="text-center flex-shrink-0">
                      <p className="text-6xl font-bold text-surface-900">
                        {Number(agent.rating).toFixed(1)}
                      </p>
                      <div className="flex gap-0.5 justify-center mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <StarFull
                            key={s}
                            filled={s <= Math.round(agent.rating)}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-surface-500 mt-1">
                        {agent.numReviews} reviews
                      </p>
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <RatingBar
                          key={stars}
                          stars={stars}
                          count={dist[stars] || 0}
                          total={agent.numReviews}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Individual reviews */}
              {agent.reviews?.length > 0 ? (
                <div className="space-y-4">
                  {agent.reviews.map((r, i) => (
                    <div key={i} className="card p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-surface-900 text-sm">
                            {r.name}
                          </p>
                          <p className="text-xs text-surface-400">
                            {new Date(r.createdAt).toLocaleDateString("en-KE", {
                              year: "numeric",
                              month: "long",
                            })}
                          </p>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <StarFull key={s} filled={s <= r.rating} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-surface-600 leading-relaxed">
                        {r.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 card">
                  <p className="text-surface-400 text-sm">
                    No reviews yet. Be the first to review this agent.
                  </p>
                </div>
              )}

              {/* Write a review form */}
              {isAuthenticated && user?._id !== agent._id && (
                <div className="card p-6">
                  <h3 className="font-semibold text-surface-900 mb-4">
                    Write a review
                  </h3>
                  <form onSubmit={submitReview} className="space-y-4">
                    <div>
                      <p className="text-sm text-surface-700 mb-2">
                        Your rating
                      </p>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() =>
                              setReview((r) => ({ ...r, rating: s }))
                            }
                            className="transition-transform hover:scale-110"
                          >
                            <svg
                              className={
                                "w-8 h-8 " +
                                (s <= review.rating
                                  ? "text-amber-400"
                                  : "text-surface-200")
                              }
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                        <span className="text-sm text-surface-500 ml-2">
                          {
                            [
                              "",
                              "Poor",
                              "Fair",
                              "Good",
                              "Very good",
                              "Excellent",
                            ][review.rating]
                          }
                        </span>
                      </div>
                    </div>
                    <textarea
                      value={review.comment}
                      onChange={(e) =>
                        setReview((r) => ({ ...r, comment: e.target.value }))
                      }
                      placeholder="Share your experience working with this agent..."
                      rows={4}
                      required
                      className="input resize-none text-sm"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary text-sm px-6"
                    >
                      {submitting ? "Submitting..." : "Submit review"}
                    </button>
                  </form>
                </div>
              )}

              {!isAuthenticated && (
                <div className="card p-6 text-center">
                  <p className="text-surface-500 text-sm mb-3">
                    Sign in to leave a review
                  </p>
                  <Link to="/login" className="btn-primary text-sm px-6">
                    Sign in
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

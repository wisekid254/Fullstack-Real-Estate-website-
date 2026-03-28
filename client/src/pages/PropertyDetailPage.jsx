import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import ImageGallery from "../components/property/ImageGallery";
import listingService from "../services/listingService";
import inquiryService from "../services/inquiryService";
import useAuth from "../hooks/useAuth";
import { formatPriceWithType, formatArea, formatDate } from "../utils/format";

const AMENITY_ICONS = {
  Pool: "M3 12h18M3 6h18M3 18h18",
  Gym: "M4 6h16M4 12h16M4 18h16",
  Security: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  Garden: "M12 22V12m0 0C12 7 7 5 7 5s0 5 5 7m0 0c0-5 5-7 5-7s0 5-5 7",
  WiFi: "M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01",
  Elevator: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  default: "M5 13l4 4L19 7",
};

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [MapComponent, setMapComponent] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Fetch listing
  useEffect(() => {
    listingService
      .getListing(id)
      .then((data) => {
        setListing(data.listing);
        // Pre-fill form if logged in
        if (user) {
          setForm((f) => ({ ...f, name: user.name, email: user.email }));
        }
      })
      .catch(() => navigate("/listings"))
      .finally(() => setLoading(false));
  }, [id]);

  // Lazy-load Leaflet map only on client
  useEffect(() => {
    import("../components/property/PropertyMap")
      .then((mod) => setMapComponent(() => mod.default))
      .catch(() => {});
  }, []);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleInquiry = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSending(true);
    try {
      await inquiryService.create({ listingId: id, ...form });
      toast.success("Message sent! The agent will contact you soon.");
      setForm((f) => ({ ...f, message: "" }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <DetailSkeleton />;

  if (!listing)
    return (
      <div className="text-center py-20">
        <p className="text-surface-400 text-lg">Property not found</p>
      </div>
    );

  const {
    title,
    price,
    type,
    category,
    status,
    description,
    location,
    features,
    amenities,
    images,
    agent,
    createdAt,
    views,
    featured,
  } = listing;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      {listing && (
        <SEO
          title={listing.title}
          description={listing.description?.slice(0, 155)}
          image={listing.images?.[0]?.url}
        />
      )}
      <button
        onClick={() => navigate(-1)}
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
        Back to listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left column ──────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ImageGallery images={images} title={title} />
          </motion.div>

          {/* Title + badges */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-wrap gap-2 mb-3">
              <span
                className={`badge ${type === "rent" ? "badge-green" : "badge-blue"}`}
              >
                For {type}
              </span>
              <span className="badge bg-surface-100 text-surface-700 capitalize">
                {category}
              </span>
              {featured && (
                <span className="badge bg-amber-50 text-amber-800">
                  Featured
                </span>
              )}
              {status !== "active" && (
                <span className="badge bg-red-50 text-red-700 capitalize">
                  {status}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 mb-2">
              {title}
            </h1>

            <div className="flex items-center gap-1.5 text-surface-500 text-sm mb-4">
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
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              {location?.address}, {location?.city}, {location?.country}
            </div>

            <p className="text-2xl font-bold text-brand-500">
              {formatPriceWithType(price, type)}
            </p>
          </motion.div>

          {/* Key features */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-6"
          >
            <h2 className="font-semibold text-surface-900 mb-4">
              Property details
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {features?.bedrooms > 0 && (
                <DetailStat label="Bedrooms" value={features.bedrooms} />
              )}
              {features?.bathrooms > 0 && (
                <DetailStat label="Bathrooms" value={features.bathrooms} />
              )}
              {features?.area > 0 && (
                <DetailStat label="Area" value={formatArea(features.area)} />
              )}
              {features?.parking > 0 && (
                <DetailStat
                  label="Parking"
                  value={`${features.parking} spots`}
                />
              )}
              {features?.yearBuilt && (
                <DetailStat label="Year built" value={features.yearBuilt} />
              )}
              <DetailStat
                label="Furnished"
                value={features?.furnished ? "Yes" : "No"}
              />
              <DetailStat label="Type" value={category} capitalize />
              <DetailStat label="Listed" value={formatDate(createdAt)} />
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h2 className="font-semibold text-surface-900 mb-3">Description</h2>
            <p className="text-surface-600 leading-relaxed text-sm whitespace-pre-line">
              {description}
            </p>
          </motion.div>

          {/* Amenities */}
          {amenities?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="card p-6"
            >
              <h2 className="font-semibold text-surface-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenities.map((a) => (
                  <div
                    key={a}
                    className="flex items-center gap-2.5 text-sm text-surface-700"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-brand-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={AMENITY_ICONS[a] || AMENITY_ICONS.default}
                        />
                      </svg>
                    </div>
                    {a}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Map */}
          {location?.lat && location?.lng && MapComponent && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <h2 className="font-semibold text-surface-900 mb-4">Location</h2>
              <MapComponent
                lat={location.lat}
                lng={location.lng}
                title={title}
              />
            </motion.div>
          )}
        </div>

        {/* ── Right column ─────────────────────────────── */}
        <div className="space-y-6">
          {/* Agent card */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h2 className="font-semibold text-surface-900 mb-4">Listed by</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-800 font-semibold flex items-center justify-center text-sm">
                {agent?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-surface-900">{agent?.name}</p>
                <p className="text-xs text-surface-500">{agent?.email}</p>
              </div>
            </div>
            {agent?.phone && (
              <a
                href={`tel:${agent.phone}`}
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
                Call agent
              </a>
            )}
            <div className="text-xs text-surface-400 text-center mt-2">
              {views} views · Listed {formatDate(createdAt)}
            </div>
          </motion.div>

          {/* Inquiry form */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="card p-6"
          >
            <h2 className="font-semibold text-surface-900 mb-4">
              Send a message
            </h2>
            <form onSubmit={handleInquiry} className="space-y-3">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name *"
                required
                className="input text-sm"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email address *"
                required
                className="input text-sm"
              />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number (optional)"
                className="input text-sm"
              />
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder={`Hi, I'm interested in "${title}". Please contact me with more details.`}
                rows={4}
                required
                className="input text-sm resize-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full text-sm"
              >
                {sending ? "Sending…" : "Send message"}
              </button>
            </form>
            {!isAuthenticated && (
              <p className="text-xs text-surface-400 text-center mt-3">
                <button
                  onClick={() => navigate("/login")}
                  className="text-brand-500 hover:underline"
                >
                  Sign in
                </button>{" "}
                to track your inquiries
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ── Small helper components ───────────────────────────────

function DetailStat({ label, value, capitalize = false }) {
  return (
    <div className="bg-surface-50 rounded-xl p-3">
      <p className="text-xs text-surface-500 mb-1">{label}</p>
      <p
        className={`text-sm font-semibold text-surface-900 ${capitalize ? "capitalize" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="skeleton h-4 w-32 rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="skeleton h-96 rounded-2xl" />
          <div className="skeleton h-8 w-2/3 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
          <div className="skeleton h-32 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="skeleton h-48 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

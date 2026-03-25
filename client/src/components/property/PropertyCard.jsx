import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { formatPriceWithType, formatArea } from "../../utils/format";

export default function PropertyCard({ listing, index = 0 }) {
  const [imgError, setImgError] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    _id,
    title,
    price,
    type,
    category,
    location,
    features,
    images,
    featured,
  } = listing;

  const imageUrl = images?.[0]?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Link to={`/listings/${_id}`} className="block group">
        <div className="card overflow-hidden">
          {/* Image */}
          <div className="relative h-52 bg-surface-100 overflow-hidden">
            {imageUrl && !imgError ? (
              <img
                src={imageUrl}
                alt={title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-100">
                <svg
                  className="w-12 h-12 text-surface-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span
                className={`badge ${type === "rent" ? "badge-green" : "badge-blue"}`}
              >
                For {type}
              </span>
              {featured && (
                <span className="badge bg-amber-50 text-amber-800">
                  Featured
                </span>
              )}
            </div>

            {/* Save button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setSaved((s) => !s);
              }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
            >
              <svg
                className={`w-4 h-4 transition-colors ${saved ? "text-red-500 fill-red-500" : "text-surface-400"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            {/* Price */}
            <div className="flex items-start justify-between mb-1">
              <p className="text-lg font-semibold text-surface-900">
                {formatPriceWithType(price, type)}
              </p>
              <span className="text-xs text-surface-500 capitalize mt-1">
                {category}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-medium text-surface-800 mb-1 line-clamp-1 group-hover:text-brand-500 transition-colors">
              {title}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-1 mb-3">
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-xs text-surface-500 truncate">
                {location?.address}, {location?.city}
              </span>
            </div>

            {/* Features */}
            <div className="flex items-center gap-4 pt-3 border-t border-surface-100">
              {features?.bedrooms > 0 && (
                <FeaturePill icon="bed" value={`${features.bedrooms} bd`} />
              )}
              {features?.bathrooms > 0 && (
                <FeaturePill icon="bath" value={`${features.bathrooms} ba`} />
              )}
              {features?.area > 0 && (
                <FeaturePill icon="area" value={formatArea(features.area)} />
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function FeaturePill({ icon, value }) {
  const icons = {
    bed: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    bath: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    area: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4",
  };
  return (
    <div className="flex items-center gap-1 text-xs text-surface-600">
      <svg
        className="w-3.5 h-3.5 text-surface-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={icons[icon]} />
      </svg>
      {value}
    </div>
  );
}

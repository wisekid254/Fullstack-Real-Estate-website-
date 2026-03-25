import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageGallery({ images = [], title = "" }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="w-full h-96 bg-surface-100 rounded-2xl flex items-center justify-center">
        <svg
          className="w-16 h-16 text-surface-300"
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
    );
  }

  const prev = () => setActive((a) => (a - 1 + images.length) % images.length);
  const next = () => setActive((a) => (a + 1) % images.length);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative w-full h-72 sm:h-96 lg:h-[480px] bg-surface-100 rounded-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]?.url}
            alt={`${title} — image ${active + 1}`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Counter */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full">
          {active + 1} / {images.length}
        </div>

        {/* Arrows — only show if more than 1 image */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-all"
            >
              <svg
                className="w-4 h-4 text-surface-700"
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
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-all"
            >
              <svg
                className="w-4 h-4 text-surface-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                active === i
                  ? "border-brand-500"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

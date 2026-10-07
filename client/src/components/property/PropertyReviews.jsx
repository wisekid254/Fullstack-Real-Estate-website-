import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import reviewService from "../../services/reviewService";
import useAuth from "../../hooks/useAuth";

const ASPECTS = [
  { key: "value", label: "Value for money" },
  { key: "location", label: "Location" },
  { key: "condition", label: "Condition" },
  { key: "amenities", label: "Amenities" },
];

function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <svg
            className={
              "w-7 h-7 " +
              (s <= (hover || value) ? "text-amber-400" : "text-surface-200")
            }
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      <span className="text-sm text-surface-500 self-center ml-1">
        {["", "Poor", "Fair", "Good", "Very good", "Excellent"][hover || value]}
      </span>
    </div>
  );
}

function StarDisplay({ rating, size = "sm" }) {
  const cls = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={
            cls +
            " " +
            (s <= Math.round(rating) ? "text-amber-400" : "text-surface-200")
          }
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-surface-600 w-4">{label}</span>
      <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: total > 0 ? (count / total) * 100 + "%" : "0%" }}
        />
      </div>
      <span className="text-xs text-surface-500 w-4 text-right">{count}</span>
    </div>
  );
}

export default function PropertyReviews({ listingId }) {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    rating: 5,
    title: "",
    comment: "",
    aspects: { value: 0, location: 0, condition: 0, amenities: 0 },
  });

  useEffect(() => {
    fetchReviews();
  }, [listingId]);

  const fetchReviews = async () => {
    try {
      const res = await reviewService.getListingReviews(listingId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.comment.trim()) {
      toast.error("Please fill in title and comment");
      return;
    }
    setSubmitting(true);
    try {
      await reviewService.createReview(listingId, form);
      toast.success("Review submitted!");
      setShowForm(false);
      setForm({
        rating: 5,
        title: "",
        comment: "",
        aspects: { value: 0, location: 0, condition: 0, amenities: 0 },
      });
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      toast.error("Sign in to mark reviews as helpful");
      return;
    }
    await reviewService.markHelpful(reviewId);
    fetchReviews();
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    await reviewService.deleteReview(reviewId);
    fetchReviews();
    toast.success("Review deleted");
  };

  if (loading) {
    return (
      <div className="card p-6 space-y-3">
        <div className="skeleton h-6 w-40 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
      </div>
    );
  }

  const dist = data?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-surface-900 text-lg">
            Property Reviews
            {data?.total > 0 && (
              <span className="ml-2 text-sm text-surface-400 font-normal">
                ({data.total})
              </span>
            )}
          </h2>
          {isAuthenticated && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary text-sm px-4"
            >
              Write a review
            </button>
          )}
        </div>

        {data?.total > 0 ? (
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="text-center flex-shrink-0">
              <p className="text-5xl font-bold text-surface-900">
                {Number(data.averageRating).toFixed(1)}
              </p>
              <StarDisplay rating={data.averageRating} size="lg" />
              <p className="text-sm text-surface-500 mt-1">
                {data.total} reviews
              </p>
            </div>
            <div className="flex-1 w-full space-y-1.5">
              {[5, 4, 3, 2, 1].map((s) => (
                <RatingBar
                  key={s}
                  label={s}
                  count={dist[s] || 0}
                  total={data.total}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <svg
              className="w-12 h-12 text-surface-200 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <p className="text-surface-400 text-sm">No reviews yet</p>
            <p className="text-surface-400 text-xs mt-1">
              Be the first to review this property
            </p>
          </div>
        )}
      </div>

      {/* Write review form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="font-semibold text-surface-900 mb-5">
            Write your review
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Overall rating */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Overall rating
              </label>
              <StarInput
                value={form.rating}
                onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
              />
            </div>

            {/* Aspect ratings */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-3">
                Rate specific aspects
                <span className="text-surface-400 font-normal ml-1">
                  (optional)
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ASPECTS.map((aspect) => (
                  <div key={aspect.key}>
                    <p className="text-xs text-surface-500 mb-1">
                      {aspect.label}
                    </p>
                    <StarInput
                      value={form.aspects[aspect.key]}
                      onChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          aspects: { ...f.aspects, [aspect.key]: v },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Review title
              </label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Summarize your experience"
                required
                maxLength={100}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Your review
              </label>
              <textarea
                value={form.comment}
                onChange={(e) =>
                  setForm((f) => ({ ...f, comment: e.target.value }))
                }
                placeholder="Share the details of your experience with this property..."
                rows={4}
                required
                maxLength={1000}
                className="input resize-none"
              />
              <p className="text-xs text-surface-400 mt-1 text-right">
                {form.comment.length}/1000
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary px-6 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit review"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary px-6"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Review list */}
      {data?.reviews?.length > 0 && (
        <div className="space-y-4">
          {data.reviews.map((review, i) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {review.avatar ? (
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-800 font-semibold flex items-center justify-center text-sm">
                      {review.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-surface-900 text-sm">
                      {review.name}
                    </p>
                    <p className="text-xs text-surface-400">
                      {new Date(review.createdAt).toLocaleDateString("en-KE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarDisplay rating={review.rating} />
                  {(user?._id === review.user || user?.role === "admin") && (
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="text-surface-300 hover:text-red-500 transition-colors ml-2"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <h4 className="font-semibold text-surface-900 mb-1">
                {review.title}
              </h4>
              <p className="text-sm text-surface-600 leading-relaxed">
                {review.comment}
              </p>

              {/* Aspect ratings */}
              {Object.entries(review.aspects || {}).some(([, v]) => v > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-surface-100">
                  {ASPECTS.map(
                    (aspect) =>
                      review.aspects?.[aspect.key] > 0 && (
                        <div key={aspect.key} className="text-center">
                          <p className="text-xs text-surface-400 mb-0.5">
                            {aspect.label}
                          </p>
                          <div className="flex justify-center">
                            <StarDisplay rating={review.aspects[aspect.key]} />
                          </div>
                        </div>
                      ),
                  )}
                </div>
              )}

              {/* Helpful button */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-surface-100">
                <button
                  onClick={() => handleHelpful(review._id)}
                  className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-brand-500 transition-colors"
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
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  Helpful ({review.helpful?.length || 0})
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!isAuthenticated && (
        <div className="card p-5 text-center">
          <p className="text-surface-500 text-sm mb-3">
            Sign in to write a review
          </p>
          <Link to="/login" className="btn-primary text-sm px-6">
            Sign in
          </Link>
        </div>
      )}
    </div>
  );
}

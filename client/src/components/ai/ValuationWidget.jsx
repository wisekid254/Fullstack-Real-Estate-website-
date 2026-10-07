import { useState } from "react";
import { motion } from "framer-motion";
import aiService from "../../services/aiService";

const VERDICT_CONFIG = {
  UNDERPRICED: {
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "📉",
    label: "Underpriced",
  },
  "FAIRLY PRICED": {
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "✅",
    label: "Fairly Priced",
  },
  OVERPRICED: {
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "📈",
    label: "Overpriced",
  },
};

export default function ValuationWidget({ listingId }) {
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runValuation = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiService.valuateListing(listingId);
      setValuation(data.valuation);
    } catch (err) {
      setError("Unable to generate valuation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const config = valuation ? VERDICT_CONFIG[valuation.verdict] : null;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
          <svg
            className="w-4 h-4 text-brand-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-surface-900 text-sm">
            AI Price Analysis
          </h3>
          <p className="text-xs text-surface-400">Powered by nestHaven AI</p>
        </div>
      </div>

      {!valuation && !loading && (
        <div className="text-center py-4">
          <p className="text-surface-500 text-sm mb-4">
            Get an AI-powered valuation to see if this property is fairly priced
          </p>
          <button onClick={runValuation} className="btn-primary text-sm px-6">
            Analyse price
          </button>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          <div className="skeleton h-4 rounded w-3/4" />
          <div className="skeleton h-8 rounded" />
          <div className="skeleton h-4 rounded w-1/2" />
          <div className="skeleton h-4 rounded w-full" />
          <div className="skeleton h-4 rounded w-2/3" />
          <p className="text-xs text-surface-400 text-center mt-2">
            Analysing comparable listings…
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-4">
          <p className="text-red-500 text-sm mb-3">{error}</p>
          <button onClick={runValuation} className="btn-secondary text-sm">
            Try again
          </button>
        </div>
      )}

      {valuation && config && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Verdict banner */}
          <div
            className={`rounded-xl p-4 border ${config.bg} ${config.border}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{config.icon}</span>
                <span className={`font-bold text-lg ${config.color}`}>
                  {config.label}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-surface-500">Confidence</p>
                <p className={`font-bold ${config.color}`}>
                  {valuation.confidenceScore}%
                </p>
              </div>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${valuation.confidenceScore}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`h-full rounded-full ${
                  valuation.verdict === "OVERPRICED"
                    ? "bg-red-500"
                    : valuation.verdict === "UNDERPRICED"
                      ? "bg-green-500"
                      : "bg-blue-500"
                }`}
              />
            </div>
          </div>

          {/* Estimated value */}
          <div className="flex items-center justify-between py-3 border-b border-surface-100">
            <span className="text-sm text-surface-600">
              Estimated fair value
            </span>
            <span className="font-bold text-surface-900">
              KES {valuation.estimatedValue?.toLocaleString()}
            </span>
          </div>

          {/* Explanation */}
          <p className="text-sm text-surface-600 leading-relaxed">
            {valuation.explanation}
          </p>

          {/* Factors */}
          {valuation.factors?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                Key factors
              </p>
              <ul className="space-y-1.5">
                {valuation.factors.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-surface-600"
                  >
                    <svg
                      className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={runValuation}
            className="text-xs text-surface-400 hover:text-brand-500 transition-colors"
          >
            Refresh analysis
          </button>
        </motion.div>
      )}
    </div>
  );
}

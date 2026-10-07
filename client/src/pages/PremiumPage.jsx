import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import SEO from "../components/common/SEO";
import paymentService from "../services/paymentService";
import api from "../services/api";
import useAuth from "../hooks/useAuth";

const PLAN_FEATURES = {
  featured_7: [
    "Featured badge on listing card",
    "Top placement in search results",
    "Featured on home page",
    "7 days duration",
  ],
  featured_30: [
    "Featured badge on listing card",
    "Top placement in search results",
    "Featured on home page",
    "30 days duration",
    "Best value for money",
  ],
  premium_7: [
    "Priority placement in search",
    "Highlighted card design",
    "Analytics dashboard",
    "7 days duration",
  ],
  premium_30: [
    "Priority placement in search",
    "Highlighted card design",
    "Analytics dashboard",
    "30 days duration",
    "Email blast to 1,000+ buyers",
  ],
};

const PLAN_COLORS = {
  featured_7: "border-amber-200 bg-amber-50",
  featured_30: "border-amber-400 bg-amber-50 ring-2 ring-amber-400",
  premium_7: "border-brand-200 bg-brand-50",
  premium_30: "border-brand-400 bg-brand-50 ring-2 ring-brand-400",
};

export default function PremiumPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState({});
  const [listings, setListings] = useState([]);
  const [myPayments, setMyPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("featured_30");
  const [selectedListing, setSelectedListing] = useState("");
  const [method, setMethod] = useState("mpesa");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("select");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [mpesaCode, setMpesaCode] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    Promise.all([
      paymentService.getPlans(),
      api.get("/listings/user/" + user?._id),
      paymentService.getMyPayments(),
    ])
      .then(([plansData, listingsData, paymentsData]) => {
        setPlans(plansData.plans);
        setListings(listingsData.data?.listings || []);
        setMyPayments(paymentsData.payments);
        if (listingsData.data?.listings?.length > 0) {
          setSelectedListing(listingsData.data.listings[0]._id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleInitiate = async () => {
    if (!selectedListing) {
      toast.error("Please select a listing");
      return;
    }
    try {
      const data = await paymentService.initiatePayment({
        listingId: selectedListing,
        plan: selectedPlan,
        method,
        phone,
      });
      setPaymentInfo(data);
      setStep("pay");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate payment");
    }
  };

  const handleConfirm = async () => {
    if (!mpesaCode.trim()) {
      toast.error("Enter your M-Pesa code");
      return;
    }
    setConfirming(true);
    try {
      await paymentService.confirmPayment({
        reference: paymentInfo.reference,
        mpesaCode,
      });
      toast.success("Payment confirmed! Your listing has been promoted.");
      setStep("success");
      const paymentsData = await paymentService.getMyPayments();
      setMyPayments(paymentsData.payments);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm payment");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="skeleton h-8 w-48 rounded mb-4" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO
        title="Promote your listing — nestHaven"
        description="Get more visibility for your property listing on nestHaven."
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-brand-500 text-sm font-medium mb-1">
          Boost your listing
        </p>
        <h1 className="text-display-md text-surface-900 mb-2">
          Promote your property
        </h1>
        <p className="text-surface-500 text-sm max-w-xl">
          Get more eyes on your listing with featured placement and priority
          search results. Pay via M-Pesa, card or bank transfer.
        </p>
      </motion.div>

      {step === "select" && (
        <div className="space-y-8">
          {/* Plan selection */}
          <div>
            <h2 className="font-semibold text-surface-900 mb-4">
              Choose a plan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(plans).map(([key, plan]) => (
                <motion.div
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPlan(key)}
                  className={
                    "card p-5 cursor-pointer border-2 transition-all " +
                    (selectedPlan === key
                      ? PLAN_COLORS[key]
                      : "border-surface-200 hover:border-surface-300")
                  }
                >
                  {key === "featured_30" && (
                    <span className="block text-xs font-bold text-amber-600 bg-amber-100 rounded-full px-2 py-0.5 text-center mb-2">
                      Most popular
                    </span>
                  )}
                  {key === "premium_30" && (
                    <span className="block text-xs font-bold text-brand-600 bg-brand-100 rounded-full px-2 py-0.5 text-center mb-2">
                      Best value
                    </span>
                  )}
                  <p className="font-bold text-surface-900 text-sm mb-1">
                    {plan.label}
                  </p>
                  <p className="text-2xl font-bold text-surface-900 mb-3">
                    KES {plan.amount.toLocaleString()}
                  </p>
                  <ul className="space-y-1.5">
                    {PLAN_FEATURES[key]?.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-1.5 text-xs text-surface-600"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5"
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
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div
                    className={
                      "mt-4 w-5 h-5 rounded-full border-2 mx-auto flex items-center justify-center " +
                      (selectedPlan === key
                        ? "border-brand-500 bg-brand-500"
                        : "border-surface-300")
                    }
                  >
                    {selectedPlan === key && (
                      <svg
                        className="w-3 h-3 text-white"
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
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Select listing */}
          {listings.length > 0 && (
            <div className="card p-6">
              <h2 className="font-semibold text-surface-900 mb-4">
                Select listing to promote
              </h2>
              <div className="space-y-2">
                {listings.map((listing) => (
                  <div
                    key={listing._id}
                    onClick={() => setSelectedListing(listing._id)}
                    className={
                      "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all " +
                      (selectedListing === listing._id
                        ? "border-brand-500 bg-brand-50"
                        : "border-surface-200 hover:border-surface-300")
                    }
                  >
                    {listing.images?.[0]?.url && (
                      <img
                        src={listing.images[0].url}
                        alt={listing.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 truncate">
                        {listing.title}
                      </p>
                      <p className="text-xs text-surface-500">
                        KES {listing.price?.toLocaleString()} ·{" "}
                        {listing.location?.city}
                      </p>
                    </div>
                    <div
                      className={
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 " +
                        (selectedListing === listing._id
                          ? "border-brand-500 bg-brand-500"
                          : "border-surface-300")
                      }
                    >
                      {selectedListing === listing._id && (
                        <svg
                          className="w-3 h-3 text-white"
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
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {listings.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-surface-500 mb-3">
                You have no active listings to promote
              </p>
              <a href="/listings/create" className="btn-primary text-sm px-6">
                Create a listing
              </a>
            </div>
          )}

          {/* Payment method */}
          <div className="card p-6">
            <h2 className="font-semibold text-surface-900 mb-4">
              Payment method
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { key: "mpesa", label: "M-Pesa", icon: "📱" },
                { key: "card", label: "Card", icon: "💳" },
                { key: "bank", label: "Bank transfer", icon: "🏦" },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all " +
                    (method === m.key
                      ? "border-brand-500 bg-brand-50"
                      : "border-surface-200 hover:border-surface-300")
                  }
                >
                  <span className="text-2xl">{m.icon}</span>
                  <span className="text-xs font-medium text-surface-700">
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
            {method === "mpesa" && (
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="M-Pesa phone number e.g. 0712345678"
                className="input text-sm"
              />
            )}
          </div>

          <button
            onClick={handleInitiate}
            disabled={!selectedListing || !selectedPlan}
            className="btn-primary w-full py-4 text-base disabled:opacity-50"
          >
            Proceed to pay KES {plans[selectedPlan]?.amount?.toLocaleString()}
          </button>
        </div>
      )}

      {step === "pay" && paymentInfo && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="card p-6 border-2 border-brand-200 bg-brand-50">
            <h2 className="font-bold text-surface-900 text-lg mb-4">
              Complete your payment
            </h2>
            <div className="bg-white rounded-xl p-4 mb-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Reference</span>
                <span className="font-bold text-surface-900 font-mono">
                  {paymentInfo.reference}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Amount</span>
                <span className="font-bold text-surface-900">
                  KES {paymentInfo.amount?.toLocaleString()}
                </span>
              </div>
            </div>

            {method === "mpesa" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
                <p className="font-semibold text-green-800 mb-2">
                  M-Pesa payment instructions
                </p>
                <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                  <li>Go to M-Pesa on your phone</li>
                  <li>
                    Select <strong>Lipa na M-Pesa</strong>
                  </li>
                  <li>
                    Select <strong>Pay Bill</strong>
                  </li>
                  <li>
                    Business No: <strong>123456</strong>
                  </li>
                  <li>
                    Account No: <strong>{paymentInfo.reference}</strong>
                  </li>
                  <li>
                    Amount:{" "}
                    <strong>KES {paymentInfo.amount?.toLocaleString()}</strong>
                  </li>
                  <li>Enter your M-Pesa PIN and confirm</li>
                </ol>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                {method === "mpesa"
                  ? "M-Pesa confirmation code"
                  : "Transaction reference"}
              </label>
              <input
                value={mpesaCode}
                onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                placeholder={
                  method === "mpesa"
                    ? "e.g. QEA1234XYZ"
                    : "Bank reference number"
                }
                className="input font-mono"
              />
              <p className="text-xs text-surface-400 mt-1">
                Enter the confirmation code you received after payment
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("select")}
              className="btn-secondary flex-1"
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming || !mpesaCode.trim()}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {confirming ? "Confirming..." : "Confirm payment"}
            </button>
          </div>
        </motion.div>
      )}

      {step === "success" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-surface-900 mb-2">
            Payment successful!
          </h2>
          <p className="text-surface-500 mb-8">
            Your listing has been promoted. You will see increased views within
            minutes.
          </p>
          <div className="flex gap-3 justify-center">
            <a href="/listings" className="btn-secondary px-6">
              View listings
            </a>
            <a href="/profile" className="btn-primary px-6">
              Go to profile
            </a>
          </div>
        </motion.div>
      )}

      {/* Payment history */}
      {myPayments.length > 0 && step === "select" && (
        <div className="mt-10">
          <h2 className="font-semibold text-surface-900 mb-4">
            Payment history
          </h2>
          <div className="space-y-3">
            {myPayments.map((payment) => (
              <div
                key={payment._id}
                className="card p-4 flex items-center gap-4"
              >
                <div
                  className={
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 " +
                    (payment.status === "completed"
                      ? "bg-green-100"
                      : payment.status === "failed"
                        ? "bg-red-100"
                        : "bg-amber-100")
                  }
                >
                  <span className="text-lg">
                    {payment.status === "completed"
                      ? "✅"
                      : payment.status === "failed"
                        ? "❌"
                        : "⏳"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">
                    {payment.description}
                  </p>
                  <p className="text-xs text-surface-400">
                    {new Date(payment.createdAt).toLocaleDateString("en-KE", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    {" · "}Ref: {payment.reference}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-surface-900">
                    KES {payment.amount?.toLocaleString()}
                  </p>
                  <span
                    className={
                      "text-xs capitalize px-2 py-0.5 rounded-full " +
                      (payment.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : payment.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700")
                    }
                  >
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

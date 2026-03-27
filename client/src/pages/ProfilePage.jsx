import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import userService from "../services/userService";
import inquiryService from "../services/inquiryService";
import PropertyCard from "../components/property/PropertyCard";
import useAuth from "../hooks/useAuth";
import { fetchMe } from "../store/authSlice";
import { formatDate } from "../utils/format";

const TABS = ["Profile", "Saved properties", "My inquiries", "Security"];

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("Profile");
  const [saved, setSaved] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });

  // Load saved listings
  useEffect(() => {
    if (activeTab === "Saved properties") {
      userService
        .getSavedListings()
        .then((d) => setSaved(d.listings))
        .catch(console.error);
    }
    if (activeTab === "My inquiries") {
      inquiryService
        .getMine()
        .then((d) => setInquiries(d.inquiries))
        .catch(console.error);
    }
  }, [activeTab]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.updateProfile(profileForm);
      await dispatch(fetchMe());
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await userService.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("Password changed successfully");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-5 mb-8"
      >
        <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-800 text-xl font-bold flex items-center justify-center flex-shrink-0">
          {getInitials(user?.name)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{user?.name}</h1>
          <p className="text-surface-500 text-sm">{user?.email}</p>
          <span className="badge bg-surface-100 text-surface-700 capitalize mt-1">
            {user?.role}
          </span>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-200 mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-surface-500 hover:text-surface-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Profile tab ───────────────────────────── */}
      {activeTab === "Profile" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-lg"
        >
          <div className="card p-6">
            <h2 className="font-semibold text-surface-900 mb-5">
              Personal information
            </h2>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Full name
                </label>
                <input
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Email address
                </label>
                <input
                  value={user?.email}
                  disabled
                  className="input opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-surface-400 mt-1">
                  Email cannot be changed
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Phone number
                </label>
                <input
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="+254 700 000 000"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Account type
                </label>
                <input
                  value={user?.role}
                  disabled
                  className="input opacity-60 cursor-not-allowed capitalize"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Member since
                </label>
                <input
                  value={formatDate(user?.createdAt)}
                  disabled
                  className="input opacity-60 cursor-not-allowed"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Saving…" : "Save changes"}
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {/* ── Saved properties tab ─────────────────── */}
      {activeTab === "Saved properties" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {saved.length === 0 ? (
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <p className="text-surface-500 font-medium">
                No saved properties yet
              </p>
              <p className="text-surface-400 text-sm mt-1 mb-6">
                Click the heart icon on any listing to save it here
              </p>
              <Link to="/listings" className="btn-primary">
                Browse listings
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-surface-500 mb-6">
                {saved.length} saved properties
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {saved.map((listing, i) => (
                  <PropertyCard
                    key={listing._id}
                    listing={listing}
                    index={i}
                    savedIds={saved.map((l) => l._id)}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* ── My inquiries tab ─────────────────────── */}
      {activeTab === "My inquiries" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {inquiries.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-surface-500 font-medium">
                No inquiries sent yet
              </p>
              <p className="text-surface-400 text-sm mt-1 mb-6">
                Contact an agent from any property page to start a conversation
              </p>
              <Link to="/listings" className="btn-primary">
                Browse listings
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inq) => (
                <div key={inq._id} className="card p-5">
                  <div className="flex items-start gap-4">
                    {/* Listing thumbnail */}
                    <div className="w-20 h-16 rounded-lg overflow-hidden bg-surface-100 flex-shrink-0">
                      {inq.listing?.images?.[0]?.url ? (
                        <img
                          src={inq.listing.images[0].url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-200" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/listings/${inq.listing?._id}`}
                        className="font-medium text-surface-900 hover:text-brand-500 transition-colors text-sm line-clamp-1"
                      >
                        {inq.listing?.title}
                      </Link>
                      <p className="text-xs text-surface-400 mt-0.5 mb-2">
                        {inq.listing?.location?.city} · Sent{" "}
                        {formatDate(inq.createdAt)}
                      </p>
                      <p className="text-sm text-surface-600 line-clamp-2">
                        {inq.message}
                      </p>
                    </div>

                    {/* Status */}
                    <span
                      className={`badge flex-shrink-0 ${inq.read ? "badge-green" : "badge-amber"}`}
                    >
                      {inq.read ? "Read" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Security tab ─────────────────────────── */}
      {activeTab === "Security" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-lg"
        >
          <div className="card p-6">
            <h2 className="font-semibold text-surface-900 mb-5">
              Change password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Current password
                </label>
                <input
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={(e) =>
                    setPwForm((p) => ({
                      ...p,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="••••••••"
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  New password
                </label>
                <input
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(e) =>
                    setPwForm((p) => ({ ...p, newPassword: e.target.value }))
                  }
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) =>
                    setPwForm((p) => ({ ...p, confirm: e.target.value }))
                  }
                  placeholder="••••••••"
                  required
                  className="input"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}

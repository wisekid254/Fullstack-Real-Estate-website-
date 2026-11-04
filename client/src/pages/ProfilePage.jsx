import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import userService from "../services/userService";
import inquiryService from "../services/inquiryService";
import PropertyCard from "../components/property/PropertyCard";
import AgentProfileEditor from "../components/profile/AgentProfileEditor";

import useAuth from "../hooks/useAuth";
import { fetchMe } from "../store/authSlice";
import { formatDate } from "../utils/format";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useAuth();

  const isAgentOrAdmin = user?.role === "agent" || user?.role === "admin";

  const TABS = [
    { key: "profile", label: "Profile" },
    { key: "saved", label: "Saved" },
    { key: "inquiries", label: "Inquiries" },
    { key: "security", label: "Security" },
    ...(isAgentOrAdmin ? [{ key: "agent", label: "Agent Profile" }] : []),
  ];

  const [activeTab, setActiveTab] = useState("profile");

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

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "saved") {
      userService
        .getSavedListings()
        .then((d) => {
          setSaved(d?.listings || d?.data?.listings || []);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load saved properties");
        });
    }

    if (activeTab === "inquiries") {
      inquiryService
        .getMine()
        .then((d) => {
          setInquiries(d?.inquiries || d?.data?.inquiries || []);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load inquiries");
        });
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
      console.error(err);

      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!pwForm.currentPassword) {
      toast.error("Enter your current password");
      return;
    }

    if (!pwForm.newPassword) {
      toast.error("Enter a new password");
      return;
    }

    if (pwForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

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

      setPwForm({
        currentPassword: "",
        newPassword: "",
        confirm: "",
      });
    } catch (err) {
      console.error(err);

      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
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
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
              activeTab === tab.key
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-surface-500 hover:text-surface-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 md:grid-cols-2"
        >
          <div className="card">
            <h2 className="text-xl font-semibold text-surface-900 mb-2">
              Personal information
            </h2>

            <p className="text-sm text-surface-500 mb-6">
              Update your account information.
            </p>

            <form onSubmit={handleProfileSave} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-surface-700 mb-2"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      name: e.target.value,
                    })
                  }
                  className="input"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-surface-700 mb-2"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  className="input bg-surface-100"
                  disabled
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-surface-700 mb-2"
                >
                  Phone number
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      phone: e.target.value,
                    })
                  }
                  className="input"
                  placeholder="Enter your phone number"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Updating..." : "Update profile"}
              </button>
            </form>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-surface-900 mb-5">
              Account information
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-surface-400">
                  Account type
                </p>

                <p className="mt-1 text-surface-900 capitalize">
                  {user?.role || "user"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-surface-400">
                  Email
                </p>

                <p className="mt-1 text-surface-900 break-all">
                  {user?.email || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-surface-400">
                  Phone
                </p>

                <p className="mt-1 text-surface-900">
                  {user?.phone || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-surface-400">
                  Member since
                </p>

                <p className="mt-1 text-surface-900">
                  {user?.createdAt
                    ? formatDate(user.createdAt)
                    : "Not available"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Saved Properties Tab */}
      {activeTab === "saved" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-surface-900">
              Saved properties
            </h2>

            <p className="text-surface-500 mt-1">Properties you have saved.</p>
          </div>

          {saved.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">🏠</div>

              <h3 className="text-lg font-semibold text-surface-900">
                No saved properties
              </h3>

              <p className="text-surface-500 mt-2 mb-5">
                You have not saved any properties yet.
              </p>

              <Link to="/properties" className="btn-primary inline-block">
                Browse properties
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {saved.map((property) => (
                <PropertyCard
                  key={property._id || property.id}
                  listing={property}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Inquiries Tab */}
      {activeTab === "inquiries" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-surface-900">
              My inquiries
            </h2>

            <p className="text-surface-500 mt-1">
              View your property inquiries.
            </p>
          </div>

          {inquiries.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">💬</div>

              <h3 className="text-lg font-semibold text-surface-900">
                No inquiries yet
              </h3>

              <p className="text-surface-500 mt-2 mb-5">
                You have not sent any property inquiries yet.
              </p>

              <Link to="/properties" className="btn-primary inline-block">
                Explore properties
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inquiry) => (
                <div key={inquiry._id || inquiry.id} className="card">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-surface-900">
                        {inquiry.property?.title ||
                          inquiry.subject ||
                          "Property inquiry"}
                      </h3>

                      {inquiry.property?.location && (
                        <p className="text-sm text-surface-500 mt-1">
                          {inquiry.property.location}
                        </p>
                      )}
                    </div>

                    {inquiry.status && (
                      <span className="badge bg-surface-100 text-surface-700 capitalize">
                        {inquiry.status}
                      </span>
                    )}
                  </div>

                  {inquiry.message && (
                    <p className="mt-4 text-sm text-surface-600">
                      {inquiry.message}
                    </p>
                  )}

                  {inquiry.createdAt && (
                    <p className="mt-4 text-xs text-surface-400">
                      Sent {formatDate(inquiry.createdAt)}
                    </p>
                  )}

                  {inquiry.property?._id && (
                    <Link
                      to={`/properties/${inquiry.property._id}`}
                      className="inline-block mt-4 text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      View property →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          <div className="card">
            <h2 className="text-xl font-semibold text-surface-900 mb-2">
              Security
            </h2>

            <p className="text-sm text-surface-500 mb-6">
              Change your account password.
            </p>

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-surface-700 mb-2"
                >
                  Current password
                </label>

                <input
                  id="currentPassword"
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={(e) =>
                    setPwForm({
                      ...pwForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-surface-700 mb-2"
                >
                  New password
                </label>

                <input
                  id="newPassword"
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(e) =>
                    setPwForm({
                      ...pwForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="confirm"
                  className="block text-sm font-medium text-surface-700 mb-2"
                >
                  Confirm new password
                </label>

                <input
                  id="confirm"
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) =>
                    setPwForm({
                      ...pwForm,
                      confirm: e.target.value,
                    })
                  }
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {/* Agent Profile Tab */}
      {activeTab === "agent" && isAgentOrAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AgentProfileEditor user={user} />
        </motion.div>
      )}
    </div>
  );
}

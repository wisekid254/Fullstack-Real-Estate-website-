import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import adminService from "../services/adminService";
import { formatDate, formatPriceWithType } from "../utils/format";
import useAuth from "../hooks/useAuth";

const TABS = ["Overview", "Listings", "Users", "Inquiries"];

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // ── Fetch data per tab ──────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "Overview") {
        const d = await adminService.getStats();
        setStats(d.stats);
      }
      if (activeTab === "Listings") {
        const d = await adminService.getAllListings({ limit: 20 });
        setListings(d.listings);
      }
      if (activeTab === "Users") {
        const d = await adminService.getAllUsers({ limit: 20 });
        setUsers(d.users);
      }
      if (activeTab === "Inquiries") {
        const d = await adminService.getAllInquiries({ limit: 20 });
        setInquiries(d.inquiries);
      }
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Listing actions ─────────────────────────────────────
  const toggleFeatured = async (listing) => {
    try {
      await adminService.updateListing(listing._id, {
        featured: !listing.featured,
      });
      toast.success(
        listing.featured ? "Removed from featured" : "Marked as featured",
      );
      fetchData();
    } catch {
      toast.error("Failed to update listing");
    }
  };

  const toggleStatus = async (listing) => {
    const newStatus = listing.status === "active" ? "inactive" : "active";
    try {
      await adminService.updateListing(listing._id, { status: newStatus });
      toast.success(`Listing marked as ${newStatus}`);
      fetchData();
    } catch {
      toast.error("Failed to update listing");
    }
  };

  const deleteListing = async (id) => {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    try {
      await adminService.deleteListing(id);
      toast.success("Listing deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete listing");
    }
  };

  // ── User actions ────────────────────────────────────────
  const changeRole = async (userId, currentRole) => {
    const roles = ["user", "agent", "admin"];
    const next = roles[(roles.indexOf(currentRole) + 1) % roles.length];
    if (!window.confirm(`Change role to "${next}"?`)) return;
    try {
      await adminService.updateUserRole(userId, next);
      toast.success(`Role changed to ${next}`);
      fetchData();
    } catch {
      toast.error("Failed to update role");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await adminService.deleteUser(id);
      toast.success("User deleted");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  // ── Inquiry actions ─────────────────────────────────────
  const markRead = async (id) => {
    try {
      await adminService.markInquiryRead(id);
      toast.success("Marked as read");
      fetchData();
    } catch {
      toast.error("Failed to update inquiry");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            Admin dashboard
          </h1>
          <p className="text-surface-500 text-sm mt-0.5">
            Signed in as{" "}
            <span className="font-medium text-surface-700">{user?.name}</span>
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center">
          {getInitials(user?.name)}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-200 mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-surface-500 hover:text-surface-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      )}

      {/* ── Overview tab ──────────────────────────────────── */}
      {!loading && activeTab === "Overview" && stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total listings",
                value: stats.totalListings,
                color: "bg-brand-50 text-brand-700",
              },
              {
                label: "Total users",
                value: stats.totalUsers,
                color: "bg-green-50 text-green-700",
              },
              {
                label: "Inquiries",
                value: stats.totalInquiries,
                color: "bg-amber-50 text-amber-700",
              },
              {
                label: "Featured",
                value: stats.featuredListings,
                color: "bg-purple-50 text-purple-700",
              },
            ].map((s) => (
              <div key={s.label} className="card p-5">
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${s.color}`}
                >
                  <span className="text-lg font-bold">{s.value}</span>
                </div>
                <p className="text-2xl font-bold text-surface-900">{s.value}</p>
                <p className="text-sm text-surface-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Breakdown tables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="font-semibold text-surface-900 mb-4">
                Listings by type
              </h3>
              <div className="space-y-3">
                {stats.listingsByType.map((t) => (
                  <div
                    key={t._id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-surface-700 capitalize">
                      {t._id}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-surface-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{
                            width: `${(t.count / stats.totalListings) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-surface-900 w-4">
                        {t.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-surface-900 mb-4">
                Listings by category
              </h3>
              <div className="space-y-3">
                {stats.listingsByCategory.map((c) => (
                  <div
                    key={c._id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-surface-700 capitalize">
                      {c._id}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-surface-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${(c.count / stats.totalListings) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-surface-900 w-4">
                        {c.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Listings tab ──────────────────────────────────── */}
      {!loading && activeTab === "Listings" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    {[
                      "Property",
                      "Type",
                      "Price",
                      "Status",
                      "Featured",
                      "Agent",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {listings.map((l) => (
                    <tr
                      key={l._id}
                      className="hover:bg-surface-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-100 flex-shrink-0">
                            {l.images?.[0]?.url && (
                              <img
                                src={l.images[0].url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-surface-900 line-clamp-1 max-w-48">
                              {l.title}
                            </p>
                            <p className="text-xs text-surface-400">
                              {l.location?.city}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`badge ${l.type === "rent" ? "badge-green" : "badge-blue"}`}
                        >
                          {l.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-surface-700 font-medium">
                        {formatPriceWithType(l.price, l.type)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleStatus(l)}
                          className={`badge cursor-pointer hover:opacity-80 transition-opacity ${
                            l.status === "active"
                              ? "badge-green"
                              : "bg-surface-100 text-surface-600"
                          }`}
                        >
                          {l.status}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleFeatured(l)}
                          className={`badge cursor-pointer hover:opacity-80 transition-opacity ${
                            l.featured
                              ? "bg-amber-50 text-amber-800"
                              : "bg-surface-100 text-surface-500"
                          }`}
                        >
                          {l.featured ? "Yes" : "No"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-surface-600 text-xs">
                        {l.agent?.name}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteListing(l._id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Users tab ─────────────────────────────────────── */}
      {!loading && activeTab === "Users" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    {["User", "Email", "Role", "Joined", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-surface-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold flex items-center justify-center">
                            {getInitials(u.name)}
                          </div>
                          <span className="font-medium text-surface-900">
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-surface-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => changeRole(u._id, u.role)}
                          className={`badge cursor-pointer hover:opacity-80 transition-opacity capitalize ${
                            u.role === "admin"
                              ? "bg-purple-50 text-purple-800"
                              : u.role === "agent"
                                ? "badge-blue"
                                : "bg-surface-100 text-surface-700"
                          }`}
                        >
                          {u.role}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-surface-500 text-xs">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {u.role !== "admin" && (
                          <button
                            onClick={() => deleteUser(u._id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Inquiries tab ─────────────────────────────────── */}
      {!loading && activeTab === "Inquiries" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {inquiries.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-surface-400">No inquiries yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inq) => (
                <div
                  key={inq._id}
                  className={`card p-5 ${!inq.read ? "border-brand-200" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-surface-900 text-sm">
                          {inq.name}
                        </span>
                        <span className="text-surface-400 text-xs">·</span>
                        <span className="text-surface-500 text-xs">
                          {inq.email}
                        </span>
                        {inq.phone && (
                          <>
                            <span className="text-surface-400 text-xs">·</span>
                            <span className="text-surface-500 text-xs">
                              {inq.phone}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-surface-400 mb-2">
                        Re:{" "}
                        <span className="text-brand-500">
                          {inq.listing?.title}
                        </span>
                        {" · "}
                        {formatDate(inq.createdAt)}
                      </p>
                      <p className="text-sm text-surface-700">{inq.message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span
                        className={`badge ${inq.read ? "badge-green" : "badge-blue"}`}
                      >
                        {inq.read ? "Read" : "New"}
                      </span>
                      {!inq.read && (
                        <button
                          onClick={() => markRead(inq._id)}
                          className="text-xs text-brand-500 hover:text-brand-700 font-medium transition-colors"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

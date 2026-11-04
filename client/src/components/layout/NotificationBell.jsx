import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import notificationService from "../../services/notificationService";
import useAuth from "../../hooks/useAuth";

const TYPE_ICONS = {
  inquiry_received: { icon: "💬", bg: "bg-blue-50", text: "text-blue-600" },
  inquiry_reply: { icon: "↩️", bg: "bg-blue-50", text: "text-blue-600" },
  listing_approved: { icon: "✅", bg: "bg-green-50", text: "text-green-600" },
  listing_featured: { icon: "⭐", bg: "bg-amber-50", text: "text-amber-600" },
  review_received: { icon: "⭐", bg: "bg-amber-50", text: "text-amber-600" },
  payment_success: { icon: "💳", bg: "bg-green-50", text: "text-green-600" },
  payment_failed: { icon: "❌", bg: "bg-red-50", text: "text-red-600" },
  new_message: { icon: "✉️", bg: "bg-purple-50", text: "text-purple-600" },
  system: { icon: "🔔", bg: "bg-surface-50", text: "text-surface-600" },
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
  if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
  return Math.floor(seconds / 86400) + "d ago";
};

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data.notifications);
      setUnread(data.unread);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = () => {
    setOpen((o) => !o);
    if (!open) fetchNotifications();
  };

  const handleRead = async (notification) => {
    if (!notification.read) {
      await notificationService.markRead(notification._id);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, read: true } : n,
        ),
      );
      setUnread((u) => Math.max(0, u - 1));
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    await notificationService.delete(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-surface-600 hover:bg-surface-100 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-surface-200 shadow-modal overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
              <h3 className="font-semibold text-surface-900">
                Notifications{" "}
                {unread > 0 && (
                  <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                    {unread} new
                  </span>
                )}
              </h3>
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-brand-500 hover:text-brand-700 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <svg
                    className="w-10 h-10 text-surface-200 mx-auto mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <p className="text-surface-400 text-sm">
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  const typeConfig = TYPE_ICONS[n.type] || TYPE_ICONS.system;
                  return (
                    <div
                      key={n._id}
                      onClick={() => handleRead(n)}
                      className={
                        "flex gap-3 px-4 py-3 border-b border-surface-50 hover:bg-surface-50 transition-colors cursor-pointer group " +
                        (!n.read ? "bg-blue-50/30" : "")
                      }
                    >
                      {/* Icon */}
                      <div
                        className={
                          "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base " +
                          typeConfig.bg
                        }
                      >
                        {typeConfig.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={
                              "text-sm font-medium leading-tight " +
                              (n.read ? "text-surface-700" : "text-surface-900")
                            }
                          >
                            {n.title}
                          </p>
                          <button
                            onClick={(e) => handleDelete(e, n._id)}
                            className="opacity-0 group-hover:opacity-100 text-surface-300 hover:text-red-400 transition-all flex-shrink-0"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-xs text-surface-400 mt-1">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>

                      {!n.read && (
                        <div className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-surface-100 flex items-center justify-between">
                <button
                  onClick={async () => {
                    await notificationService.clearAll();
                    setNotifications((prev) => prev.filter((n) => !n.read));
                  }}
                  className="text-xs text-surface-400 hover:text-surface-600 transition-colors"
                >
                  Clear read
                </button>
                <span className="text-xs text-surface-400">
                  {notifications.length} total
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

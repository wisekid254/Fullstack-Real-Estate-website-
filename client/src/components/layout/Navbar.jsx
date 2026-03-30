import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";

const NAV_LINKS = [
  { label: "Buy", to: "/listings?type=sale" },
  { label: "Rent", to: "/listings?type=rent" },
  { label: "Agents", to: "/agents" },
];

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-semibold text-brand-500 tracking-tight hover:text-brand-600 transition-colors"
          >
            nestHaven
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-50 text-brand-600"
                      : "text-surface-600 hover:text-surface-900 hover:bg-surface-100"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/listings/create"
                  className="btn-secondary text-sm px-4 py-2"
                >
                  + Post property
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((o) => !o)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-surface-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold flex items-center justify-center">
                      {getInitials(user?.name)}
                    </div>
                    <span className="text-sm text-surface-700 font-medium">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <svg
                      className={`w-4 h-4 text-surface-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-surface-200 shadow-modal overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-surface-100">
                          <p className="text-sm font-medium text-surface-900">
                            {user?.name}
                          </p>
                          <p className="text-xs text-surface-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <div className="p-1.5">
                          <DropdownItem
                            to="/profile"
                            onClick={() => setDropdownOpen(false)}
                            label="My profile"
                          />
                          <DropdownItem
                            to="/saved"
                            onClick={() => setDropdownOpen(false)}
                            label="Saved properties"
                          />
                          <DropdownItem
                            to="/listings/create"
                            onClick={() => setDropdownOpen(false)}
                            label="Post a property"
                          />
                          {isAdmin && (
                            <DropdownItem
                              to="/admin"
                              onClick={() => setDropdownOpen(false)}
                              label="Admin dashboard"
                            />
                          )}
                          <hr className="my-1 border-surface-100" />
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary px-4 py-2 text-sm">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary  px-4 py-2 text-sm">
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg text-surface-600 hover:bg-surface-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-surface-200 bg-white overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm text-surface-700 hover:bg-surface-100 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-surface-200 my-2" />
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-800 text-sm font-semibold flex items-center justify-center">
                      {getInitials(user?.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-900">
                        {user?.name}
                      </p>
                      <p className="text-xs text-surface-500">{user?.email}</p>
                    </div>
                  </div>
                  <hr className="border-surface-200 my-1" />
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm text-surface-700 hover:bg-surface-100 transition-colors"
                  >
                    My profile
                  </Link>
                  <Link
                    to="/saved"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm text-surface-700 hover:bg-surface-100 transition-colors"
                  >
                    Saved properties
                  </Link>
                  <Link
                    to="/listings/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm text-surface-700 hover:bg-surface-100 transition-colors"
                  >
                    Post a property
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2.5 rounded-lg text-sm text-surface-700 hover:bg-surface-100 transition-colors"
                    >
                      Admin dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-1 pb-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-secondary w-full text-center py-2.5"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary  w-full text-center py-2.5"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function DropdownItem({ to, onClick, label }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-3 py-2 text-sm text-surface-700 hover:bg-surface-100 rounded-lg transition-colors"
    >
      {label}
    </Link>
  );
}

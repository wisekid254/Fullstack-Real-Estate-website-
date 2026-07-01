import { useDispatch, useSelector } from "react-redux";
import { logout, clearError } from "../store/authSlice";

export default function useAuth() {
  const dispatch = useDispatch();
  const {
    user,
    token,
    loading,
    error,
    requiresOTP,
    requiresVerification,
    pendingEmail,
  } = useSelector((s) => s.auth);

  const isAuthenticated = !!token && !!user;
  const isAdmin = isAuthenticated && user?.role === "admin";
  const isAgent = isAuthenticated && user?.role === "agent";
  const canPostProperty =
    isAuthenticated && (user?.role === "admin" || user?.role === "agent");

  return {
    user,
    token,
    loading,
    error,
    requiresOTP,
    requiresVerification,
    pendingEmail,
    isAuthenticated,
    isAdmin,
    isAgent,
    canPostProperty,
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
  };
}

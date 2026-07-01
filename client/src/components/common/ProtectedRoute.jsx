import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function ProtectedRoute({
  requireAdmin = false,
  requireAgent = false,
}) {
  const { isAuthenticated, isAdmin, canPostProperty } = useAuth();

  // Not logged in — redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only routes
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Agent/admin only routes (post property)
  if (requireAgent && !canPostProperty) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

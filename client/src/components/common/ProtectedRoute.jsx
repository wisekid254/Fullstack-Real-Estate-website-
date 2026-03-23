import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export default function ProtectedRoute({ requireAdmin = false }) {
  const { isAuthenticated, isAdmin } = useAuth()
  if (!isAuthenticated)         return <Navigate to="/login" replace />
  if (requireAdmin && !isAdmin) return <Navigate to="/"      replace />
  return <Outlet />
}
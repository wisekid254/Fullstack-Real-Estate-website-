import { useSelector, useDispatch } from 'react-redux'
import { useNavigate }              from 'react-router-dom'
import { logout, clearError }       from '../store/authSlice'

export default function useAuth() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, token, loading, error } = useSelector((s) => s.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    isAdmin:         user?.role === 'admin',
    isAgent:         user?.role === 'agent',
    logout:          handleLogout,
    clearError:      () => dispatch(clearError()),
  }
}
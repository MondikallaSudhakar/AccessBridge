import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getRoleLandingPath } from '../../data/userTypes'

export function RoleRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="min-h-screen bg-gray-50" />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleLandingPath(user.role)} replace />
  }

  return children
}

export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen bg-gray-50" />
  }

  if (user) {
    return <Navigate to={getRoleLandingPath(user.role)} replace />
  }

  return children
}
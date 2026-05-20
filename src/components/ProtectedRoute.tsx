import { Navigate } from "react-router-dom"
import { useAppSelector } from "@/store/hooks"
import type { AuthUserRole } from "@/store/slices/authSlice"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: AuthUserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case "admin":
        return <Navigate to="/" replace />
      case "encargado":
        return <Navigate to="/encargado" replace />
      case "general":
        return <Navigate to="/general" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }

  return <>{children}</>
}
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { Provider } from "react-redux"
import { store } from "./store"
import { useAppTheme } from "./hooks/useAppTheme"
import { Login } from "@/components/Login"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import DashboardPage from "@/pages/DashboardPage"
import EquiposPage from "@/pages/EquiposPage"
import MantenimientosPage from "@/pages/MantenimientosPage"
import GruposDeTrabajoPage from "@/pages/GruposDeTrabajoPage"
import GrupoDetallePage from "@/pages/GrupoDetallePage"
import GestionEPPSPage from "@/pages/GestionEPPSPage"
import InventariosPage from "@/pages/InventariosPage"
import CalendarioPage from "@/pages/CalendarioPage"
import ReservasPage from "@/pages/ReservasPage"
import ReservasEPPsPage from "@/pages/ReservasEPPsPage"
import ReportesTareasNocturnasPage from "@/pages/ReportesTareasNocturnasPage"
import NuevosRegistrosPage from "@/pages/NuevosRegistrosPage"
import { useAppSelector } from "./store/hooks"

function ThemeInitializer() {
  useAppTheme()
  return null
}

function AuthHandler() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== "/login") {
      navigate("/login", { replace: true })
    } else if (isAuthenticated && user && location.pathname === "/login") {
      switch (user.role) {
        case "admin":
          navigate("/", { replace: true })
          break
        case "encargado":
          navigate("/encargado/calendario", { replace: true })
          break
        case "general":
          navigate("/general/calendario", { replace: true })
          break
      }
    }
  }, [isAuthenticated, user, navigate, location.pathname])

  return null
}

function AppRoutes() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const role = user?.role || "general"

  const getBasePath = () => {
    switch (role) {
      case "admin": return ""
      case "encargado": return "/encargado"
      case "general": return "/general"
      default: return ""
    }
  }

  const basePath = getBasePath()

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to={basePath || "/"} replace />} />
      
      <Route element={<DashboardLayout />}>
        <Route index element={<Navigate to={basePath + (role === "admin" ? "/dashboard" : "/calendario")} replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {(role === "admin" || role === "encargado" || role === "general") && (
          <>
            <Route path="calendario" element={<CalendarioPage />} />
            <Route path="grupos-de-trabajo" element={<GruposDeTrabajoPage />} />
            <Route path="grupos-de-trabajo/:teamId" element={<GrupoDetallePage />} />
            <Route path="inventarios-de-grupos" element={<InventariosPage />} />
            <Route path="gestion-epps-trabajadores" element={<GestionEPPSPage />} />
          </>
        )}
        
        {(role === "admin" || role === "encargado") && (
          <>
            <Route path="reservas-de-insumos" element={<ReservasPage />} />
          </>
        )}

        {(role === "admin" || role === "encargado") && (
          <>
            <Route path="reportes-tareas-nocturnas" element={<ReportesTareasNocturnasPage />} />
          </>
        )}

        {(role === "admin" || role === "encargado" || role === "general") && (
          <>
            <Route path="reservas-de-epps" element={<ReservasEPPsPage />} />
          </>
        )}

        {role === "admin" && (
          <>
            <Route path="nuevos-registros" element={<NuevosRegistrosPage />} />
            <Route path="equipos" element={<EquiposPage />} />
            <Route path="mantenimientos" element={<MantenimientosPage />} />
          </>
        )}
      </Route>

      <Route path="*" element={<Navigate to={basePath + "/calendario"} replace />} />
    </Routes>
  )
}

function AppContent() {
  return (
    <BrowserRouter>
      <AuthHandler />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/encargado/*" element={<AppRoutes />} />
        <Route path="/general/*" element={<AppRoutes />} />
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <Provider store={store}>
      <ThemeInitializer />
      <AppContent />
    </Provider>
  )
}

export default App
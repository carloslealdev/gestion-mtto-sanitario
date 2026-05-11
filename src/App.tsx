import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@/hooks/useTheme"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import DashboardPage from "@/pages/DashboardPage"
import EquiposPage from "@/pages/EquiposPage"
import MantenimientosPage from "@/pages/MantenimientosPage"
import GruposDeTrabajoPage from "@/pages/GruposDeTrabajoPage"
import GrupoDetallePage from "@/pages/GrupoDetallePage"
import GestionEPPSPage from "@/pages/GestionEPPSPage"
import InventariosPage from "@/pages/InventariosPage"
import CalendarioPage from "@/pages/CalendarioPage"

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="equipos" element={<EquiposPage />} />
            <Route path="mantenimientos" element={<MantenimientosPage />} />
            <Route path="calendario" element={<CalendarioPage />} />
            <Route path="grupos-de-trabajo" element={<GruposDeTrabajoPage />} />
            <Route path="grupos-de-trabajo/:teamId" element={<GrupoDetallePage />} />
            <Route path="gestion-epps-trabajadores" element={<GestionEPPSPage />} />
            <Route path="inventarios-de-grupos" element={<InventariosPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
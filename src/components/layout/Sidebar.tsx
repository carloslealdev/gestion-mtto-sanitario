import { NavLink, useLocation } from "react-router-dom"
import {
  Users,
  ClipboardList,
  Settings,
  Wrench,
  Archive,
  Calendar,
  PackagePlus,
  Shirt,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAppSelector } from "@/store/hooks"

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  allowedRoles?: ("admin" | "encargado" | "general")[]
}

const allNavItems: NavItem[] = [
  { to: "/calendario", label: "Calendario", icon: Calendar, allowedRoles: ["admin", "encargado", "general"] },
  { to: "/grupos-de-trabajo", label: "Grupos de Trabajo", icon: Users, allowedRoles: ["admin", "encargado", "general"] },
  { to: "/inventarios-de-grupos", label: "Inventarios de Grupos", icon: Archive, allowedRoles: ["admin", "encargado", "general"] },
  { to: "/gestion-epps-trabajadores", label: "Gestión EPPS Trabajadores", icon: Wrench, allowedRoles: ["admin", "encargado", "general"] },
  { to: "/mantenimientos", label: "Mantenimientos", icon: ClipboardList, allowedRoles: ["admin"] },
  { to: "/reservas-de-insumos", label: "Reservas para insumos", icon: PackagePlus, allowedRoles: ["admin", "encargado"] },
  { to: "/reservas-de-epps", label: "Reservas para EPPs", icon: Shirt, allowedRoles: ["admin", "encargado", "general"] },
]

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAppSelector((state) => state.auth.user)
  const role = user?.role || "general"
  const location = useLocation()

  const getBasePath = () => {
    switch (role) {
      case "admin":
        return ""
      case "encargado":
        return "/encargado"
      case "general":
        return "/general"
      default:
        return ""
    }
  }

  const basePath = getBasePath()

  const filteredNavItems = allNavItems.filter((item) => {
    if (!item.allowedRoles) return true
    return item.allowedRoles.includes(role as "admin" | "encargado" | "general")
  })

  const isActive = (path: string) => {
    const fullPath = basePath + path
    if (path === "/" && (location.pathname === basePath || location.pathname === basePath + "/")) {
      return true
    }
    return location.pathname === fullPath || location.pathname.startsWith(fullPath + "/")
  }

  return (
    <nav className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Gestión MTTO</h1>
        <p className="text-sm text-muted-foreground">Sanitario</p>
      </div>
      <div className="flex-1 py-4">
        <div className="space-y-1 px-2">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={basePath + item.to}
              onClick={onNavigate}
              className={({ isActive: linkActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  linkActive || isActive(item.to)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="border-t p-2">
        <NavLink
          to={basePath + "/configuracion"}
          onClick={onNavigate}
          className={({ isActive: linkActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              linkActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )
          }
        >
          <Settings className="h-5 w-5" />
          Configuración
        </NavLink>
      </div>
    </nav>
  )
}

export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <aside className="hidden md:flex w-64 flex-col border-r bg-card h-screen sticky top-0">
        <NavContent />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <NavContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
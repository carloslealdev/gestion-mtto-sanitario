import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"

const equipos = [
  { id: 1, nombre: "Sistema HVAC-001", tipo: "HVAC", ubicacion: "Edificio A - Piso 1", estado: "operativo", proximoMtto: "2024-02-15" },
  { id: 2, nombre: "Bomba de agua #3", tipo: "Bombeo", ubicacion: "Sótano - Cuarto técnico", estado: "operativo", proximoMtto: "2024-02-10" },
  { id: 3, nombre: "Compresor #2", tipo: "Compresión", ubicacion: "Edificio B - Planta baja", estado: "mantenimiento", proximoMtto: "2024-02-08" },
  { id: 4, nombre: "Generador principal", tipo: "Generación", ubicacion: "Exterior - Área técnica", estado: "operativo", proximoMtto: "2024-03-01" },
  { id: 5, nombre: "Sistema de refrigeración", tipo: "Refrigeración", ubicacion: "Edificio A - Piso 2", estado: "alerta", proximoMtto: "2024-02-05" },
  { id: 6, nombre: "Bomba de respaldo", tipo: "Bombeo", ubicacion: "Sótano - Cuarto técnico", estado: "operativo", proximoMtto: "2024-02-20" },
]

const estadoColors: Record<string, string> = {
  operativo: "bg-green-500",
  mantenimiento: "bg-yellow-500",
  alerta: "bg-red-500",
  inactivo: "bg-gray-500",
}

const estadoLabels: Record<string, string> = {
  operativo: "Operativo",
  mantenimiento: "En mantenimiento",
  alerta: "Alerta",
  inactivo: "Inactivo",
}

export default function EquiposPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipos</h1>
          <p className="text-muted-foreground">Gestión y mantenimiento de equipos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Equipo
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar equipos..."
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 pl-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {equipos.map((equipo) => (
          <Card key={equipo.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">{equipo.nombre}</CardTitle>
              <div className={`h-3 w-3 rounded-full ${estadoColors[equipo.estado]}`} />
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">{equipo.tipo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ubicación:</span>
                  <span className="font-medium">{equipo.ubicacion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Próximo MTTO:</span>
                  <span className="font-medium">{equipo.proximoMtto}</span>
                </div>
                <div className="pt-2">
                  <Badge variant="outline" className="text-xs">
                    {estadoLabels[equipo.estado]}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

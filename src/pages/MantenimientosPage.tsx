import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"

const mantenimientos = [
  { id: 1, equipo: "Sistema HVAC-001", tipo: "Preventivo", fecha: "2024-02-15", responsable: "Juan Pérez", estado: "pendiente", prioridad: "media" },
  { id: 2, equipo: "Bomba de agua #3", tipo: "Correctivo", fecha: "2024-02-10", responsable: "María García", estado: "en_progreso", prioridad: "alta" },
  { id: 3, equipo: "Compresor #2", tipo: "Preventivo", fecha: "2024-02-08", responsable: "Carlos López", estado: "completado", prioridad: "baja" },
  { id: 4, equipo: "Generador principal", tipo: "Inspección", fecha: "2024-03-01", responsable: "Juan Pérez", estado: "pendiente", prioridad: "media" },
  { id: 5, equipo: "Sistema de refrigeración", tipo: "Correctivo", fecha: "2024-02-05", responsable: "Ana Martínez", estado: "pendiente", prioridad: "alta" },
  { id: 6, equipo: "Bomba de respaldo", tipo: "Preventivo", fecha: "2024-02-20", responsable: "Carlos López", estado: "en_progreso", prioridad: "baja" },
]

const estadoLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendiente: { label: "Pendiente", variant: "outline" },
  en_progreso: { label: "En progreso", variant: "secondary" },
  completado: { label: "Completado", variant: "default" },
  cancelado: { label: "Cancelado", variant: "destructive" },
}

const prioridadLabels: Record<string, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
}

export default function MantenimientosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mantenimientos</h1>
          <p className="text-muted-foreground">Órdenes de trabajo y seguimiento</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Mantenimiento
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Mantenimientos</CardTitle>
          <CardDescription>Todas las órdenes de trabajo registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Equipo</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tipo</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fecha</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Responsable</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Prioridad</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {mantenimientos.map((mantenimiento) => (
                  <tr key={mantenimiento.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{mantenimiento.equipo}</td>
                    <td className="p-4 align-middle">{mantenimiento.tipo}</td>
                    <td className="p-4 align-middle">{mantenimiento.fecha}</td>
                    <td className="p-4 align-middle">{mantenimiento.responsable}</td>
                    <td className="p-4 align-middle">
                      <Badge variant={mantenimiento.prioridad === "alta" ? "destructive" : mantenimiento.prioridad === "media" ? "secondary" : "outline"}>
                        {prioridadLabels[mantenimiento.prioridad]}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant={estadoLabels[mantenimiento.estado].variant}>
                        {estadoLabels[mantenimiento.estado].label}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

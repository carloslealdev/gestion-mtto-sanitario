import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench, ClipboardCheck, AlertTriangle, CheckCircle } from "lucide-react"

const stats = [
  { title: "Equipos totales", value: "45", icon: Wrench, color: "text-blue-500" },
  { title: "Mantenimientos pendientes", value: "12", icon: AlertTriangle, color: "text-yellow-500" },
  { title: "Mantenimientos completados", value: "28", icon: CheckCircle, color: "text-green-500" },
  { title: "Órdenes de trabajo", value: "8", icon: ClipboardCheck, color: "text-purple-500" },
]

const recentActivities = [
  { id: 1, action: "Mantenimiento completado", equipment: "Equipo HVAC-001", time: "Hace 2 horas" },
  { id: 2, action: "Nueva orden creada", equipment: "Bomba de agua #3", time: "Hace 4 horas" },
  { id: 3, action: "Alerta de inspección", equipment: "Sistema eléctrico", time: "Hace 6 horas" },
  { id: 4, action: "Mantenimiento programado", equipment: "Compresor #2", time: "Ayer" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del sistema de gestión</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.equipment}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Mantenimientos Próximos</CardTitle>
            <CardDescription>Próximos 7 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.equipment}</p>
                    <p className="text-xs text-muted-foreground">{activity.action}</p>
                  </div>
                  <Badge variant="outline">Programado</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

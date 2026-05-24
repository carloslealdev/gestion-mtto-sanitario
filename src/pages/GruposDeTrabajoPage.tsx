import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppSelector } from "@/store/hooks"
import { useNavigate } from "react-router-dom"

const workTeams = ["G1", "G2", "G3", "TN"] as const

const teamLabels: Record<string, string> = {
  G1: "Grupo 1",
  G2: "Grupo 2",
  G3: "Grupo 3",
  TN: "Turno Normal",
}

export default function GruposDeTrabajoPage() {
  const navigate = useNavigate()
  const workers = useAppSelector((state) => state.workers.workers)
  const user = useAppSelector((state) => state.auth.user)

  const userWorkTeam = workers.find((w) => w.cedula.replace("V-", "") === user?.username)?.workTeam

  const teamsToShow = (user?.role === "encargado" || user?.role === "general") && userWorkTeam
    ? [userWorkTeam]
    : workTeams

  const getWorkersByTeam = (team: string) => {
    return workers.filter((w) => w.workTeam === team)
  }

  const unassignedWorkers = workers.filter((w) => w.workTeam === "Sin asignar")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {user?.role === "encargado" ? `Mi Grupo de Trabajo - ${teamLabels[userWorkTeam || ""]}` : "Grupos de Trabajo"}
        </h1>
        <p className="text-muted-foreground">
          {user?.role === "encargado" ? "Integrantes de tu equipo de trabajo" : "Equipos de trabajo y sus integrantes"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {teamsToShow.map((team) => {
          const teamWorkers = getWorkersByTeam(team)
          return (
            <Card key={team} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  {teamLabels[team] || team}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {teamWorkers.map((worker, index) => (
                    <li key={index} className="text-sm">
                      <span className="font-medium">{worker.firstName} {worker.lastName}</span>
                      {worker.role === "trabajador-encargado" && (
                        <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                          Encargado
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/grupos-de-trabajo/${team}`)}
                >
                  Más info
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {user?.role === "admin" && unassignedWorkers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Trabajadores sin asignar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Nombre</th>
                    <th className="text-left py-3 px-4 font-medium">Apellido</th>
                    <th className="text-left py-3 px-4 font-medium">Cédula</th>
                    <th className="text-left py-3 px-4 font-medium">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {unassignedWorkers.map((w) => (
                    <tr key={w.cedula} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{w.firstName}</td>
                      <td className="py-3 px-4">{w.lastName}</td>
                      <td className="py-3 px-4">{w.cedula}</td>
                      <td className="py-3 px-4">
                        {w.role === "trabajador-encargado" ? "Encargado" : "General"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
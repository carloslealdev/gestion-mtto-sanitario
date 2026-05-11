import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { workers, type Worker } from "@/mock-data/workers"
import { useNavigate } from "react-router-dom"

const workTeams = ["G1", "G2", "G3", "TN"] as const

export default function GruposDeTrabajoPage() {
  const navigate = useNavigate()

  const getWorkersByTeam = (team: string) => {
    return workers.filter((w: Worker) => w.workTeam === team)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Grupos de Trabajo</h1>
        <p className="text-muted-foreground">Equipos de trabajo y sus integrantes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {workTeams.map((team) => {
          const teamWorkers = getWorkersByTeam(team)
          return (
            <Card key={team} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-bold">{team}</CardTitle>
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
    </div>
  )
}
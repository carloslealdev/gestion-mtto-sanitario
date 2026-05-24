import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { updateWorker, type WorkerRole, type WorkTeam } from "@/store/slices/workersSlice"
import { updateUserRoleByCedula } from "@/store/slices/authSlice"
import { updateUserProfile } from "@/services/authService"
import { getWorker, patchWorker } from "@/services/workersService"
import { ArrowLeft, User, Calendar, IdCard } from "lucide-react"

const workTeamLabels: Record<string, string> = {
  G1: "Grupo 1",
  G2: "Grupo 2",
  G3: "Grupo 3",
  TN: "Turno Normal",
}

const teams: WorkTeam[] = ["G1", "G2", "G3", "TN"]

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function getEncargadoCount(workers: { workTeam: string; role: string }[], team: string): number {
  return workers.filter(
    (w) => w.workTeam === team && w.role === "trabajador-encargado"
  ).length
}

function WorkerCard({
  worker,
  onRoleChange,
  onTeamChange,
  showContextMenu,
  getEncargadoCountFn,
}: {
  worker: { cedula: string; firstName: string; lastName: string; role: string; fechaIngreso: string; workTeam: string }
  onRoleChange: (cedula: string, role: WorkerRole) => void
  onTeamChange: (cedula: string, team: WorkTeam) => void
  showContextMenu: boolean
  getEncargadoCountFn: () => number
}) {
  const cardContent = (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {worker.firstName} {worker.lastName}
          </CardTitle>
          {worker.role === "trabajador-encargado" && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
              Encargado
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <IdCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Cédula:</span>
            <span className="font-medium">{worker.cedula}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Ingreso:</span>
            <span className="font-medium">
              {formatDate(worker.fechaIngreso)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Equipo:</span>
            <span className="font-medium">{worker.workTeam}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (!showContextMenu) {
    return cardContent
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {cardContent}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem className="font-semibold">
          Modificar Usuario
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Cambiar Rol</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem
              onClick={() => onRoleChange(worker.cedula, "trabajador-encargado")}
              disabled={
                worker.role === "trabajador-encargado" ||
                getEncargadoCountFn() >= 1
              }
            >
              Trabajador Encargado
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onRoleChange(worker.cedula, "trabajador-general")}
              disabled={worker.role === "trabajador-general"}
            >
              Trabajador General
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Cambiar Grupo</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {teams.map((team) => (
              <ContextMenuItem
                key={team}
                onClick={() => onTeamChange(worker.cedula, team)}
                disabled={worker.workTeam === team}
              >
                {workTeamLabels[team]}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default function GrupoDetallePage() {
  const { teamId } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const workers = useAppSelector((state) => state.workers.workers)
  const user = useAppSelector((state) => state.auth.user)

  const canModifyWorkers = user?.role === "admin"
  const teamWorkers = workers.filter((w) => w.workTeam === teamId)

  const getCurrentEncargadoCount = () => {
    return getEncargadoCount(workers, teamId || "")
  }

  const handleRoleChange = async (workerCedula: string, newRole: WorkerRole) => {
    if (newRole === "trabajador-encargado") {
      const currentEncargado = getCurrentEncargadoCount()
      const worker = workers.find((w) => w.cedula === workerCedula)
      if (currentEncargado >= 1 && worker?.role !== "trabajador-encargado") {
        alert(
          "Ya existe un trabajador-encargado en este grupo. Debe remover al encargado actual primero."
        )
        return
      }
    }
    dispatch(updateWorker({ cedula: workerCedula, role: newRole }))

    const authRole = newRole === "trabajador-encargado" ? "encargado" : "general"

    try {
      const workerDoc = await getWorker(workerCedula)
      if (workerDoc?.uid) {
        await updateUserProfile(workerDoc.uid, { role: authRole })
      }
      await patchWorker(workerCedula, { role: newRole })
    } catch {
      // Firestore persistence fallback — Redux state already updated
    }

    const currentUserCedula = user?.username?.replace("V-", "") || ""
    if (currentUserCedula === workerCedula.replace("V-", "")) {
      dispatch(updateUserRoleByCedula({ cedula: workerCedula, workerRole: newRole }))
    }
  }

  const handleTeamChange = async (workerCedula: string, newTeam: WorkTeam) => {
    const worker = workers.find((w) => w.cedula === workerCedula)

    if (newTeam !== teamId) {
      const targetEncargadoCount = getEncargadoCount(workers, newTeam)
      if (worker?.role === "trabajador-encargado" && targetEncargadoCount >= 1) {
        alert(
          "El grupo destino ya tiene un trabajador-encargado. Debe cambiar el rol a trabajador-general primero."
        )
        return
      }
    }

    const currentUserCedula = user?.username?.replace("V-", "") || ""
    const isCurrentUser = currentUserCedula === workerCedula.replace("V-", "")
    
    dispatch(updateWorker({ cedula: workerCedula, workTeam: newTeam }))

    try {
      await patchWorker(workerCedula, { workTeam: newTeam })
    } catch {
      // Firestore persistence fallback — Redux state already updated
    }

    if (isCurrentUser && newTeam !== teamId) {
      navigate(`/grupos-de-trabajo/${newTeam}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/grupos-de-trabajo")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Grupo {teamId}</h1>
          <p className="text-muted-foreground">
            {workTeamLabels[teamId || ""]} - {teamWorkers.length} trabajadores
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teamWorkers.map((worker) => (
          <WorkerCard
            key={worker.cedula}
            worker={worker}
            onRoleChange={handleRoleChange}
            onTeamChange={handleTeamChange}
            showContextMenu={canModifyWorkers}
            getEncargadoCountFn={getCurrentEncargadoCount}
          />
        ))}
      </div>
    </div>
  )
}
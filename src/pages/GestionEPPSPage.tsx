import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { setSearch, setTeamFilter } from "@/store/slices/eppSlice"
import { Search, Calendar, IdCard, Users, HardHat, Glasses, Footprints, Ear, Shield } from "lucide-react"

const workTeamLabels: Record<string, string> = {
  G1: "Grupo 1",
  G2: "Grupo 2",
  G3: "Grupo 3",
  TN: "Turno Normal",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isExpiringSoon(nextRenewal: string): boolean {
  const daysUntil = Math.ceil(
    (new Date(nextRenewal).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  return daysUntil > 0 && daysUntil <= 30;
}

function isExpired(nextRenewal: string): boolean {
  return new Date(nextRenewal).getTime() < Date.now();
}

function getStatusBadge(nextRenewal: string) {
  if (isExpired(nextRenewal)) {
    return (
      <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded">
        Vencido
      </span>
    );
  }
  if (isExpiringSoon(nextRenewal)) {
    return (
      <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded">
        Por vencer
      </span>
    );
  }
  return (
    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
      Vigente
    </span>
  );
}

const staticEppLabels: Record<string, string> = {
  casco: "Casco",
  lentes: "Lentes",
  botas: "Botas",
  auditivo: "Protector Auditivo",
  fullFace: "Máscara Completa",
};

const staticEppIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  casco: HardHat,
  lentes: Glasses,
  botas: Footprints,
  auditivo: Ear,
  fullFace: Shield,
};

function eppNameToKey(name: string): string {
  return name.toLowerCase().replace(/[\s-]+/g, "_")
}

export default function GestionEPPSPage() {
  const dispatch = useAppDispatch()
  const search = useAppSelector((state) => state.epp.search)
  const teamFilter = useAppSelector((state) => state.epp.teamFilter)
  const workers = useAppSelector((state) => state.workers.workers)
  const user = useAppSelector((state) => state.auth.user)
  const eppTypes = useAppSelector((state) => state.eppTypes.eppTypes)

  const userWorkTeam = workers.find((w) => w.cedula.replace("V-", "") === user?.username)?.workTeam

  const filteredWorkers = workers.filter((worker) => {
    if (user?.role === "general") {
      return worker.cedula.replace("V-", "") === user.username
    }

    if (user?.role === "encargado") {
      return worker.workTeam === userWorkTeam
    }

    const searchLower = search.toLowerCase()
    const matchesSearch =
      worker.cedula.toLowerCase().includes(searchLower) ||
      worker.firstName.toLowerCase().includes(searchLower) ||
      worker.lastName.toLowerCase().includes(searchLower) ||
      worker.workTeam.toLowerCase().includes(searchLower)
    const matchesTeam = teamFilter === "all" || worker.workTeam === teamFilter
    return matchesSearch && matchesTeam
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {user?.role === "general" ? `Mis EPPs - ${workTeamLabels[userWorkTeam || ""]}` : (user?.role === "encargado" ? `EPPs de Mi Grupo - ${workTeamLabels[userWorkTeam || ""]}` : "Gestión de EPPs de Trabajadores")}
        </h1>
        <p className="text-muted-foreground">
          {user?.role === "general" ? "Control de tus equipos de protección personal" : (user?.role === "encargado" ? "Control de equipos de protección de tu grupo" : "Control de equipos de protección personal")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={user?.role === "encargado" ? "Buscar por cédula o nombre..." : "Buscar por cédula, nombre o grupo..."}
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            className="pl-10"
          />
        </div>
        {user?.role !== "encargado" && (
          <select
            value={teamFilter}
            onChange={(e) => dispatch(setTeamFilter(e.target.value))}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">Todos los grupos</option>
            <option value="G1">Grupo 1</option>
            <option value="G2">Grupo 2</option>
            <option value="G3">Grupo 3</option>
            <option value="TN">Turno Normal</option>
          </select>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredWorkers.length} {user?.role === "encargado" ? "de tu grupo" : `de ${workers.length}`} trabajadores
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredWorkers.map((worker, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {worker.firstName} {worker.lastName}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {worker.role === "trabajador-encargado" && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Encargado
                    </span>
                  )}
                  <Badge variant="outline">{worker.workTeam}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
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
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Grupo:</span>
                  <span className="font-medium">
                    {workTeamLabels[worker.workTeam]}
                  </span>
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                  Equipos de Protección Personal
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    (Object.keys(worker.epps) as Array<keyof typeof worker.epps>).filter((k) => !worker.epps[k]?.notOwned)
                  ).map((eppKey) => {
                    const epp = worker.epps[eppKey];
                    const label = staticEppLabels[eppKey]
                      ?? eppTypes.find((et) => et.code === eppKey)?.name
                      ?? eppKey;
                    const Icon = staticEppIcons[eppKey] ?? Shield;
                    return (
                      <div
                        key={eppKey}
                        className={`p-3 rounded-lg border ${
                          isExpired(epp.nextRenewal)
                            ? "border-destructive bg-destructive/10"
                            : isExpiringSoon(epp.nextRenewal)
                            ? "border-yellow-500 bg-yellow-500/10"
                            : "border-muted bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{label}</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Última:</span>
                            <span>{formatDate(epp.lastRenewal)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Próxima:</span>
                            <span>{formatDate(epp.nextRenewal)}</span>
                          </div>
                          <div className="flex justify-end mt-1">
                            {getStatusBadge(epp.nextRenewal)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

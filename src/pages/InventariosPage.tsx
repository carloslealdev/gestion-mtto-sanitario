import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  inventoryLabels,
  getInventoryStatus,
  type GroupInventory,
} from "@/mock-data/inventory"
import { useAppSelector } from "@/store/hooks"
import {
  Package,
  Droplets,
  Hand,
  Bath,
  Scissors,
  Wind,
  Waves,
} from "lucide-react"

const workTeamLabels: Record<string, string> = {
  G1: "Grupo 1",
  G2: "Grupo 2",
  G3: "Grupo 3",
  TN: "Turno Normal",
};

const itemIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  trajes_anti_derrame: Package,
  guantes: Hand,
  esponjas: Bath,
  gerdex: Droplets,
  espatulas: Scissors,
  manguera_aire_comprimido: Wind,
  manguera_de_agua: Waves,
};

function getStatusColor(status: ReturnType<typeof getInventoryStatus>) {
  switch (status) {
    case "optimo":
      return "bg-green-500";
    case "bajo":
      return "bg-yellow-500";
    case "sin_stock":
      return "bg-destructive";
  }
}

function getStatusLabel(status: ReturnType<typeof getInventoryStatus>) {
  switch (status) {
    case "optimo":
      return "Óptimo";
    case "bajo":
      return "Bajo";
    case "sin_stock":
      return "Sin stock";
  }
}

function InventoryItem({
  itemKey,
  quantity,
}: {
  itemKey: string;
  quantity: number;
}) {
  const status = getInventoryStatus(quantity, itemKey);
  const Icon = itemIcons[itemKey];

  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">{inventoryLabels[itemKey]}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-bold">{quantity}</span>
        <span
          className={`text-xs text-white px-2 py-1 rounded ${getStatusColor(status)}`}
        >
          {getStatusLabel(status)}
        </span>
      </div>
    </div>
  );
}

export default function InventariosPage() {
  const validTeams = ["G1", "G2", "G3", "TN"] as const
  const workers = useAppSelector((state) => state.workers.workers)
  const user = useAppSelector((state) => state.auth.user)
  const inventory = useAppSelector((state) => state.inventory.inventory)

  const userWorkTeam = workers.find((w) => w.cedula.replace("V-", "") === user?.username)?.workTeam

  const teamsToShow = (user?.role === "encargado" || user?.role === "general") && userWorkTeam && userWorkTeam !== "Sin asignar"
    ? [userWorkTeam as typeof validTeams[number]]
    : [...validTeams]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {(user?.role === "encargado" || user?.role === "general") ? `Inventario de Mi Grupo - ${workTeamLabels[userWorkTeam || ""]}` : "Inventarios de Grupos de Trabajo"}
        </h1>
        <p className="text-muted-foreground">
          {user?.role === "encargado" ? "Control de insumos de tu grupo" : "Control de insumos por grupo"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {teamsToShow.map((team) => (
          <Card key={team}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{workTeamLabels[team]}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {team}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {inventory[team] ? (
                (Object.keys(inventory[team]) as Array<keyof GroupInventory>).map((itemKey) => (
                  <InventoryItem
                    key={itemKey}
                    itemKey={itemKey}
                    quantity={inventory[team][itemKey].quantity}
                  />
                ))
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No hay datos de inventario disponibles
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

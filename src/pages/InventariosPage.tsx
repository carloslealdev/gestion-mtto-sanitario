import { useEffect, useState } from "react"
import Swal from "sweetalert2"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  inventoryLabels,
  type GroupInventory,
  type InventoryStatus,
} from "@/mock-data/inventory"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import {
  fetchInventory,
  saveGroupInventoryAsync,
  deleteGroupInventoryAsync,
} from "@/store/slices/inventorySlice"
import { fetchSupplies } from "@/store/slices/suppliesSlice"
import {
  Package,
  Droplets,
  Hand,
  Bath,
  Scissors,
  Wind,
  Waves,
  Plus,
  Trash2,
  X,
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

function getInventoryStatus(quantity: number, optimalLevel: number): InventoryStatus {
  if (quantity === 0) return "sin_stock"
  if (optimalLevel > 0 && quantity <= optimalLevel * 0.25) return "bajo"
  return "optimo"
}

function getStatusColor(status: InventoryStatus) {
  switch (status) {
    case "optimo":
      return "bg-green-500";
    case "bajo":
      return "bg-yellow-500";
    case "sin_stock":
      return "bg-destructive";
  }
}

function getStatusLabel(status: InventoryStatus) {
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
  label,
  optimalLevel,
}: {
  itemKey: string;
  quantity: number;
  label: string;
  optimalLevel: number;
}) {
  const status = getInventoryStatus(quantity, optimalLevel);
  const Icon = itemIcons[itemKey] || Package;

  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">{label}</span>
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
  const dispatch = useAppDispatch()
  const validTeams = ["G1", "G2", "G3", "TN"] as const
  const workers = useAppSelector((state) => state.workers.workers)
  const user = useAppSelector((state) => state.auth.user)
  const inventory = useAppSelector((state) => state.inventory.inventory)
  const inventoryLoading = useAppSelector((state) => state.inventory.loading)
  const inventoryError = useAppSelector((state) => state.inventory.error)
  const supplies = useAppSelector((state) => state.supplies.supplies)
  const suppliesLoading = useAppSelector((state) => state.supplies.loading)

  useEffect(() => {
    dispatch(fetchInventory())
    dispatch(fetchSupplies())
  }, [dispatch])

  const userWorkTeam = workers.find((w) => w.cedula.replace("V-", "") === user?.username)?.workTeam
  const isAdmin = user?.role === "admin"

  const teamsToShow = (user?.role === "encargado" || user?.role === "general") && userWorkTeam && userWorkTeam !== "Sin asignar"
    ? [userWorkTeam as typeof validTeams[number]]
    : [...validTeams]

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string>("")
  const [entries, setEntries] = useState<{ supplyId: string; supplyName: string; quantity: number }[]>([])

  const openLoadModal = (team: string) => {
    setSelectedTeam(team)
    setEntries([])
    setModalOpen(true)
  }

  const handleAddEntry = () => {
    setEntries((prev) => [...prev, { supplyId: "", supplyName: "", quantity: 0 }])
  }

  const handleRemoveEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }

  const handleEntryChange = (index: number, field: "supplyId" | "quantity", value: string | number) => {
    setEntries((prev) => {
      const updated = [...prev]
      if (field === "supplyId") {
        const supply = supplies.find((s) => s.id === value)
        updated[index] = { ...updated[index], supplyId: value as string, supplyName: supply?.name || "" }
      } else {
        updated[index] = { ...updated[index], quantity: value as number }
      }
      return updated
    })
  }

  const handleSave = async () => {
    const valid = entries.filter((e) => e.supplyId && e.quantity > 0)
    if (valid.length === 0) return
    const items = valid.map((e) => ({ item: e.supplyId, quantity: e.quantity }))
    try {
      await dispatch(saveGroupInventoryAsync({ groupId: selectedTeam, items })).unwrap()
      Swal.fire({
        icon: "success",
        title: "Inventario guardado",
        text: `${workTeamLabels[selectedTeam]} ha sido actualizado.`,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      })
      setModalOpen(false)
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo guardar el inventario" })
    }
  }

  const handleDelete = async (team: string) => {
    const result = await Swal.fire({
      title: "¿Eliminar inventario?",
      text: `${workTeamLabels[team]} perderá todos los datos de inventario.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    })
    if (!result.isConfirmed) return
    try {
      await dispatch(deleteGroupInventoryAsync(team)).unwrap()
      Swal.fire({
        icon: "success",
        title: "Inventario eliminado",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      })
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar el inventario" })
    }
  }

  const usedSupplyIds = entries.map((e) => e.supplyId)

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

      {inventoryError && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
          Error al cargar inventario: {inventoryError}
        </div>
      )}

      {(inventoryLoading || suppliesLoading) ? (
        <div className="text-center py-8 text-muted-foreground">Cargando datos...</div>
      ) : (
      <div className="grid gap-6 md:grid-cols-2">
        {teamsToShow.map((team) => (
          <Card key={team}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{workTeamLabels[team]}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-normal text-muted-foreground">
                    {team}
                  </span>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => openLoadModal(team)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Cargar inventario inicial
                      </Button>
                      {inventory[team] && (
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(team)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {inventory[team] && Object.keys(inventory[team]).length > 0 ? (
                (Object.keys(inventory[team]) as Array<keyof GroupInventory>).map((itemKey) => {
                  const supply = supplies.find((s) => s.id === itemKey)
                  return (
                    <InventoryItem
                      key={itemKey}
                      itemKey={itemKey}
                      quantity={inventory[team][itemKey].quantity}
                      label={inventoryLabels[itemKey] || supply?.name || itemKey}
                      optimalLevel={supply?.optimalLevel ?? 0}
                    />
                  )
                })
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No hay datos de inventario disponibles
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cargar inventario inicial - {workTeamLabels[selectedTeam]}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div key={index} className="flex items-end gap-2 p-3 bg-muted rounded">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium">Insumo</label>
                  <select
                    value={entry.supplyId}
                    onChange={(e) => handleEntryChange(index, "supplyId", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Seleccionar insumo</option>
                    {supplies
                      .filter((s) => !usedSupplyIds.includes(s.id) || s.id === entry.supplyId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-xs font-medium">Cantidad</label>
                  <Input
                    type="number"
                    min={0}
                    value={entry.quantity || ""}
                    onChange={(e) => handleEntryChange(index, "quantity", Number(e.target.value))}
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveEntry(index)}>
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={handleAddEntry}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar insumo
            </Button>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={entries.filter((e) => e.supplyId && e.quantity > 0).length === 0}
              >
                Guardar cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

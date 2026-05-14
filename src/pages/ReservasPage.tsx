import { useState, useMemo } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { addReservation, updateReservationStatus, setReceivedItems, type ReservationItem } from "@/store/slices/reservationsSlice"
import { inventoryLabels, type GroupInventory } from "@/mock-data/inventory"
import { workers } from "@/mock-data/workers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Trash2, Search, Eye, ChevronDown } from "lucide-react"

type Team = "G1" | "G2" | "G3" | "TN"

const workTeamLabels: Record<Team, string> = {
  G1: "Grupo 1",
  G2: "Grupo 2",
  G3: "Grupo 3",
  TN: "Turno Normal",
}

const statusConfig: Record<string, { color: string; label: string }> = {
  pendiente: { color: "bg-yellow-500", label: "Pendiente" },
  retirada_completa: { color: "bg-green-500", label: "Recibida Completa" },
  retirada_parcial: { color: "bg-blue-500", label: "Recibida Parcial" },
  cancelada: { color: "bg-gray-500", label: "Cancelada" },
}

const itemKeys = Object.keys(inventoryLabels) as Array<keyof GroupInventory>

interface DetailReservationData {
  id: string
  items: ReservationItem[]
  team: Team
  date: string
  status: string
  receivedItems?: ReservationItem[]
}

export default function ReservasPage() {
  const dispatch = useAppDispatch()
  const reservations = useAppSelector((state) => state.reservations.reservations)
  const user = useAppSelector((state) => state.auth.user)
  const [showForm, setShowForm] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team>("G1")
  const [items, setItems] = useState<ReservationItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchDate, setSearchDate] = useState("")
  const [searchStatus, setSearchStatus] = useState("")
  const [detailReservation, setDetailReservation] = useState<DetailReservationData | null>(null)
  const [partialReceiveModal, setPartialReceiveModal] = useState<{ id: string; items: ReservationItem[] } | null>(null)
  const [receivedItems, setReceivedItemsLocal] = useState<ReservationItem[]>([])

  const isAdmin = user?.role === "admin"

  const userWorkTeam = useMemo(() => {
    if (user?.role === "encargado") {
      const worker = workers.find((w) => w.cedula.replace("V-", "") === user.username)
      return worker?.workTeam || null
    }
    return null
  }, [user])

  const filteredReservations = useMemo(() => {
    let filtered = reservations

    if (userWorkTeam) {
      filtered = filtered.filter((res) => res.team === userWorkTeam)
    }

    filtered = filtered.filter((res) => {
      const matchesTeam = searchQuery === "" ||
        res.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workTeamLabels[res.team].toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDate = searchDate === "" || res.createdAt.startsWith(searchDate)
      const matchesStatus = searchStatus === "" || res.status === searchStatus
      return matchesTeam && matchesDate && matchesStatus
    })

    return filtered
  }, [reservations, searchQuery, searchDate, searchStatus, userWorkTeam])

  const handleAddItem = () => {
    setItems([...items, { item: "", quantity: 1 }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: "item" | "quantity", value: string | number) => {
    const newItems = [...items]
    if (field === "quantity") {
      newItems[index] = { ...newItems[index], quantity: Number(value) }
    } else {
      newItems[index] = { ...newItems[index], item: value as string }
    }
    setItems(newItems)
  }

  const handleGenerate = () => {
    const validItems = items.filter((item) => item.item !== "" && item.quantity > 0)
    if (validItems.length === 0) return

    const uniqueItems = validItems.reduce((acc, item) => {
      if (!acc.find((i) => i.item === item.item)) {
        acc.push(item)
      }
      return acc
    }, [] as ReservationItem[])

    dispatch(addReservation({ team: selectedTeam, items: uniqueItems }))
    setItems([])
    setShowForm(false)
  }

  const handleStatusChange = (id: string, status: string) => {
    if (status === "retirada_parcial") {
      const reservation = reservations.find((r) => r.id === id)
      if (reservation) {
        setPartialReceiveModal({ id, items: [...reservation.items] })
        setReceivedItemsLocal([...reservation.items])
      }
    } else {
      dispatch(updateReservationStatus({ id, status }))
    }
  }

  const handleRemoveReceivedItem = (index: number) => {
    setReceivedItemsLocal(receivedItems.filter((_, i) => i !== index))
  }

  const handleReceivedItemQuantityChange = (index: number, quantity: number) => {
    const newItems = [...receivedItems]
    newItems[index] = { ...newItems[index], quantity: Math.max(0, quantity) }
    setReceivedItemsLocal(newItems)
  }

  const handleFinalizePartialReceive = () => {
    if (partialReceiveModal && receivedItems.length >= 0) {
      dispatch(updateReservationStatus({ id: partialReceiveModal.id, status: "retirada_parcial" }))
      dispatch(setReceivedItems({ id: partialReceiveModal.id, receivedItems }))
      setPartialReceiveModal(null)
      setReceivedItemsLocal([])
    }
  }

  const handleOpenDetail = (res: typeof filteredReservations[0]) => {
    setDetailReservation({
      id: res.id,
      items: res.items,
      team: res.team,
      date: res.createdAt,
      status: res.status,
      receivedItems: res.receivedItems,
    })
  }

  const availableItems = itemKeys.filter((key) => !items.some((i) => i.item === key))

  const pageTitle = userWorkTeam
    ? `Reservas de insumos - ${workTeamLabels[userWorkTeam]}`
    : "Reservas de insumos"

  const pageDescription = userWorkTeam
    ? "Reservas destinadas a tu grupo de trabajo"
    : "Gestión de reservas para grupos de trabajo"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
        <p className="text-muted-foreground">{pageDescription}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Reservas registradas</CardTitle>
            <div className="flex flex-wrap gap-2">
              {isAdmin && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por grupo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-48"
                  />
                </div>
              )}
              <Input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full sm:w-40"
              />
              <select
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Todos los estados</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReservations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay reservas registradas
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {isAdmin && <th className="text-left py-3 px-4 font-medium">Grupo</th>}
                    <th className="text-left py-3 px-4 font-medium">Fecha y Hora</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    {userWorkTeam && <th className="text-left py-3 px-4 font-medium">Marcar como</th>}
                    <th className="text-left py-3 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((res) => (
                    <tr key={res.id} className="border-b hover:bg-muted/50">
                      {isAdmin && (
                        <td className="py-3 px-4 font-medium">
                          {workTeamLabels[res.team]} ({res.team})
                        </td>
                      )}
                      <td className="py-3 px-4 text-muted-foreground">{res.createdAt}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs text-white px-2 py-1 rounded ${statusConfig[res.status].color}`}>
                          {statusConfig[res.status].label}
                        </span>
                      </td>
                      {userWorkTeam && (
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild disabled={res.status !== "pendiente"}>
                              <Button variant="outline" size="sm">
                                Marcar como <ChevronDown className="ml-1 h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem onClick={() => handleStatusChange(res.id, "retirada_completa")}>
                                Recibida completa
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(res.id, "retirada_parcial")}>
                                Recibida parcial
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(res.id, "cancelada")}>
                                Cancelada
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(res)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Nueva reserva</CardTitle>
              {!showForm && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generar nueva reserva
                </Button>
              )}
            </div>
          </CardHeader>
          {showForm && (
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-48">
                  <label className="text-sm font-medium mb-1 block">Grupo de trabajo</label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value as Team)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    {Object.entries(workTeamLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Insumos</label>
                {items.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <select
                      value={item.item}
                      onChange={(e) => handleItemChange(index, "item", e.target.value)}
                      className="w-full sm:w-64 h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Seleccionar insumo</option>
                      {itemKeys.filter((key) => !items.some((i, iIndex) => i.item === key && iIndex !== index)).map((key) => (
                        <option key={key} value={key}>{inventoryLabels[key]}</option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      className="w-24"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={handleAddItem} disabled={availableItems.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar insumo
                </Button>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleGenerate} disabled={items.filter((i) => i.item !== "").length === 0}>
                  Generar
                </Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setItems([]) }}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      <Dialog open={detailReservation !== null} onOpenChange={() => setDetailReservation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de Reserva</DialogTitle>
          </DialogHeader>
          {detailReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Grupo de Trabajo:</span>
                  <p className="font-medium">{workTeamLabels[detailReservation.team]} ({detailReservation.team})</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha y Hora:</span>
                  <p className="font-medium">{detailReservation.date}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Estado:</span>
                  <p className="font-medium">
                    <span className={`text-xs text-white px-2 py-1 rounded ${statusConfig[detailReservation.status].color}`}>
                      {statusConfig[detailReservation.status].label}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Insumos Solicitados:</span>
                <div className="mt-2 space-y-2">
                  {detailReservation.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>{inventoryLabels[item.item as keyof GroupInventory]}</span>
                      <Badge variant="secondary">Cantidad: {item.quantity}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              {detailReservation.status === "retirada_parcial" && detailReservation.receivedItems && (
                <div>
                  <span className="text-muted-foreground font-medium">Insumos Recibidos:</span>
                  <div className="mt-2 space-y-2">
                    {detailReservation.receivedItems.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200">
                        <span>{inventoryLabels[item.item as keyof GroupInventory]}</span>
                        <Badge variant="default" className="bg-green-500">Recibido: {item.quantity}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={partialReceiveModal !== null} onOpenChange={() => setPartialReceiveModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recibida Parcial - Seleccionar items</DialogTitle>
          </DialogHeader>
          {partialReceiveModal && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Selecciona los items que fueron recibidos. Los items eliminados no fueron recibidos.
              </p>
              <div className="space-y-2">
                {receivedItems.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-2 bg-muted rounded">
                    <span>{inventoryLabels[item.item as keyof GroupInventory]}</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max={item.quantity}
                        value={item.quantity}
                        onChange={(e) => handleReceivedItemQuantityChange(index, Number(e.target.value))}
                        className="w-20 text-center"
                      />
                      <span className="text-xs text-muted-foreground">/ {item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveReceivedItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {receivedItems.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No hay items remaining. Todos los items fueron rechazados.
                </p>
              )}
              <div className="flex gap-2 pt-4 justify-end">
                <Button variant="outline" onClick={() => {
                  setPartialReceiveModal(null)
                  setReceivedItemsLocal([])
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleFinalizePartialReceive}>
                  Finalizar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
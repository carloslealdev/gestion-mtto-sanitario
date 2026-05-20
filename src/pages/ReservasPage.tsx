import { useState, useMemo } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { addReservation, updateReservationStatus, setReceivedItems, type ReservationItem } from "@/store/slices/reservationsSlice"
import { addRequest, updateRequestStatus, setApprovedItems, type RequestItem } from "@/store/slices/requestsSlice"
import { addToInventory } from "@/store/slices/inventorySlice"
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
  const requests = useAppSelector((state) => state.requests.requests)
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
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestItems, setRequestItems] = useState<RequestItem[]>([])
  const [selectedRequest, setSelectedRequest] = useState<{
    id: string
    items: RequestItem[]
    team: Team
    date: string
    status: string
  } | null>(null)
  const [isFromRequest, setIsFromRequest] = useState(false)
  const [approvedRequestId, setApprovedRequestId] = useState<string | null>(null)

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

  const handleAddRequestItem = () => {
    setRequestItems([...requestItems, { item: "", quantity: 1 }])
  }

  const handleRemoveRequestItem = (index: number) => {
    setRequestItems(requestItems.filter((_, i) => i !== index))
  }

  const handleRequestItemChange = (index: number, field: "item" | "quantity", value: string | number) => {
    const newItems = [...requestItems]
    if (field === "quantity") {
      newItems[index] = { ...newItems[index], quantity: Number(value) }
    } else {
      newItems[index] = { ...newItems[index], item: value as string }
    }
    setRequestItems(newItems)
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

    if (approvedRequestId) {
      dispatch(setApprovedItems({ id: approvedRequestId, approvedItems: uniqueItems }))
    }

    dispatch(addReservation({ team: selectedTeam, items: uniqueItems }))
    setItems([])
    setShowForm(false)
    setIsFromRequest(false)
    setApprovedRequestId(null)
  }

  const handleGenerateRequest = () => {
    const validItems = requestItems.filter((item) => item.item !== "" && item.quantity > 0)
    if (validItems.length === 0) return

    const uniqueItems = validItems.reduce((acc, item) => {
      if (!acc.find((i) => i.item === item.item)) {
        acc.push(item)
      }
      return acc
    }, [] as RequestItem[])

    if (userWorkTeam) {
      dispatch(addRequest({ team: userWorkTeam, items: uniqueItems }))
    }
    setRequestItems([])
    setShowRequestForm(false)
  }

  const handleStatusChange = (id: string, status: string) => {
    const reservation = reservations.find((r) => r.id === id)
    if (!reservation) return

    if (status === "retirada_parcial") {
      setPartialReceiveModal({ id, items: [...reservation.items] })
      setReceivedItemsLocal([...reservation.items])
    } else {
      if (status === "retirada_completa") {
        reservation.items.forEach((item) => {
          dispatch(addToInventory({
            team: reservation.team,
            item: item.item as keyof GroupInventory,
            quantity: item.quantity,
          }))
        })
      }
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
    if (partialReceiveModal) {
      const reservation = reservations.find((r) => r.id === partialReceiveModal.id)
      if (reservation) {
        receivedItems.forEach((item) => {
          dispatch(addToInventory({
            team: reservation.team,
            item: item.item as keyof GroupInventory,
            quantity: item.quantity,
          }))
        })
      }
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

  const handleOpenRequestDetail = (req: typeof requests[0]) => {
    setSelectedRequest({
      id: req.id,
      items: req.items,
      team: req.team,
      date: req.createdAt,
      status: req.status,
    })
  }

  const handleApproveRequest = (id: string) => {
    const request = requests.find((r) => r.id === id)
    if (request) {
      setSelectedTeam(request.team)
      setItems(request.items.map((i) => ({ item: i.item, quantity: i.quantity })))
      setShowForm(true)
      setIsFromRequest(true)
      setApprovedRequestId(id)
      dispatch(updateRequestStatus({ id, status: "aprobada" }))
    }
    setSelectedRequest(null)
  }

  const handleRejectRequest = (id: string) => {
    dispatch(updateRequestStatus({ id, status: "rechazada" }))
    setSelectedRequest(null)
  }

  const availableItems = itemKeys.filter((key) => !items.some((i) => i.item === key))
  const availableRequestItems = itemKeys.filter((key) => !requestItems.some((i) => i.item === key))

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
              <CardTitle>{isFromRequest ? "Generar reserva" : "Nueva reserva"}</CardTitle>
              {!showForm && !isFromRequest && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generar nueva reserva
                </Button>
              )}
            </div>
          </CardHeader>
          {showForm && (
            <CardContent className="space-y-4">
              {isFromRequest && (
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  Estás generando una reserva a partir de una solicitud. Edita los insumos si es necesario.
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-48">
                  <label className="text-sm font-medium mb-1 block">Grupo de trabajo</label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value as Team)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    disabled={isFromRequest}
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
                  {isFromRequest ? "Crear reserva" : "Generar"}
                </Button>
                <Button variant="outline" onClick={() => { 
                  setShowForm(false); 
                  setItems([]);
                  setIsFromRequest(false);
                }}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {userWorkTeam && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Solicitar reserva</CardTitle>
              {!showRequestForm && (
                <Button onClick={() => setShowRequestForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva solicitud
                </Button>
              )}
            </div>
          </CardHeader>
          {showRequestForm && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Insumos</label>
                {requestItems.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <select
                      value={item.item}
                      onChange={(e) => handleRequestItemChange(index, "item", e.target.value)}
                      className="w-full sm:w-64 h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Seleccionar insumo</option>
                      {itemKeys.filter((key) => !requestItems.some((i, iIndex) => i.item === key && iIndex !== index)).map((key) => (
                        <option key={key} value={key}>{inventoryLabels[key]}</option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleRequestItemChange(index, "quantity", e.target.value)}
                      className="w-24"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRequestItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={handleAddRequestItem} disabled={availableRequestItems.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar insumo
                </Button>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleGenerateRequest} disabled={requestItems.filter((i) => i.item !== "").length === 0}>
                  Generar solicitud
                </Button>
                <Button variant="outline" onClick={() => { setShowRequestForm(false); setRequestItems([]) }}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {userWorkTeam && (
        <Card>
          <CardHeader>
            <CardTitle>Reservas solicitadas</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.filter((req) => req.team === userWorkTeam).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay solicitudes de reserva registradas
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Fecha y Hora</th>
                      <th className="text-left py-3 px-4 font-medium">Estado</th>
                      <th className="text-left py-3 px-4 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.filter((req) => req.team === userWorkTeam).map((req) => (
                      <tr key={req.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-muted-foreground">{req.createdAt}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs text-white px-2 py-1 rounded ${
                            req.status === "pendiente" ? "bg-yellow-500" :
                            req.status === "aprobada" ? "bg-green-500" : "bg-red-500"
                          }`}>
                            {req.status === "pendiente" ? "Pendiente" :
                             req.status === "aprobada" ? "Aprobada" : "Rechazada"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenRequestDetail(req)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver detalle
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
      )}

      {isAdmin && requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes de reserva</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Grupo</th>
                    <th className="text-left py-3 px-4 font-medium">Fecha y Hora</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    <th className="text-left py-3 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">
                        {workTeamLabels[req.team]} ({req.team})
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{req.createdAt}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs text-white px-2 py-1 rounded ${
                          req.status === "pendiente" ? "bg-yellow-500" :
                          req.status === "aprobada" ? "bg-green-500" : "bg-red-500"
                        }`}>
                          {req.status === "pendiente" ? "Pendiente" :
                           req.status === "aprobada" ? "Aprobada" : "Rechazada"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenRequestDetail(req)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver detalle
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
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

      <Dialog open={selectedRequest !== null} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de Solicitud de Reserva</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Grupo de Trabajo:</span>
                  <p className="font-medium">{workTeamLabels[selectedRequest.team]} ({selectedRequest.team})</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha y Hora:</span>
                  <p className="font-medium">{selectedRequest.date}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Estado:</span>
                  <p className="font-medium">
                    <span className={`text-xs text-white px-2 py-1 rounded ${
                      selectedRequest.status === "pendiente" ? "bg-yellow-500" :
                      selectedRequest.status === "aprobada" ? "bg-green-500" : "bg-red-500"
                    }`}>
                      {selectedRequest.status === "pendiente" ? "Pendiente" :
                       selectedRequest.status === "aprobada" ? "Aprobada" : "Rechazada"}
                    </span>
                  </p>
                </div>
              </div>
              {selectedRequest.status === "aprobada" ? (
                <>
                  <div>
                    <span className="text-muted-foreground font-medium">Insumos Aprobados:</span>
                    <div className="mt-2 space-y-2">
                      {(() => {
                        const request = requests.find((r) => r.id === selectedRequest.id)
                        const approvedItems = request?.approvedItems || selectedRequest.items
                        return approvedItems.map((item, i) => {
                          const requestedItem = selectedRequest.items.find((s) => s.item === item.item)
                          const hasDifference = requestedItem && requestedItem.quantity !== item.quantity
                          return (
                            <div key={i} className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200">
                              <span>{inventoryLabels[item.item as keyof GroupInventory]}</span>
                              <div className="flex items-center gap-2">
                                {hasDifference && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    {requestedItem?.quantity}
                                  </span>
                                )}
                                <Badge variant="default" className="bg-green-500">Aprobado: {item.quantity}</Badge>
                              </div>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>
                  {(() => {
                    const request = requests.find((r) => r.id === selectedRequest.id)
                    const approvedItems = request?.approvedItems || selectedRequest.items
                    const hasDifference = selectedRequest.items.some((s) => {
                      const approved = approvedItems.find((a) => a.item === s.item)
                      return !approved || approved.quantity !== s.quantity
                    })
                    if (!hasDifference) return null
                    return (
                      <div>
                        <span className="text-muted-foreground font-medium">Insumos Solicitados (original):</span>
                        <div className="mt-2 space-y-2">
                          {selectedRequest.items.map((item, i) => {
                            const approved = approvedItems.find((a) => a.item === item.item)
                            if (approved && approved.quantity === item.quantity) return null
                            return (
                              <div key={i} className="flex justify-between items-center p-2 bg-muted rounded opacity-60">
                                <span>{inventoryLabels[item.item as keyof GroupInventory]}</span>
                                <Badge variant="secondary">Solicitado: {item.quantity}</Badge>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}
                </>
              ) : (
                <div>
                  <span className="text-muted-foreground font-medium">Insumos Solicitados:</span>
                  <div className="mt-2 space-y-2">
                    {selectedRequest.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span>{inventoryLabels[item.item as keyof GroupInventory]}</span>
                        <Badge variant="secondary">Cantidad: {item.quantity}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedRequest.status === "pendiente" && isAdmin && (
                <div className="flex gap-2 pt-4 justify-end">
                  <Button variant="outline" onClick={() => handleRejectRequest(selectedRequest.id)}>
                    Rechazar
                  </Button>
                  <Button onClick={() => handleApproveRequest(selectedRequest.id)}>
                    Aprobar y crear reserva
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
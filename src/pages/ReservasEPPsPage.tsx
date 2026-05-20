import { useState, useMemo } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { addEPPReservation, updateEPPReservationStatus, setEPPReceivedItems, type EPPReservationItem, type EPPReservationStatus } from "@/store/slices/eppReservationsSlice"
import { addEPPRequest, updateEPPRequestStatus, setEPPApprovedItems, type EPPRequestItem } from "@/store/slices/eppRequestsSlice"
import { updateWorkerEPP } from "@/store/slices/workersSlice"
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
import { Plus, Trash2, Search, Eye, ChevronDown, CheckCircle } from "lucide-react"

const eppLabels: Record<string, string> = {
  casco: "Casco",
  lentes: "Lentes",
  botas: "Botas",
  auditivo: "Protector Auditivo",
  fullFace: "Máscara Completa",
}

const eppOptions = ["casco", "lentes", "botas", "auditivo", "fullFace"] as const

const statusConfig: Record<string, { color: string; label: string }> = {
  pendiente: { color: "bg-yellow-500", label: "Pendiente" },
  retirada_completa: { color: "bg-green-500", label: "Recibida Completa" },
  retirada_parcial: { color: "bg-blue-500", label: "Recibida Parcial" },
  cancelada: { color: "bg-gray-500", label: "Cancelada" },
}

interface FormItem {
  epp: string
  quantity: number
  talla: number | null
}

interface DetailData {
  id: string
  workerCedula: string
  workerName: string
  items: EPPReservationItem[]
  createdAt: string
  status: string
  receivedItems?: EPPReservationItem[]
}

export default function ReservasEPPsPage() {
  const dispatch = useAppDispatch()
  const reservations = useAppSelector((state) => state.eppReservations.reservations)
  const user = useAppSelector((state) => state.auth.user)
  const allWorkers = useAppSelector((state) => state.workers.workers)
  
  const [showForm, setShowForm] = useState(false)
  const [workerCedula, setWorkerCedula] = useState("")
  const [workerCedulaError, setWorkerCedulaError] = useState("")
  const [formItems, setFormItems] = useState<FormItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchDate, setSearchDate] = useState("")
  const [searchStatus, setSearchStatus] = useState("")
  const [detailData, setDetailData] = useState<DetailData | null>(null)
  const [partialReceiveModal, setPartialReceiveModal] = useState<{ id: string; items: EPPReservationItem[] } | null>(null)
  const [receivedItems, setReceivedItemsLocal] = useState<EPPReservationItem[]>([])
  const eppRequests = useAppSelector((state) => state.eppRequests.requests)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestItems, setRequestItems] = useState<FormItem[]>([])
  const [selectedEPPRequest, setSelectedEPPRequest] = useState<{
    id: string
    workerCedula: string
    workerName: string
    items: EPPRequestItem[]
    createdAt: string
    status: string
  } | null>(null)
  const [isEPPFromRequest, setIsEPPFromRequest] = useState(false)
  const [approvedEPPRequestId, setApprovedEPPRequestId] = useState<string | null>(null)

  const isAdmin = user?.role === "admin"
  const isEncargado = user?.role === "encargado"
  const isGeneral = user?.role === "general"

  const userWorker = useMemo(() => {
    return allWorkers.find((w) => w.cedula.replace("V-", "") === user?.username)
  }, [allWorkers, user])

  const userWorkTeam = userWorker?.workTeam || null
  const userCedulaClean = user?.username?.replace("V-", "") || ""

  const selectedWorker = useMemo(() => {
    if (!workerCedula) return null
    return allWorkers.find((w) => w.cedula.replace("V-", "") === workerCedula)
  }, [workerCedula, allWorkers])

  const handleCedulaChange = (value: string) => {
    setWorkerCedula(value)
    if (value && !allWorkers.find((w) => w.cedula.replace("V-", "") === value)) {
      setWorkerCedulaError("Cédula no encontrada en registros")
    } else {
      setWorkerCedulaError("")
    }
  }

  const handleAddItem = () => {
    setFormItems([...formItems, { epp: "", quantity: 1, talla: null }])
  }

  const handleRemoveItem = (index: number) => {
    setFormItems(formItems.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof FormItem, value: string | number | null) => {
    const newItems = [...formItems]
    if (field === "quantity") {
      newItems[index] = { ...newItems[index], quantity: Number(value) }
    } else if (field === "epp") {
      const newItem = { ...newItems[index], epp: value as string }
      if (value !== "botas") {
        newItem.talla = null
      }
      newItems[index] = newItem
    } else {
      newItems[index] = { ...newItems[index], [field]: value as number | null }
    }
    setFormItems(newItems)
  }

  const handleGenerate = () => {
    const validItems = formItems.filter((item) => item.epp !== "" && item.quantity > 0)
    if (validItems.length === 0) return

    const uniqueItems = validItems.reduce((acc, item) => {
      if (!acc.find((i) => i.epp === item.epp)) {
        acc.push({
          epp: item.epp as EPPReservationItem["epp"],
          quantity: item.quantity,
          talla: item.talla || undefined,
        })
      }
      return acc
    }, [] as EPPReservationItem[])

    if (isEPPFromRequest && approvedEPPRequestId) {
      dispatch(setEPPApprovedItems({ id: approvedEPPRequestId, approvedItems: uniqueItems as EPPRequestItem[] }))
    }

    if (selectedWorker) {
      dispatch(addEPPReservation({
        workerCedula: selectedWorker.cedula,
        workerName: `${selectedWorker.firstName} ${selectedWorker.lastName}`,
        items: uniqueItems,
      }))
    }
    setFormItems([])
    setWorkerCedula("")
    setShowForm(false)
    setIsEPPFromRequest(false)
    setApprovedEPPRequestId(null)
  }

  const handleAddRequestItem = () => {
    setRequestItems([...requestItems, { epp: "", quantity: 1, talla: null }])
  }

  const handleRemoveRequestItem = (index: number) => {
    setRequestItems(requestItems.filter((_, i) => i !== index))
  }

  const handleRequestItemChange = (index: number, field: keyof FormItem, value: string | number | null) => {
    const newItems = [...requestItems]
    if (field === "quantity") {
      newItems[index] = { ...newItems[index], quantity: Number(value) }
    } else if (field === "epp") {
      const newItem = { ...newItems[index], epp: value as string }
      if (value !== "botas") {
        newItem.talla = null
      }
      newItems[index] = newItem
    } else {
      newItems[index] = { ...newItems[index], [field]: value as number | null }
    }
    setRequestItems(newItems)
  }

  const handleGenerateRequest = () => {
    if (!userWorker) return
    const validItems = requestItems.filter((item) => item.epp !== "" && item.quantity > 0)
    if (validItems.length === 0) return

    const uniqueItems = validItems.reduce((acc, item) => {
      if (!acc.find((i) => i.epp === item.epp)) {
        acc.push({
          epp: item.epp as EPPRequestItem["epp"],
          quantity: item.quantity,
          talla: item.talla || undefined,
        })
      }
      return acc
    }, [] as EPPRequestItem[])

    dispatch(addEPPRequest({
      workerCedula: userWorker.cedula,
      workerName: `${userWorker.firstName} ${userWorker.lastName}`,
      items: uniqueItems,
    }))
    setRequestItems([])
    setShowRequestForm(false)
  }

  const handleApproveEPPRequest = (id: string) => {
    const request = eppRequests.find((r) => r.id === id)
    if (request) {
      setWorkerCedula(request.workerCedula.replace("V-", ""))
      setFormItems(request.items.map((i) => ({ epp: i.epp, quantity: i.quantity, talla: i.talla || null })))
      setShowForm(true)
      setIsEPPFromRequest(true)
      setApprovedEPPRequestId(id)
      dispatch(updateEPPRequestStatus({ id, status: "aprobada" }))
    }
    setSelectedEPPRequest(null)
  }

  const handleRejectEPPRequest = (id: string) => {
    dispatch(updateEPPRequestStatus({ id, status: "rechazada" }))
    setSelectedEPPRequest(null)
  }

  const handleStatusChange = (id: string, status: EPPReservationStatus) => {
    if (status === "retirada_parcial") {
      const reservation = reservations.find((r) => r.id === id)
      if (reservation) {
        setPartialReceiveModal({ id, items: [...reservation.items] })
        setReceivedItemsLocal([...reservation.items])
      }
    } else if (status === "retirada_completa") {
      const reservation = reservations.find((r) => r.id === id)
      if (reservation) {
        const now = new Date().toISOString()
        const threeMonthsLater = new Date()
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3)
        const eppUpdates = reservation.items.map((item) => ({
          epp: item.epp as "casco" | "lentes" | "botas" | "auditivo" | "fullFace",
          lastRenewal: now,
          nextRenewal: threeMonthsLater.toISOString(),
        }))
        dispatch(updateWorkerEPP({ cedula: reservation.workerCedula, epps: eppUpdates }))
        dispatch(updateEPPReservationStatus({ id, status }))
      }
    } else {
      dispatch(updateEPPReservationStatus({ id, status }))
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
      const validReceivedItems = receivedItems.filter((item) => item.quantity > 0)
      if (validReceivedItems.length > 0) {
        const now = new Date().toISOString()
        const threeMonthsLater = new Date()
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3)
        const eppUpdates = validReceivedItems.map((item) => ({
          epp: item.epp as "casco" | "lentes" | "botas" | "auditivo" | "fullFace",
          lastRenewal: now,
          nextRenewal: threeMonthsLater.toISOString(),
        }))
        const reservation = reservations.find((r) => r.id === partialReceiveModal.id)
        if (reservation) {
          dispatch(updateWorkerEPP({ cedula: reservation.workerCedula, epps: eppUpdates }))
        }
      }
      dispatch(updateEPPReservationStatus({ id: partialReceiveModal.id, status: "retirada_parcial" }))
      dispatch(setEPPReceivedItems({ id: partialReceiveModal.id, receivedItems }))
      setPartialReceiveModal(null)
      setReceivedItemsLocal([])
    }
  }

  const filteredReservations = useMemo(() => {
    let filtered = reservations

    if (isEncargado && userWorkTeam) {
      const teamWorkerCedulas = allWorkers
        .filter((w) => w.workTeam === userWorkTeam)
        .map((w) => w.cedula)
      filtered = filtered.filter((res) => teamWorkerCedulas.includes(res.workerCedula))
    }

    if (isGeneral) {
      filtered = filtered.filter((res) => res.workerCedula.replace("V-", "") === userCedulaClean)
    }

    filtered = filtered.filter((res) => {
      const matchesWorker = searchQuery === "" ||
        res.workerCedula.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.workerName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDate = searchDate === "" || res.createdAt.startsWith(searchDate)
      const matchesStatus = searchStatus === "" || res.status === searchStatus
      return matchesWorker && matchesDate && matchesStatus
    })

    return filtered
  }, [reservations, searchQuery, searchDate, searchStatus, isEncargado, isGeneral, userWorkTeam, userCedulaClean, allWorkers])

  const isOwnReservation = (cedula: string) => {
    return cedula.replace("V-", "") === userCedulaClean
  }

  const availableEPPs = eppOptions.filter((key) => !formItems.some((item) => item.epp === key))

  const pageTitle = isGeneral
    ? "Mis Reservas de EPPs"
    : isEncargado
    ? `Reservas de EPPs - ${userWorkTeam}`
    : "Reservas de EPPs"

  const pageDescription = isGeneral
    ? "Reservas de equipos de protección personal para ti"
    : isEncargado
    ? "Reservas de EPPs de tu grupo de trabajo"
    : "Gestión de reservas de equipos de protección personal"

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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por trabajador..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-48"
                />
              </div>
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
                    {(isAdmin || isEncargado) && <th className="text-left py-3 px-4 font-medium">Trabajador</th>}
                    <th className="text-left py-3 px-4 font-medium">Fecha y Hora</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    {(isEncargado || isGeneral) && <th className="text-left py-3 px-4 font-medium">Marcar como</th>}
                    <th className="text-left py-3 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((res) => {
                    const canMark = isOwnReservation(res.workerCedula) && res.status === "pendiente"
                    return (
                      <tr key={res.id} className="border-b hover:bg-muted/50">
                        {(isAdmin || isEncargado) && (
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-medium">{res.workerName}</span>
                              <span className="text-muted-foreground text-xs ml-2">({res.workerCedula})</span>
                            </div>
                          </td>
                        )}
                        <td className="py-3 px-4 text-muted-foreground">{res.createdAt}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs text-white px-2 py-1 rounded ${statusConfig[res.status].color}`}>
                            {statusConfig[res.status].label}
                          </span>
                        </td>
                        {(isEncargado || isGeneral) && (
                          <td className="py-3 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild disabled={!canMark}>
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
                            onClick={() => setDetailData({
                              id: res.id,
                              workerCedula: res.workerCedula,
                              workerName: res.workerName,
                              items: res.items,
                              createdAt: res.createdAt,
                              status: res.status,
                              receivedItems: res.receivedItems,
                            })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
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
              <CardTitle>Nueva reserva de EPPs</CardTitle>
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
              {isEPPFromRequest && (
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  Estás generando una reserva a partir de una solicitud. Edita los EPPs si es necesario.
                </p>
              )}
              <div>
                <label className="text-sm font-medium mb-1 block">Cédula del trabajador</label>
                <Input
                  type="number"
                  placeholder="Ingrese la cédula sin V-"
                  value={workerCedula}
                  onChange={(e) => handleCedulaChange(e.target.value)}
                  className="w-full sm:w-64"
                  disabled={isEPPFromRequest}
                />
                {workerCedulaError && (
                  <p className="text-sm text-destructive mt-1">{workerCedulaError}</p>
                )}
                {selectedWorker && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {selectedWorker.firstName} {selectedWorker.lastName} - {selectedWorker.workTeam}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">EPPs</label>
                {formItems.map((item, index) => (
                  <div key={index} className="flex flex-wrap sm:flex-nowrap gap-2 items-start sm:items-center">
                    <select
                      value={item.epp}
                      onChange={(e) => handleItemChange(index, "epp", e.target.value)}
                      className="w-full sm:w-48 h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Seleccionar EPP</option>
                      {eppOptions.filter((key) => !formItems.some((existingItem, existingIndex) => existingItem.epp === key && existingIndex !== index)).map((key) => (
                        <option key={key} value={key}>{eppLabels[key]}</option>
                      ))}
                    </select>
                    {item.epp === "botas" && (
                      <select
                        value={item.talla || ""}
                        onChange={(e) => handleItemChange(index, "talla", Number(e.target.value))}
                        className="w-24 h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="">Talla</option>
                        {Array.from({ length: 9 }, (_, i) => 36 + i).map((talla) => (
                          <option key={talla} value={talla}>{talla}</option>
                        ))}
                      </select>
                    )}
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
                <Button variant="outline" onClick={handleAddItem} disabled={availableEPPs.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar EPP
                </Button>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleGenerate} disabled={!selectedWorker || formItems.filter((i) => i.epp !== "").length === 0}>
                  {isEPPFromRequest ? "Crear reserva" : "Generar"}
                </Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setFormItems([]); setWorkerCedula(""); setWorkerCedulaError(""); setIsEPPFromRequest(false); setApprovedEPPRequestId(null) }}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {(isEncargado || isGeneral) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Solicitar EPPs</CardTitle>
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
                <label className="text-sm font-medium">EPPs</label>
                {requestItems.map((item, index) => (
                  <div key={index} className="flex flex-wrap sm:flex-nowrap gap-2 items-start sm:items-center">
                    <select
                      value={item.epp}
                      onChange={(e) => handleRequestItemChange(index, "epp", e.target.value)}
                      className="w-full sm:w-48 h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Seleccionar EPP</option>
                      {eppOptions.filter((key) => !requestItems.some((existingItem, existingIndex) => existingItem.epp === key && existingIndex !== index)).map((key) => (
                        <option key={key} value={key}>{eppLabels[key]}</option>
                      ))}
                    </select>
                    {item.epp === "botas" && (
                      <select
                        value={item.talla || ""}
                        onChange={(e) => handleRequestItemChange(index, "talla", Number(e.target.value))}
                        className="w-24 h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="">Talla</option>
                        {Array.from({ length: 9 }, (_, i) => 36 + i).map((talla) => (
                          <option key={talla} value={talla}>{talla}</option>
                        ))}
                      </select>
                    )}
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
                <Button variant="outline" onClick={handleAddRequestItem} disabled={eppOptions.filter((key) => !requestItems.some((item) => item.epp === key)).length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar EPP
                </Button>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleGenerateRequest} disabled={requestItems.filter((i) => i.epp !== "").length === 0}>
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

      {(isEncargado || isGeneral) && userWorker && (
        <Card>
          <CardHeader>
            <CardTitle>Mis Solicitudes de EPPs</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const myRequests = isEncargado && userWorkTeam
                ? eppRequests.filter((req) => {
                    const worker = allWorkers.find((w) => w.cedula === req.workerCedula)
                    return worker?.workTeam === userWorkTeam
                  })
                : eppRequests.filter((req) => req.workerCedula.replace("V-", "") === userCedulaClean)
              
              if (myRequests.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay solicitudes de EPPs registradas
                  </div>
                )
              }
              
              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Cédula</th>
                        <th className="text-left py-3 px-4 font-medium">Fecha y Hora</th>
                        <th className="text-left py-3 px-4 font-medium">Estado</th>
                        <th className="text-left py-3 px-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myRequests.map((req) => (
                        <tr key={req.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-medium">{req.workerName}</span>
                              <span className="text-muted-foreground text-xs ml-2">({req.workerCedula})</span>
                            </div>
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
                              onClick={() => setSelectedEPPRequest({
                                id: req.id,
                                workerCedula: req.workerCedula,
                                workerName: req.workerName,
                                items: req.items,
                                createdAt: req.createdAt,
                                status: req.status,
                              })}
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
              )
            })()}
          </CardContent>
        </Card>
      )}

      {isAdmin && eppRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes de EPPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Cédula</th>
                    <th className="text-left py-3 px-4 font-medium">Trabajador</th>
                    <th className="text-left py-3 px-4 font-medium">Fecha y Hora</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    <th className="text-left py-3 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {eppRequests.map((req) => (
                    <tr key={req.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{req.workerCedula}</td>
                      <td className="py-3 px-4 font-medium">{req.workerName}</td>
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
                          onClick={() => setSelectedEPPRequest({
                            id: req.id,
                            workerCedula: req.workerCedula,
                            workerName: req.workerName,
                            items: req.items,
                            createdAt: req.createdAt,
                            status: req.status,
                          })}
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

      <Dialog open={detailData !== null} onOpenChange={() => setDetailData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de Reserva de EPPs</DialogTitle>
          </DialogHeader>
          {detailData && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Trabajador:</span>
                  <p className="font-medium">{detailData.workerName}</p>
                  <p className="text-muted-foreground text-xs">{detailData.workerCedula}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha y Hora:</span>
                  <p className="font-medium">{detailData.createdAt}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Estado:</span>
                  <p className="font-medium">
                    <span className={`text-xs text-white px-2 py-1 rounded ${statusConfig[detailData.status].color}`}>
                      {statusConfig[detailData.status].label}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">EPPs Solicitados:</span>
                <div className="mt-2 space-y-2">
                  {detailData.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>{eppLabels[item.epp]}{item.talla ? ` (Talla ${item.talla})` : ""}</span>
                      <Badge variant="secondary">Cantidad: {item.quantity}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              {detailData.status === "retirada_parcial" && detailData.receivedItems && (
                <div>
                  <span className="text-muted-foreground font-medium">EPPs Recibidos:</span>
                  <div className="mt-2 space-y-2">
                    {detailData.receivedItems.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200">
                        <span>{eppLabels[item.epp]}{item.talla ? ` (Talla ${item.talla})` : ""}</span>
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
                    <span>{eppLabels[item.epp]}{item.talla ? ` (Talla ${item.talla})` : ""}</span>
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

      <Dialog open={selectedEPPRequest !== null} onOpenChange={() => setSelectedEPPRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de Solicitud de EPPs</DialogTitle>
          </DialogHeader>
          {selectedEPPRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Trabajador:</span>
                  <p className="font-medium">{selectedEPPRequest.workerName}</p>
                  <p className="text-muted-foreground text-xs">{selectedEPPRequest.workerCedula}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha y Hora:</span>
                  <p className="font-medium">{selectedEPPRequest.createdAt}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Estado:</span>
                  <p className="font-medium">
                    <span className={`text-xs text-white px-2 py-1 rounded ${
                      selectedEPPRequest.status === "pendiente" ? "bg-yellow-500" :
                      selectedEPPRequest.status === "aprobada" ? "bg-green-500" : "bg-red-500"
                    }`}>
                      {selectedEPPRequest.status === "pendiente" ? "Pendiente" :
                       selectedEPPRequest.status === "aprobada" ? "Aprobada" : "Rechazada"}
                    </span>
                  </p>
                </div>
              </div>
              {selectedEPPRequest.status === "aprobada" ? (
                <>
                  <div>
                    <span className="text-muted-foreground font-medium">EPPs Aprobados:</span>
                    <div className="mt-2 space-y-2">
                      {(() => {
                        const request = eppRequests.find((r) => r.id === selectedEPPRequest.id)
                        const approvedItems = request?.approvedItems || selectedEPPRequest.items
                        return approvedItems.map((item, i) => {
                          const requestedItem = selectedEPPRequest.items.find((s) => s.epp === item.epp)
                          const hasDifference = requestedItem && (requestedItem.quantity !== item.quantity || requestedItem.talla !== item.talla)
                          return (
                            <div key={i} className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200">
                              <span>{eppLabels[item.epp]}{item.talla ? ` (Talla ${item.talla})` : ""}</span>
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
                    const request = eppRequests.find((r) => r.id === selectedEPPRequest.id)
                    const approvedItems = request?.approvedItems || selectedEPPRequest.items
                    const hasDifference = selectedEPPRequest.items.some((s) => {
                      const approved = approvedItems.find((a) => a.epp === s.epp)
                      return !approved || approved.quantity !== s.quantity || approved.talla !== s.talla
                    })
                    if (!hasDifference) return null
                    return (
                      <div>
                        <span className="text-muted-foreground font-medium">EPPs Solicitados (original):</span>
                        <div className="mt-2 space-y-2">
                          {selectedEPPRequest.items.map((item, i) => {
                            const approved = approvedItems.find((a) => a.epp === item.epp)
                            if (approved && approved.quantity === item.quantity && approved.talla === item.talla) return null
                            return (
                              <div key={i} className="flex justify-between items-center p-2 bg-muted rounded opacity-60">
                                <span>{eppLabels[item.epp]}{item.talla ? ` (Talla ${item.talla})` : ""}</span>
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
                  <span className="text-muted-foreground font-medium">EPPs Solicitados:</span>
                  <div className="mt-2 space-y-2">
                    {selectedEPPRequest.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span>{eppLabels[item.epp]}{item.talla ? ` (Talla ${item.talla})` : ""}</span>
                        <Badge variant="secondary">Cantidad: {item.quantity}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedEPPRequest.status === "pendiente" && isAdmin && (
                <div className="flex gap-2 pt-4 justify-end">
                  <Button variant="outline" onClick={() => handleRejectEPPRequest(selectedEPPRequest.id)}>
                    Rechazar
                  </Button>
                  <Button onClick={() => handleApproveEPPRequest(selectedEPPRequest.id)}>
                    Aprobar y crear orden
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
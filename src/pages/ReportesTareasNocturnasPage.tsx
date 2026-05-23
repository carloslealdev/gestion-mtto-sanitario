import { useState, useMemo } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { addNightlyTaskReport, clearNightlyTaskReports, type NightlyTaskEquipment, type ReportType } from "@/store/slices/nightlyTasksSlice"
import { productionLines } from "@/mock-data/productionLines"
import { normalizeName, normalizeSupplyName } from "@/helpers/normalize"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { seedMockReport } from "@/helpers/seedMockReport"
import { Plus, Trash2, Eye, Download } from "lucide-react"

type Team = "G1" | "G2" | "G3" | "TN"

const workTeamLabels: Record<Team, string> = {
  G1: "Grupo 1",
  G2: "Grupo 2",
  G3: "Grupo 3",
  TN: "Turno Normal",
}

const reportTypeLabels: Record<ReportType, string> = {
  mantenimiento_sanitario: "Mantenimiento sanitario",
  otras_tareas: "Otras tareas",
}

interface SelectedEquipment {
  lineId: number
  lineName: string
  machineId: string
  machineName: string
}

interface ReportDetail {
  id: string
  reportType: ReportType
  team: Team
  responsibleName: string
  responsibleCedula: string
  createdAt: string
  equipment: NightlyTaskEquipment[]
}

export default function ReportesTareasNocturnasPage() {
  const dispatch = useAppDispatch()
  const reports = useAppSelector((state) => state.nightlyTasks.reports)
  const user = useAppSelector((state) => state.auth.user)
  const allWorkers = useAppSelector((state) => state.workers.workers)

  const [showForm, setShowForm] = useState(false)
  const [reportType, setReportType] = useState<ReportType | "">("")
  const [selectedLineId, setSelectedLineId] = useState<number | "">("")
  const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment[]>([])
  const [selectedMachineId, setSelectedMachineId] = useState<string>("")
  const [selectedDetail, setSelectedDetail] = useState<ReportDetail | null>(null)

  const isEncargado = user?.role === "encargado"

  const userWorker = useMemo(() => {
    return allWorkers.find((w) => w.cedula.replace("V-", "") === user?.username)
  }, [allWorkers, user])

  const userWorkTeam = userWorker?.workTeam as Team | null

  const filteredReports = useMemo(() => {
    if (!userWorkTeam) return reports
    return reports.filter((rep) => rep.team === userWorkTeam)
  }, [reports, userWorkTeam])

  const selectedLine = productionLines.find((l) => l.id === Number(selectedLineId))

  const availableEquipment = selectedLine?.machines.filter(
    (m) => !selectedEquipment.some((e) => e.machineId === m.machineId)
  ) || []

  const handleAddEquipment = () => {
    if (!selectedLine || !selectedMachineId) return
    const machine = selectedLine.machines.find((m) => m.machineId === selectedMachineId)
    if (!machine) return

    setSelectedEquipment([
      ...selectedEquipment,
      {
        lineId: selectedLine.id,
        lineName: selectedLine.name,
        machineId: machine.machineId,
        machineName: machine.name,
      },
    ])
    setSelectedMachineId("")
  }

  const handleRemoveEquipment = (index: number) => {
    setSelectedEquipment(selectedEquipment.filter((_, i) => i !== index))
  }

  const handleSeedMockReport = () => {
    if (!userWorker) return
    seedMockReport(dispatch, userWorker)
  }

  const handleClearMockData = () => {
    dispatch(clearNightlyTaskReports())
  }

  const handleGenerateReport = () => {
    if (!userWorker || selectedEquipment.length === 0 || !reportType) return

    dispatch(addNightlyTaskReport({
      reportType: reportType as ReportType,
      team: userWorkTeam as Team,
      responsibleName: `${userWorker.firstName} ${userWorker.lastName}`,
      responsibleCedula: userWorker.cedula,
      equipment: selectedEquipment,
    }))

    setReportType("")
    setSelectedLineId("")
    setSelectedEquipment([])
    setSelectedMachineId("")
    setShowForm(false)
  }

  const pageTitle = userWorkTeam
    ? `Reportes de tareas nocturnas - ${workTeamLabels[userWorkTeam]}`
    : "Reportes de tareas nocturnas"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
        <p className="text-muted-foreground">
          Gestión de reportes de tareas nocturnas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reportes registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay reportes registrados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Tipo de reporte</th>
                    <th className="text-left py-3 px-4 font-medium">Grupo</th>
                    <th className="text-left py-3 px-4 font-medium">Fecha y Hora</th>
                    <th className="text-left py-3 px-4 font-medium">Trabajador encargado</th>
                    <th className="text-left py-3 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((rep) => (
                    <tr key={rep.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <span className={`text-xs text-white px-2 py-1 rounded ${
                          rep.reportType === "mantenimiento_sanitario" ? "bg-blue-500" : "bg-purple-500"
                        }`}>
                          {reportTypeLabels[rep.reportType]}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {workTeamLabels[rep.team]} ({rep.team})
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{rep.createdAt}</td>
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-medium">{rep.responsibleName}</span>
                          <span className="text-muted-foreground text-xs ml-2">({rep.responsibleCedula})</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDetail({
                            id: rep.id,
                            reportType: rep.reportType,
                            team: rep.team,
                            responsibleName: rep.responsibleName,
                            responsibleCedula: rep.responsibleCedula,
                            createdAt: rep.createdAt,
                            equipment: rep.equipment,
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
          )}
        </CardContent>
      </Card>

      {isEncargado && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generar nuevo reporte</CardTitle>
              <div className="flex gap-2">
                {!showForm && (
                  <Button variant="outline" size="sm" onClick={handleSeedMockReport}>
                    <Download className="h-4 w-4 mr-2" />
                    CARGAR REPORTE MOCK
                  </Button>
                )}
                {!showForm && (
                  <Button variant="outline" size="sm" onClick={handleClearMockData}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    LIMPIAR DATA MOCK
                  </Button>
                )}
                {!showForm && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo reporte
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          {showForm && (
            <CardContent className="space-y-4">
              <div className="w-full sm:w-64">
                <label className="text-sm font-medium mb-1 block">Tipo de reporte</label>
                <select
                  value={reportType}
                  onChange={(e) => {
                    setReportType(e.target.value as ReportType)
                    setSelectedLineId("")
                    setSelectedEquipment([])
                    setSelectedMachineId("")
                  }}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="mantenimiento_sanitario">Mantenimiento sanitario</option>
                  <option value="otras_tareas">Otras tareas</option>
                </select>
              </div>

              {reportType && (
                <div className="w-full sm:w-64">
                  <label className="text-sm font-medium mb-1 block">Línea de producción</label>
                  <select
                    value={selectedLineId}
                    onChange={(e) => {
                      setSelectedLineId(e.target.value ? Number(e.target.value) : "")
                      setSelectedMachineId("")
                      setSelectedEquipment([])
                    }}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Seleccionar línea</option>
                    {productionLines.map((line) => (
                      <option key={line.id} value={line.id}>{line.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedLineId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Equipos</label>
                  {selectedEquipment.map((eq, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center p-2 bg-muted rounded">
                      <div className="flex-1">
                        <span className="font-medium">{normalizeName(eq.machineName)}</span>
                        <span className="text-muted-foreground text-xs ml-2">- {eq.lineName}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEquipment(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <select
                      value={selectedMachineId}
                      onChange={(e) => setSelectedMachineId(e.target.value)}
                      className="w-full sm:w-64 h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Seleccionar equipo</option>
                      {availableEquipment.map((machine) => (
                        <option key={machine.machineId} value={machine.machineId}>{normalizeName(machine.name)}</option>
                      ))}
                    </select>
                    <Button
                      variant="outline"
                      onClick={handleAddEquipment}
                      disabled={!selectedMachineId}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar equipo
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleGenerateReport} disabled={selectedEquipment.length === 0 || !reportType}>
                  Generar reporte
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowForm(false)
                  setReportType("")
                  setSelectedLineId("")
                  setSelectedEquipment([])
                  setSelectedMachineId("")
                }}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      <Dialog open={selectedDetail !== null} onOpenChange={() => setSelectedDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Reporte</DialogTitle>
          </DialogHeader>
          {selectedDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Tipo de reporte:</span>
                  <p className="font-medium">
                    <span className={`text-xs text-white px-2 py-1 rounded ${
                      selectedDetail.reportType === "mantenimiento_sanitario" ? "bg-blue-500" : "bg-purple-500"
                    }`}>
                      {reportTypeLabels[selectedDetail.reportType]}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Grupo:</span>
                  <p className="font-medium">{workTeamLabels[selectedDetail.team]} ({selectedDetail.team})</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha y Hora:</span>
                  <p className="font-medium">{selectedDetail.createdAt}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Trabajador encargado:</span>
                  <p className="font-medium">{selectedDetail.responsibleName} ({selectedDetail.responsibleCedula})</p>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Equipos y Insumos:</span>
                <div className="mt-2 space-y-3">
                  {selectedDetail.equipment.map((eq, i) => {
                    const line = productionLines.find((l) => l.id === eq.lineId)
                    const machine = line?.machines.find((m) => m.machineId === eq.machineId)
                    const supplies = machine?.supplies_required || []
                    return (
                      <div key={i} className="p-2 bg-muted rounded">
                        <div className="font-medium text-sm mb-1">
                          {eq.machineName} - <span className="text-muted-foreground text-xs">{eq.lineName}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {supplies.map((supply, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {normalizeSupplyName(supply.supply)}: {supply.quantity} {supply.unit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="border-t pt-4">
                <span className="text-muted-foreground font-medium">Total de Insumos:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(() => {
                    const totals: Record<string, { quantity: number; unit: string }> = {}
                    selectedDetail.equipment.forEach((eq) => {
                      const line = productionLines.find((l) => l.id === eq.lineId)
                      const machine = line?.machines.find((m) => m.machineId === eq.machineId)
                      const supplies = machine?.supplies_required || []
                      supplies.forEach((supply) => {
                        if (!totals[supply.supply]) {
                          totals[supply.supply] = { quantity: 0, unit: supply.unit }
                        }
                        totals[supply.supply].quantity += supply.quantity
                      })
                    })
                    return Object.entries(totals).map(([supply, data], i) => (
                      <Badge key={i} variant="default" className="bg-green-500 text-sm">
                        {normalizeSupplyName(supply)}: {data.quantity} {data.unit}
                      </Badge>
                    ))
                  })()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
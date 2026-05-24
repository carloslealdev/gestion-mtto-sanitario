import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { normalizeName } from "@/helpers/normalize"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { setSearchTerm } from "@/store/slices/mantenimientosSlice"

export default function MantenimientosPage() {
  const dispatch = useAppDispatch()
  const searchTerm = useAppSelector((state) => state.mantenimientos.searchTerm)
  const productionLines = useAppSelector((state) => state.productionLines.lines)

  const filteredLines = productionLines.filter((line) =>
    line.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mantenimientos</h1>
          <p className="text-muted-foreground">Insumos requeridos por línea de producción</p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Buscar línea de producción..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
          />
        </div>
      </div>

      {filteredLines.map((line) => (
        <Card key={line.id}>
          <CardHeader>
            <CardTitle>{line.name}</CardTitle>
            <CardDescription>ID: {line.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Equipo</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID Máquina</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Insumo</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Cantidad</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {line.machines.flatMap((machine) =>
                    machine.supplies_required.map((supply, supplyIndex) => (
                      <tr
                        key={`${machine.machineId}-${supplyIndex}`}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        {supplyIndex === 0 && (
                          <>
                            <td
                              className="p-4 align-middle font-medium"
                              rowSpan={machine.supplies_required.length}
                            >
                              {normalizeName(machine.name)}
                            </td>
                            <td
                              className="p-4 align-middle"
                              rowSpan={machine.supplies_required.length}
                            >
                              {machine.machineId}
                            </td>
                          </>
                        )}
                        <td className="p-4 align-middle">{supply.supplyName}</td>
                        <td className="p-4 align-middle">{supply.quantity}</td>
                        <td className="p-4 align-middle">{supply.unit}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
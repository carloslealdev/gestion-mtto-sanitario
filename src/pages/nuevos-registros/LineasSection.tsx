import { useState } from 'react';
import Swal from 'sweetalert2';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getErrorMessage } from '@/lib/errors';
import {
  addProductionLineAsync,
  updateProductionLineAsync,
  deleteProductionLineAsync,
  type ProductionLine,
  type Machine,
} from '@/store/slices/productionLinesSlice';
import { generateIdFromName } from '@/helpers/normalize';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface MachineForm {
  machineId: string;
  name: string;
  supplies: { supplyId: string; quantity: number; unit: string }[];
}

export function LineasSection() {
  const dispatch = useAppDispatch();
  const lines = useAppSelector((s) => s.productionLines.lines);
  const supplies = useAppSelector((s) => s.supplies.supplies);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');

  const [machines, setMachines] = useState<MachineForm[]>([]);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setMachines([{ name: '', machineId: '', supplies: [] }]);
    setOpen(true);
  };

  const openEdit = (line: ProductionLine) => {
    setEditingId(line.id);
    setName(line.name);
    setMachines(
      line.machines.map((m) => {
        const prefix = line.lineId + '-';
        const shortId = m.machineId.startsWith(prefix)
          ? m.machineId.slice(prefix.length)
          : m.machineId;
        return {
          machineId: shortId,
          name: m.name,
          supplies: m.supplies_required.map((s) => ({
            supplyId: s.supplyId,
            quantity: s.quantity,
            unit: s.unit,
          })),
        };
      }),
    );
    setOpen(true);
  };

  const handleSave = async () => {
    if (!name) return;
    const newLineId = generateIdFromName(name);

    const machinesData: Machine[] = machines.map((m) => ({
      machineId: m.machineId ? `${newLineId}-${m.machineId}` : '',
      name: m.name,
      supplies_required: m.supplies
        .filter((s) => s.supplyId)
        .map((s) => ({
          supplyId: s.supplyId,
          supplyName:
            supplies.find((sp) => sp.id === s.supplyId)?.name || s.supplyId,
          quantity: s.quantity,
          unit: s.unit,
        })),
    }));

    try {
      if (editingId) {
        await dispatch(
          updateProductionLineAsync({
            id: editingId,
            name,
            lineId: newLineId,
            machines: machinesData,
          }),
        ).unwrap();
        Swal.fire({
          icon: 'success',
          title: 'Línea actualizada',
          text: `${name} ha sido actualizada exitosamente.`,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } else {
        await dispatch(
          addProductionLineAsync({
            id: Date.now(),
            name,
            lineId: newLineId,
            machines: machinesData,
          }),
        ).unwrap();
        Swal.fire({
          icon: 'success',
          title: 'Línea creada',
          text: `${name} ha sido registrada exitosamente.`,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
      setOpen(false);
    } catch (err: unknown) {
      console.error(
        '[NuevosRegistrosPage] handleSave production line failed:',
        err,
      );
      const message = getErrorMessage(err, 'Error al guardar la línea');
      Swal.fire({ icon: 'error', title: 'Error', text: message });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar línea?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;
    try {
      await dispatch(deleteProductionLineAsync(id)).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Línea eliminada',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al eliminar la línea';
      Swal.fire({ icon: 'error', title: 'Error', text: message });
    }
  };

  const addMachine = () => {
    setMachines([...machines, { name: '', machineId: '', supplies: [] }]);
  };

  const removeMachine = (idx: number) => {
    setMachines(machines.filter((_, i) => i !== idx));
  };

  const updateMachineName = (idx: number, value: string) => {
    const updated = [...machines];
    const shortId = value ? generateIdFromName(value) : '';
    updated[idx] = { ...updated[idx], name: value, machineId: shortId };
    setMachines(updated);
  };

  const addSupplyToMachine = (machineIdx: number) => {
    const updated = [...machines];
    updated[machineIdx] = {
      ...updated[machineIdx],
      supplies: [
        ...updated[machineIdx].supplies,
        { supplyId: '', quantity: 1, unit: 'unidad' },
      ],
    };
    setMachines(updated);
  };

  const removeSupplyFromMachine = (machineIdx: number, supplyIdx: number) => {
    const updated = [...machines];
    updated[machineIdx] = {
      ...updated[machineIdx],
      supplies: updated[machineIdx].supplies.filter((_, i) => i !== supplyIdx),
    };
    setMachines(updated);
  };

  const updateMachineSupply = (
    machineIdx: number,
    supplyIdx: number,
    field: string,
    value: string | number,
  ) => {
    const updated = [...machines];
    if (field === 'supplyId') {
      const selected = supplies.find((s) => s.id === value);
      updated[machineIdx].supplies[supplyIdx] = {
        supplyId: value as string,
        quantity: updated[machineIdx].supplies[supplyIdx].quantity,
        unit: selected?.unit || '',
      };
    } else {
      updated[machineIdx].supplies[supplyIdx] = {
        ...updated[machineIdx].supplies[supplyIdx],
        [field]: value,
      };
    }
    setMachines(updated);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Líneas de Producción</CardTitle>
            <Button onClick={openCreate}>
              <Plus className='h-4 w-4 mr-2' />
              Nueva Línea
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lines.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              No hay líneas registradas
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-3 px-4 font-medium'>Nombre</th>
                    <th className='text-left py-3 px-4 font-medium'>
                      ID Línea
                    </th>
                    <th className='text-left py-3 px-4 font-medium'>
                      Máquinas
                    </th>
                    <th className='text-left py-3 px-4 font-medium'>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.id} className='border-b hover:bg-muted/50'>
                      <td className='py-3 px-4 font-medium'>{l.name}</td>
                      <td className='py-3 px-4'>{l.lineId}</td>
                      <td className='py-3 px-4'>
                        {l.machines.length} máquina
                        {l.machines.length !== 1 ? 's' : ''}
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => openEdit(l)}
                          >
                            <Pencil className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleDelete(l.id)}
                          >
                            <Trash2 className='h-4 w-4 text-destructive' />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-3xl max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {editingId
                ? 'Editar Línea de Producción'
                : 'Nueva Línea de Producción'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <label className='text-sm font-medium'>
                  Nombre de la línea *
                </label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className='space-y-1'>
                <label className='text-sm font-medium'>ID de la línea *</label>
                <Input
                  value={generateIdFromName(name)}
                  disabled
                  className='bg-muted'
                />
              </div>
            </div>

            <div className='border-t pt-4'>
              <div className='flex items-center justify-between mb-3'>
                <h3 className='text-sm font-semibold'>Máquinas *</h3>
                <Button variant='outline' size='sm' onClick={addMachine}>
                  <Plus className='h-4 w-4 mr-1' />
                  Agregar máquina
                </Button>
              </div>

              {machines.map((machine, machineIdx) => (
                <div
                  key={machineIdx}
                  className='p-3 bg-muted rounded mb-3 space-y-2'
                >
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-semibold text-muted-foreground'>
                      Máquina #{machineIdx + 1}
                    </span>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => removeMachine(machineIdx)}
                    >
                      <Trash2 className='h-4 w-4 text-destructive' />
                    </Button>
                  </div>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-1'>
                      <label className='text-xs font-medium'>
                        Nombre del equipo *
                      </label>
                      <Input
                        value={machine.name}
                        onChange={(e) =>
                          updateMachineName(machineIdx, e.target.value)
                        }
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='text-xs font-medium'>
                        ID del equipo *
                      </label>
                      <Input
                        value={
                          machine.machineId
                            ? `${generateIdFromName(name)}-${machine.machineId}`
                            : ''
                        }
                        disabled
                        className='bg-muted'
                      />
                    </div>
                  </div>

                  <div className='pl-2 border-l-2 border-primary/20'>
                    <div className='flex items-center justify-between mb-1'>
                      <span className='text-xs font-medium text-muted-foreground'>
                        Insumos para mantenimiento
                      </span>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => addSupplyToMachine(machineIdx)}
                      >
                        <Plus className='h-3 w-3 mr-1' />
                        Agregar insumo
                      </Button>
                    </div>
                    {machine.supplies.map((sup, supIdx) => (
                      <div
                        key={supIdx}
                        className='flex flex-wrap items-end gap-2 mb-2'
                      >
                        <div className='space-y-1 flex-1 min-w-[140px]'>
                          <label className='text-xs text-muted-foreground'>
                            Insumo
                          </label>
                          <select
                            value={sup.supplyId}
                            onChange={(e) =>
                              updateMachineSupply(
                                machineIdx,
                                supIdx,
                                'supplyId',
                                e.target.value,
                              )
                            }
                            className='w-full h-8 px-2 rounded border border-input bg-background text-xs'
                          >
                            <option value=''>Seleccionar</option>
                            {supplies.map((sp) => (
                              <option key={sp.id} value={sp.id}>
                                {sp.name} ({sp.code})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='space-y-1 w-20'>
                          <label className='text-xs text-muted-foreground'>
                            Cant.
                          </label>
                          <Input
                            type='number'
                            min={0}
                            step={0.1}
                            className='h-8 text-xs'
                            value={sup.quantity}
                            onChange={(e) =>
                              updateMachineSupply(
                                machineIdx,
                                supIdx,
                                'quantity',
                                Number(e.target.value),
                              )
                            }
                          />
                        </div>
                        <div className='space-y-1 w-24'>
                          <label className='text-xs text-muted-foreground'>
                            Unidad
                          </label>
                          <Input
                            value={sup.unit}
                            disabled
                            className='h-8 text-xs disabled:opacity-60'
                          />
                        </div>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() =>
                            removeSupplyFromMachine(machineIdx, supIdx)
                          }
                        >
                          <Trash2 className='h-3 w-3 text-destructive' />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className='flex gap-2 pt-2'>
              <Button
                onClick={handleSave}
                disabled={!name || machines.every((m) => !m.name)}
              >
                {editingId ? 'Guardar cambios' : 'Crear línea'}
              </Button>
              <Button variant='outline' onClick={() => setOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

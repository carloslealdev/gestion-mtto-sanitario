import { useState } from 'react';
import Swal from 'sweetalert2';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getErrorMessage } from '@/lib/errors';
import {
  addSupplyAsync,
  updateSupplyAsync,
  deleteSupplyAsync,
  type Supply,
} from '@/store/slices/suppliesSlice';
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
import { unitOptions } from './constants';

export function InsumosSection() {
  const dispatch = useAppDispatch();
  const supplies = useAppSelector((s) => s.supplies.supplies);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [unit, setUnit] = useState<Supply['unit']>('pieza');
  const [optimalLevel, setOptimalLevel] = useState(0);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setUnit('pieza');
    setOptimalLevel(0);
    setOpen(true);
  };

  const openEdit = (s: Supply) => {
    setEditingId(s.id);
    setName(s.name);
    setCode(s.code);
    setUnit(s.unit);
    setOptimalLevel(s.optimalLevel ?? 0);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!name || !code) return;
    try {
      if (editingId) {
        await dispatch(
          updateSupplyAsync({ id: editingId, name, code, unit, optimalLevel }),
        ).unwrap();
        Swal.fire({
          icon: 'success',
          title: 'Insumo actualizado',
          text: `${name} ha sido actualizado exitosamente.`,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } else {
        await dispatch(
          addSupplyAsync({ name, code, unit, optimalLevel }),
        ).unwrap();
        Swal.fire({
          icon: 'success',
          title: 'Insumo creado',
          text: `${name} ha sido registrado exitosamente.`,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
      setOpen(false);
    } catch (err: unknown) {
      console.error('[NuevosRegistrosPage] handleSave supply failed:', err);
      const message = getErrorMessage(err, 'Error al guardar el insumo');
      Swal.fire({ icon: 'error', title: 'Error', text: message });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar insumo?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;
    try {
      await dispatch(deleteSupplyAsync(id)).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Insumo eliminado',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al eliminar el insumo';
      Swal.fire({ icon: 'error', title: 'Error', text: message });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Insumos</CardTitle>
            <Button onClick={openCreate}>
              <Plus className='h-4 w-4 mr-2' />
              Nuevo Insumo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {supplies.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              No hay insumos registrados
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-3 px-4 font-medium'>Nombre</th>
                    <th className='text-left py-3 px-4 font-medium'>Código</th>
                    <th className='text-left py-3 px-4 font-medium'>Unidad</th>
                    <th className='text-left py-3 px-4 font-medium'>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {supplies.map((s) => (
                    <tr key={s.id} className='border-b hover:bg-muted/50'>
                      <td className='py-3 px-4'>{s.name}</td>
                      <td className='py-3 px-4'>{s.code}</td>
                      <td className='py-3 px-4'>{s.unit}</td>
                      <td className='py-3 px-4'>
                        <div className='flex gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => openEdit(s)}
                          >
                            <Pencil className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleDelete(s.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Insumo' : 'Nuevo Insumo'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>Nombre del insumo *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>Código del insumo *</label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>Unidad *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as Supply['unit'])}
                className='w-full h-10 px-3 rounded-md border border-input bg-background text-sm'
              >
                {unitOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>Nivel óptimo</label>
              <Input
                type='number'
                min={0}
                value={optimalLevel || ''}
                onChange={(e) => setOptimalLevel(Number(e.target.value))}
              />
            </div>
            <div className='flex gap-2'>
              <Button onClick={handleSave} disabled={!name || !code}>
                {editingId ? 'Guardar cambios' : 'Crear insumo'}
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

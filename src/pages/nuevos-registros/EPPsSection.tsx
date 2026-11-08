import { useState } from 'react';
import Swal from 'sweetalert2';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getErrorMessage } from '@/lib/errors';
import {
  addEPPTypeAsync,
  updateEPPTypeAsync,
  deleteEPPTypeAsync,
  type EPPType,
} from '@/store/slices/eppTypesSlice';
import { fetchWorkers } from '@/store/slices/workersSlice';
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

export function EPPsSection() {
  const dispatch = useAppDispatch();
  const eppTypes = useAppSelector((s) => s.eppTypes.eppTypes);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [renewalTime, setRenewalTime] = useState(6);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setRenewalTime(6);
    setOpen(true);
  };

  const openEdit = (e: EPPType) => {
    setEditingId(e.id);
    setName(e.name);
    setCode(e.code);
    setRenewalTime(e.renewalTime);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!name || !code) return;
    try {
      if (editingId) {
        await dispatch(
          updateEPPTypeAsync({ id: editingId, name, code, renewalTime }),
        ).unwrap();
        Swal.fire({
          icon: 'success',
          title: 'EPP actualizado',
          text: `${name} ha sido actualizado exitosamente.`,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } else {
        await dispatch(addEPPTypeAsync({ name, code, renewalTime })).unwrap();
        dispatch(fetchWorkers());
        Swal.fire({
          icon: 'success',
          title: 'EPP creado',
          text: `${name} ha sido registrado exitosamente.`,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
      setOpen(false);
    } catch (err: unknown) {
      console.error('[NuevosRegistrosPage] handleSave EPP type failed:', err);
      const message = getErrorMessage(err, 'Error al guardar el EPP');
      Swal.fire({ icon: 'error', title: 'Error', text: message });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar EPP?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;
    try {
      await dispatch(deleteEPPTypeAsync(id)).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'EPP eliminado',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al eliminar el EPP';
      Swal.fire({ icon: 'error', title: 'Error', text: message });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>EPPs</CardTitle>
            <Button onClick={openCreate}>
              <Plus className='h-4 w-4 mr-2' />
              Nuevo EPP
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {eppTypes.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              No hay EPPs registrados
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-3 px-4 font-medium'>Nombre</th>
                    <th className='text-left py-3 px-4 font-medium'>Código</th>
                    <th className='text-left py-3 px-4 font-medium'>
                      Tiempo de Renovación
                    </th>
                    <th className='text-left py-3 px-4 font-medium'>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {eppTypes.map((e) => (
                    <tr key={e.id} className='border-b hover:bg-muted/50'>
                      <td className='py-3 px-4'>{e.name}</td>
                      <td className='py-3 px-4'>{e.code}</td>
                      <td className='py-3 px-4'>{e.renewalTime} meses</td>
                      <td className='py-3 px-4'>
                        <div className='flex gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => openEdit(e)}
                          >
                            <Pencil className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleDelete(e.id)}
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
            <DialogTitle>{editingId ? 'Editar EPP' : 'Nuevo EPP'}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>Nombre del EPP *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>Código del EPP *</label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>
                Tiempo de renovación *
              </label>
              <select
                value={renewalTime}
                onChange={(e) => setRenewalTime(Number(e.target.value))}
                className='w-full h-10 px-3 rounded-md border border-input bg-background text-sm'
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m} {m === 1 ? 'mes' : 'meses'}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex gap-2'>
              <Button onClick={handleSave} disabled={!name || !code}>
                {editingId ? 'Guardar cambios' : 'Crear EPP'}
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

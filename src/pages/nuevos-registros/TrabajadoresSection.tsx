import { useState } from 'react';
import Swal from 'sweetalert2';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  addWorkerAsync,
  updateFullWorkerAsync,
  deleteWorkerAsync,
  type WorkTeam,
  type WorkerRole,
} from '@/store/slices/workersSlice';
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
import type { EPPs } from '@/types/worker';
import { roleLabels, workTeamLabels } from './constants';
import {
  buildEmptyEpps,
  eppNameToKey,
  formatDate,
  generatePassword,
  isoFromDate,
  todayISO,
  type EPPFormEntry,
} from './helpers';

interface TrabajadorForm {
  firstName: string;
  lastName: string;
  cedula: string;
  fechaIngreso: string;
  workTeam: WorkTeam;
  role: WorkerRole;
  password: string;
  epps: Record<string, EPPFormEntry>;
}

export function TrabajadoresSection() {
  const dispatch = useAppDispatch();
  const workers = useAppSelector((s) => s.workers.workers);
  const eppTypes = useAppSelector((s) => s.eppTypes.eppTypes);
  const [open, setOpen] = useState(false);
  const [editingCedula, setEditingCedula] = useState<string | null>(null);
  const [form, setForm] = useState<TrabajadorForm>({
    firstName: '',
    lastName: '',
    cedula: '',
    fechaIngreso: '',
    workTeam: 'Sin asignar',
    role: 'trabajador-general',
    password: '',
    epps: {},
  });

  const isEditing = editingCedula !== null;

  const openCreate = () => {
    setEditingCedula(null);
    setForm({
      firstName: '',
      lastName: '',
      cedula: '',
      fechaIngreso: '',
      workTeam: 'Sin asignar',
      role: 'trabajador-general',
      password: '',
      epps: buildEmptyEpps(eppTypes),
    });
    setSaveError(null);
    setOpen(true);
  };

  const openEdit = (cedula: string) => {
    const w = workers.find((x) => x.cedula === cedula);
    if (!w) return;
    setEditingCedula(cedula);
    setSaveError(null);
    const workerEpps = w.epps as unknown as Record<
      string,
      {
        id?: string;
        lastRenewal?: string;
        nextRenewal?: string;
        notOwned?: boolean;
      }
    >;
    const epps: Record<string, EPPFormEntry> = {};
    for (const epp of eppTypes) {
      const key = epp.code;
      const legacyKey = eppNameToKey(epp.name);
      const e = workerEpps[key] || workerEpps[legacyKey];
      epps[key] = {
        id: epp.id,
        lastRenewal: e?.notOwned ? '' : formatDate(e?.lastRenewal || ''),
        notOwned: e?.notOwned || false,
      };
    }
    setForm({
      firstName: w.firstName,
      lastName: w.lastName,
      cedula: w.cedula,
      fechaIngreso: formatDate(w.fechaIngreso),
      workTeam: w.workTeam as WorkTeam,
      role: w.role as WorkerRole,
      password: '',
      epps,
    });
    setOpen(true);
  };

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.cedula || !form.fechaIngreso)
      return;
    if (!isEditing && !form.password) {
      setSaveError('La contraseña es obligatoria para crear el trabajador');
      return;
    }
    setSaveError(null);

    const eppsData: Record<
      string,
      {
        id: string;
        lastRenewal: string;
        nextRenewal: string;
        notOwned: boolean;
      }
    > = {};
    for (const epp of eppTypes) {
      const key = epp.code;
      const f = form.epps[key];
      if (f?.notOwned) {
        eppsData[key] = {
          id: epp.id,
          lastRenewal: '',
          nextRenewal: '',
          notOwned: true,
        };
      } else {
        const lastRenewal = f?.lastRenewal
          ? isoFromDate(f.lastRenewal)
          : todayISO();
        const d = new Date(lastRenewal);
        d.setMonth(d.getMonth() + epp.renewalTime);
        eppsData[key] = {
          id: epp.id,
          lastRenewal,
          nextRenewal: d.toISOString(),
          notOwned: false,
        };
      }
    }

    try {
      if (isEditing) {
        await dispatch(
          updateFullWorkerAsync({
            cedula: editingCedula!,
            data: {
              firstName: form.firstName,
              lastName: form.lastName,
              fechaIngreso: isoFromDate(form.fechaIngreso),
              workTeam: form.workTeam,
              role: form.role,
              epps: eppsData as unknown as EPPs,
            },
          }),
        ).unwrap();
        Swal.fire({
          icon: 'success',
          title: 'Trabajador actualizado',
          text: `${form.firstName} ${form.lastName} ha sido actualizado exitosamente.`,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } else {
        await dispatch(
          addWorkerAsync({
            firstName: form.firstName,
            lastName: form.lastName,
            cedula: form.cedula,
            fechaIngreso: isoFromDate(form.fechaIngreso),
            workTeam: form.workTeam,
            role: form.role,
            epps: eppsData as unknown as EPPs,
            password: form.password,
          }),
        ).unwrap();
        Swal.fire({
          icon: 'success',
          title: 'Trabajador creado',
          text: `${form.firstName} ${form.lastName} ha sido registrado exitosamente.`,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
      setOpen(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al guardar el trabajador';
      setSaveError(message);
    }
  };

  const handleDelete = async (cedula: string) => {
    const worker = workers.find((w) => w.cedula === cedula);
    const result = await Swal.fire({
      title: '¿Eliminar trabajador?',
      text: worker
        ? `${worker.firstName} ${worker.lastName} será eliminado permanentemente.`
        : 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;
    try {
      await dispatch(deleteWorkerAsync(cedula)).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Trabajador eliminado',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al eliminar el trabajador';
      Swal.fire({ icon: 'error', title: 'Error', text: message });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Trabajadores</CardTitle>
            <Button onClick={openCreate}>
              <Plus className='h-4 w-4 mr-2' />
              Nuevo Trabajador
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {workers.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              No hay trabajadores registrados
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-3 px-4 font-medium'>Nombre</th>
                    <th className='text-left py-3 px-4 font-medium'>
                      Apellido
                    </th>
                    <th className='text-left py-3 px-4 font-medium'>Cédula</th>
                    <th className='text-left py-3 px-4 font-medium'>Equipo</th>
                    <th className='text-left py-3 px-4 font-medium'>Rol</th>
                    <th className='text-left py-3 px-4 font-medium'>
                      Fecha Ingreso
                    </th>
                    <th className='text-left py-3 px-4 font-medium'>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((w) => (
                    <tr key={w.cedula} className='border-b hover:bg-muted/50'>
                      <td className='py-3 px-4'>{w.firstName}</td>
                      <td className='py-3 px-4'>{w.lastName}</td>
                      <td className='py-3 px-4'>{w.cedula}</td>
                      <td className='py-3 px-4'>
                        {workTeamLabels[w.workTeam] || w.workTeam}
                      </td>
                      <td className='py-3 px-4'>
                        {roleLabels[w.role] || w.role}
                      </td>
                      <td className='py-3 px-4 text-muted-foreground'>
                        {formatDate(w.fechaIngreso)}
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => openEdit(w.cedula)}
                          >
                            <Pencil className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleDelete(w.cedula)}
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
        <DialogContent className='max-w-2xl max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Trabajador' : 'Nuevo Trabajador'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <label className='text-sm font-medium'>Nombre *</label>
                <Input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />
              </div>
              <div className='space-y-1'>
                <label className='text-sm font-medium'>Apellido *</label>
                <Input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <label className='text-sm font-medium'>Cédula *</label>
                <Input
                  value={form.cedula}
                  onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                  disabled={isEditing}
                />
              </div>
              <div className='space-y-1'>
                <label className='text-sm font-medium'>
                  Fecha de Ingreso *
                </label>
                <Input
                  type='date'
                  value={form.fechaIngreso}
                  onChange={(e) =>
                    setForm({ ...form, fechaIngreso: e.target.value })
                  }
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <label className='text-sm font-medium'>Equipo</label>
                <select
                  value={form.workTeam}
                  onChange={(e) =>
                    setForm({ ...form, workTeam: e.target.value as WorkTeam })
                  }
                  className='w-full h-10 px-3 rounded-md border border-input bg-background text-sm'
                >
                  {Object.entries(workTeamLabels).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className='space-y-1'>
                <label className='text-sm font-medium'>Rol</label>
                <select
                  value={form.role}
                  disabled
                  className='w-full h-10 px-3 rounded-md border border-input bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <option value='trabajador-general'>General</option>
                  <option value='trabajador-encargado'>Encargado</option>
                </select>
              </div>
            </div>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>Contraseña</label>
              <div className='flex gap-2'>
                <Input
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder='Contraseña para iniciar sesión'
                />
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setForm({ ...form, password: generatePassword() })
                  }
                  className='shrink-0'
                >
                  Generar
                </Button>
              </div>
              <p className='text-xs text-muted-foreground'>
                El trabajador iniciará sesión con su cédula (sin V-) y esta
                contraseña
              </p>
            </div>
            <div className='border-t pt-4'>
              <h3 className='text-sm font-semibold mb-3'>EPPs que posee</h3>
              {eppTypes.length === 0 && (
                <p className='text-sm text-muted-foreground py-2'>
                  No hay tipos de EPP registrados en el sistema.
                </p>
              )}
              <div className='space-y-3'>
                {eppTypes.map((eppType) => {
                  const key = eppType.code;
                  const epp = form.epps[key] ?? {
                    lastRenewal: '',
                    notOwned: false,
                  };
                  return (
                    <div
                      key={key}
                      className='flex flex-wrap items-center gap-3 p-2 bg-muted rounded'
                    >
                      <span className='text-sm font-medium w-36'>
                        {eppType.name}
                      </span>
                      <label className='flex items-center gap-2 text-sm'>
                        <input
                          type='checkbox'
                          checked={epp.notOwned}
                          onChange={() => {
                            const updated = { ...form.epps };
                            const current = updated[key] ?? {
                              lastRenewal: '',
                              notOwned: false,
                            };
                            updated[key] = {
                              ...current,
                              notOwned: !current.notOwned,
                            };
                            setForm({ ...form, epps: updated });
                          }}
                        />
                        NO POSEE
                      </label>
                      {!epp.notOwned && (
                        <div className='flex items-center gap-2'>
                          <label className='text-xs text-muted-foreground'>
                            Última renovación:
                          </label>
                          <Input
                            type='date'
                            className='h-8 w-40 text-xs'
                            value={epp.lastRenewal}
                            onChange={(e) => {
                              const updated = { ...form.epps };
                              const current = updated[key] ?? {
                                lastRenewal: '',
                                notOwned: false,
                              };
                              updated[key] = {
                                ...current,
                                lastRenewal: e.target.value,
                              };
                              setForm({ ...form, epps: updated });
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {saveError && (
              <div className='text-sm text-destructive bg-destructive/10 p-3 rounded'>
                {saveError}
              </div>
            )}
            <div className='flex gap-2 pt-2'>
              <Button
                onClick={handleSave}
                disabled={
                  !form.firstName ||
                  !form.lastName ||
                  !form.cedula ||
                  !form.fechaIngreso
                }
              >
                {isEditing ? 'Guardar cambios' : 'Crear trabajador'}
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

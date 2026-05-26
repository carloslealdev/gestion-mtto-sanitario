import { useState } from 'react';
import Swal from 'sweetalert2';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  addWorkerAsync,
  updateFullWorkerAsync,
  deleteWorkerAsync,
  fetchWorkers,
  type WorkTeam,
  type WorkerRole,
} from '@/store/slices/workersSlice';
import {
  addSupplyAsync,
  updateSupplyAsync,
  deleteSupplyAsync,
  type Supply,
} from '@/store/slices/suppliesSlice';
import {
  addEPPTypeAsync,
  updateEPPTypeAsync,
  deleteEPPTypeAsync,
  type EPPType,
} from '@/store/slices/eppTypesSlice';
import {
  addProductionLineAsync,
  updateProductionLineAsync,
  deleteProductionLineAsync,
  type ProductionLine,
  type Machine,
} from '@/store/slices/productionLinesSlice';
import { generateIdFromName } from '@/helpers/normalize';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { EPPs } from '@/mock-data/workers';

type Tab = 'trabajadores' | 'lineas' | 'insumos' | 'epps';

const tabLabels: Record<Tab, string> = {
  trabajadores: 'Trabajadores',
  lineas: 'Líneas de Producción',
  insumos: 'Insumos',
  epps: 'EPPs',
};

const workTeamLabels: Record<string, string> = {
  G1: 'G1',
  G2: 'G2',
  G3: 'G3',
  TN: 'TN',
  'Sin asignar': 'Sin asignar',
};

const roleLabels: Record<string, string> = {
  'trabajador-encargado': 'Encargado',
  'trabajador-general': 'General',
};

const unitOptions = ['pieza', 'par', 'unidad', 'litro'] as const;

function eppNameToKey(name: string): string {
  return name.toLowerCase().replace(/[\s-]+/g, '_');
}

function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    return iso.split('T')[0];
  } catch {
    return iso;
  }
}

function isoFromDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  return new Date(dateStr).toISOString();
}

function todayISO(): string {
  return new Date().toISOString();
}

// ─── Trabajadores ───────────────────────────────────────────────
interface TrabajadorForm {
  firstName: string;
  lastName: string;
  cedula: string;
  fechaIngreso: string;
  workTeam: WorkTeam;
  role: WorkerRole;
  password: string;
  epps: Record<string, { id: string; lastRenewal: string; notOwned: boolean }>;
}

const generatePassword = () => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

function buildEmptyEpps(
  eppTypes: EPPType[],
): Record<string, { id: string; lastRenewal: string; notOwned: boolean }> {
  const epps: Record<
    string,
    { id: string; lastRenewal: string; notOwned: boolean }
  > = {};
  for (const epp of eppTypes) {
    epps[epp.code] = { id: epp.id, lastRenewal: '', notOwned: true };
  }
  return epps;
}

function TrabajadoresSection() {
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
    const epps: Record<
      string,
      { id: string; lastRenewal: string; notOwned: boolean }
    > = {};
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
            password: form.password || '123456',
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

// ─── Insumos ────────────────────────────────────────────────────
function InsumosSection() {
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
      const message =
        err instanceof Error ? err.message : 'Error al guardar el insumo';
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

// ─── EPPs ────────────────────────────────────────────────────────
function EPPsSection() {
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
      const message =
        err instanceof Error ? err.message : 'Error al guardar el EPP';
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

// ─── Líneas de Producción ─────────────────────────────────────
interface MachineForm {
  machineId: string;
  name: string;
  supplies: { supplyId: string; quantity: number; unit: string }[];
}

function LineasSection() {
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
      const message =
        err instanceof Error ? err.message : 'Error al guardar la línea';
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

// ─── Main Page ─────────────────────────────────────────────────
export default function NuevosRegistrosPage() {
  const [activeTab, setActiveTab] = useState<Tab>('trabajadores');
  const tabs: Tab[] = ['trabajadores', 'lineas', 'insumos', 'epps'];

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Registros</h1>
        <p className='text-muted-foreground'>
          Gestión de registros maestros del sistema
        </p>
      </div>

      <div className='flex gap-1 border-b'>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {activeTab === 'trabajadores' && <TrabajadoresSection />}
      {activeTab === 'lineas' && <LineasSection />}
      {activeTab === 'insumos' && <InsumosSection />}
      {activeTab === 'epps' && <EPPsSection />}
    </div>
  );
}

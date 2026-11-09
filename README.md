# Gestion MTTO Sanitario

Sistema de gestión de mantenimiento sanitario para equipos, trabajadores, EPPs y turnos de trabajo.

## Tecnologías

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v3** para estilos
- **shadcn/ui** para componentes base
- **React Router** para navegación
- **date-fns** para manejo de fechas
- **Lucide React** para iconos
- **Redux Toolkit** para estado global
- **Firebase Auth** para autenticación
- **Firebase Firestore** para persistencia de datos
- **Vitest** para tests unitarios
- **sweetalert2** para notificaciones y diálogos

## Estructura del Proyecto

```
gestion-mtto-sanitario/
├── .github/
│   └── workflows/
│       └── ci.yml                      # CI: lint + test + build
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx     # Layout con sidebar + header + Suspense
│   │   │   ├── Header.tsx              # Header con notificaciones, theme toggle y usuario
│   │   │   └── Sidebar.tsx             # Navegación lateral (responsive por rol)
│   │   ├── ui/                         # Componentes shadcn/ui
│   │   └── Login.tsx                   # Formulario de inicio de sesión (Firebase Auth)
│   ├── helpers/
│   │   ├── normalize.ts                # normalizeName, generateIdFromName, eppNameToKey
│   │   └── rotation.ts                 # Rotación de grupos (3 semanas: G1, G2, G3, TN)
│   ├── hooks/
│   │   ├── useAppTheme.tsx             # Hook para inicializar tema
│   │   └── useTheme.tsx                # Hook de tema (shadcn)
│   ├── lib/
│   │   ├── errors.ts                   # getErrorMessage para errores de RTK .unwrap()
│   │   ├── firebase.ts                 # Inicialización Firebase (auth + firestore)
│   │   ├── firestore.ts                # CRUD genérico + runTransaction
│   │   ├── inventory.ts                # Etiquetas de insumos de inventario
│   │   └── utils.ts                    # Función cn() para clases
│   ├── services/                       # Capa de acceso a Firestore
│   │   ├── authService.ts              # Firebase Auth + Firestore users CRUD
│   │   ├── calendarService.ts          # Calendario (mantenimientos por fecha)
│   │   ├── eppRequestsService.ts       # Solicitudes de EPPs
│   │   ├── eppReservationsService.ts   # Reservas de EPPs
│   │   ├── eppTypesService.ts          # Tipos de EPP dinámicos
│   │   ├── inventoryService.ts         # Inventario por grupo
│   │   ├── nightlyTasksService.ts      # Reportes de tareas nocturnas
│   │   ├── nightlyTasksUiService.ts    # Alcance del grupo nocturno (equipos por fecha)
│   │   ├── productionLinesService.ts   # Líneas de producción
│   │   ├── requestsService.ts          # Solicitudes de insumos
│   │   ├── reservationsService.ts      # Reservas de insumos
│   │   ├── suppliesService.ts          # Insumos (catálogo)
│   │   ├── taskAssignmentsService.ts   # Asignaciones de tareas diurnas por fecha
│   │   └── workersService.ts           # Trabajadores CRUD
│   ├── store/
│   │   ├── index.ts                    # Configuración del store
│   │   ├── hooks.ts                    # useAppDispatch, useAppSelector
│   │   └── slices/
│   │       ├── authSlice.ts            # Firebase Auth + initializing state
│   │       ├── calendarSlice.ts        # Mantenimientos del calendario (Firestore)
│   │       ├── eppSlice.ts             # Filtros de búsqueda EPPs (local state)
│   │       ├── eppRequestsSlice.ts     # Solicitudes de EPPs (Firestore async thunks)
│   │       ├── eppReservationsSlice.ts # Reservas de EPPs (Firestore async thunks)
│   │       ├── eppTypesSlice.ts        # Tipos de EPP dinámicos (Firestore)
│   │       ├── inventorySlice.ts       # Inventario por grupo (Firestore async thunks)
│   │       ├── mantenimientosSlice.ts  # Filtros de búsqueda líneas (local state)
│   │       ├── nightlyTasksSlice.ts    # Tareas nocturnas (Firestore async thunks)
│   │       ├── productionLinesSlice.ts # Líneas de producción (Firestore async thunks)
│   │       ├── requestsSlice.ts        # Solicitudes de insumos (Firestore async thunks)
│   │       ├── reservationsSlice.ts    # Reservas de insumos (Firestore async thunks)
│   │       ├── suppliesSlice.ts        # Insumos (Firestore async thunks)
│   │       ├── themeSlice.ts           # Tema claro/oscuro
│   │       └── workersSlice.ts         # Trabajadores (Firestore async thunks)
│   ├── types/
│   │   ├── inventory.ts                # Tipos de inventario por grupo
│   │   └── worker.ts                   # Tipos de EPPs del trabajador
│   ├── pages/
│   │   ├── DashboardPage.tsx           # Dashboard con indicadores desde Redux
│   │   ├── MantenimientosPage.tsx      # Insumos por línea desde Firestore con búsqueda
│   │   ├── GruposDeTrabajoPage.tsx     # Grupos con integrantes (filtrado por rol)
│   │   ├── GrupoDetallePage.tsx        # Context menu: cambiar rol/grupo (persiste Firestore)
│   │   ├── GestionEPPSPage.tsx         # EPPs por trabajador con estados (vigente/por vencer/vencido)
│   │   ├── InventariosPage.tsx         # Inventario por grupo con carga/eliminación
│   │   ├── CalendarioPage.tsx          # Calendario semanal + mantenimientos + alcance nocturno + tareas
│   │   ├── ReservasPage.tsx            # Reservas y solicitudes de insumos (admin + encargado)
│   │   ├── ReservasEPPsPage.tsx        # Reservas y solicitudes de EPPs (todos los roles)
│   │   ├── NuevosRegistrosPage.tsx     # CRUD: trabajadores, insumos, EPPs, líneas (admin)
│   │   └── ReportesTareasNocturnasPage.tsx # Reportes nocturnos (encargado)
│   ├── App.tsx                         # Auth listener + DataInitializer + Routing (lazy)
│   ├── main.tsx
│   └── index.css
├── firestore.rules                     # Reglas de seguridad de Firestore
├── firebase.json
├── tailwind.config.js
├── components.json
├── .env.template                       # Variables VITE_FIREBASE_* requeridas
└── package.json
```

## Autenticación

### Sistema

- **Firebase Auth** con patrón de email interno: `{cedula}@gestion-mtto.app`
- **Firestore `users/{uid}`** almacena: `email`, `name`, `role`, `username`
- **`initializing: true`** en `authSlice` suprime el flash de login al recargar
- **Creación de trabajadores**: usa REST API de Firebase Identity Toolkit directamente (sin auto-login), maneja `INVALID_LOGIN_CREDENTIALS` y `EMAIL_EXISTS` para recuperar cuentas existentes
- Las contraseñas las gestiona Firebase Auth; no se almacenan en Firestore

### Roles

| Rol           | Acceso                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **admin**     | Dashboard, Equipos, Mantenimientos, Calendario, Grupos, Inventarios, EPPs, Nuevos Registros, Reservas, Reportes                 |
| **encargado** | Calendario, Grupos (solo su grupo), Inventarios (solo su grupo), EPPs (solo su grupo), Reservas (solicitar), Reportes nocturnos |
| **general**   | Calendario, Grupos (solo su grupo), Inventarios (solo su grupo), EPPs (solo sus EPPs), Reservas de EPPs (solicitar)             |

### Rutas por Rol

| Rol       | Ruta Base    | Página Inicial |
| --------- | ------------ | -------------- |
| admin     | `/`          | Dashboard      |
| encargado | `/encargado` | Calendario     |
| general   | `/general`   | Calendario     |

## Persistencia

**Firebase Firestore** es la fuente de datos principal (el tema claro/oscuro se persiste en localStorage):

| Colección         | Uso                                                                   |
| ----------------- | --------------------------------------------------------------------- |
| `users`           | Usuarios y perfiles (`{uid}`)                                         |
| `workers`         | Trabajadores (`{cedula}`, contiene `uid`, `epps`, `workTeam`, `role`) |
| `supplies`        | Insumos registrados (con `name`, `code`, `unit`, `optimalLevel`)      |
| `eppTypes`        | Tipos de EPP con `name`, `code`, `renewalTime` (meses)                |
| `productionLines` | Líneas de producción con máquinas e insumos                           |
| `inventory`       | Inventario por grupo                                                  |
| `requests`        | Solicitudes de insumos (pendiente/aprobada/rechazada)                 |
| `reservations`    | Reservas de insumos                                                   |
| `eppRequests`     | Solicitudes de EPPs                                                   |
| `eppReservations` | Reservas de EPPs                                                      |
| `calendar`        | Mantenimientos del calendario                                         |
| `nightlyTasks`    | Reportes de tareas nocturnas                                          |
| `nightlyTasksUi`  | Alcance del grupo nocturno (equipos por `{dateKey}`)                  |
| `taskAssignments` | Asignaciones de tareas diurnas por `{dateKey}`                        |

## Funcionalidades Clave

### NuevosRegistrosPage (admin)

CRUD completo con persistencia a Firestore y notificaciones sweetalert2:

- **Trabajadores**: crea usuario Firebase Auth sin auto-login (REST API), asigna contraseña, persiste en Firestore. Campo `password` opcional. EPPs se agregan con `notOwned: true` por defecto.
- **Insumos**: alta/baja/modificación con `name`, `code`, `unit`, `optimalLevel`
- **EPPs**: tipos de EPP dinámicos con `name`, `code`, `renewalTime`; al crear uno nuevo, se agrega automáticamente a todos los trabajadores existentes
- **Líneas de Producción**: auto-generación de IDs (formato `LAM-001`), IDs de máquinas compuestos (`LAM-001-MAQ-002`), asignación de insumos requeridos por máquina

### EPPs Dinámicos

- Los tipos de EPP se gestionan desde la pestaña EPPs de NuevosRegistrosPage
- Cada EPP tiene: `name`, `code`, `renewalTime` (meses)
- La clave en el mapa `epps` del trabajador se deriva de `epp.code` (no de `eppNameToKey(name)`)
- Cada entrada de EPP en el trabajador tiene: `id`, `lastRenewal`, `nextRenewal`, `notOwned`
- La página GestionEPPSPage usa `eppTypes` del store para mostrar etiquetas e íconos dinámicos
- Estados: vigente (verde), por vencer ≤30 días (amarillo), vencido (rojo)

### GrupoDetallePage

- Context menu para cambiar rol y grupo de trabajadores
- Cambio de rol persiste en `users/{uid}.role` (via `updateUserProfile`) y `workers/{cedula}.role` (via `patchWorker`)
- Validación: máximo 1 encargado por grupo
- Cambio de grupo persiste en `workers/{cedula}` (via `patchWorker`)

### Renovación Automática de EPPs

Cuando un trabajador marca una reserva de EPPs como recibida:

- **Recibida completa**: todas las fechas de EPPs se actualizan
- **Recibida parcial**: solo los EPPs recibidos actualizan sus fechas
- `lastRenewal` se establece a la fecha actual
- `nextRenewal` se establece según `renewalTime` del tipo de EPP

### Flujo de Solicitudes y Reservas

- **Encargado/general** pueden crear solicitudes de insumos y EPPs
- **Admin** ve las solicitudes pendientes y puede aprobar (creando la reserva automáticamente) o rechazar
- Al aprobar con cambios, se guardan los `approvedItems` y se marcan diferencias en el detalle

### Calendario y Rotación

- Rotación de 3 semanas para grupos G1, G2, G3 con turnos diurno/nocturno/media jornada/libre
- TN (Turno Normal) trabaja lunes a viernes 7am-4pm, descansa fin de semana
- Admin puede registrar/eliminar mantenimientos en el calendario
- Sección "Alcance del grupo nocturno" visible para todos los roles (admin puede cargar/eliminar equipos)
- Sección "Distribución de tareas diurnas" para asignar equipos a grupos en mantenimiento
- Reportes del día anterior se pueden cargar al alcance nocturno del día actual

## Funcionalidades por Página

### DashboardPage

Indicadores desde Redux: total trabajadores, líneas, equipos, mantenimientos en curso (hoy), EPPs vencidos, grupos con inventario en 0 (con detalle de items agotados).

### CalendarioPage

Semana con turnos de todos los grupos (G1, G2, G3, TN). Registro/eliminación de mantenimientos (admin). Carga de alcance del grupo nocturno desde reportes del día anterior. Asignación de tareas diurnas a grupos.

### MantenimientosPage

Líneas de producción con máquinas e insumos requeridos, búsqueda por nombre. Datos desde `productionLines` Firestore.

### GestionEPPSPage

Trabajadores con sus EPPs, búsqueda/filtro por grupo. Muestra etiquetas e íconos desde `eppTypes` + fallbacks estáticos. Filtrado por rol: admin ve todos, encargado ve su grupo, general ve solo sus EPPs.

### InventariosPage

Inventario por grupo con estados (óptimo/bajo/sin stock) según `optimalLevel`. Admin puede cargar/corregir inventario desde insumos registrados.

### ReservasPage

Reservas de insumos con filtros por grupo/fecha/estado. Encargados pueden marcar recibida completa/parcial/cancelada. Admin genera reservas y gestiona solicitudes.

### ReservasEPPsPage

Reservas de EPPs por trabajador. Roles: admin gestiona todo, encargado ve su grupo, general ve sus propias reservas. Incluye talla para botas.

### ReportesTareasNocturnasPage

Reportes nocturnos con tipo (mantenimiento sanitario/otras tareas), equipos intervenidos y total de insumos. Solo encargado puede crear; admin y encargado pueden ver.

### NuevosRegistrosPage

Pestañas: Trabajadores, Insumos, EPPs, Líneas de Producción. CRUD completo con validaciones, confirmaciones y notificaciones.

## Rotación de Grupos

El sistema implementa un ciclo de rotación de 3 semanas:

| Semana \ Día | Lun        | Mar        | Mié        | Jue        | Vie        | Sáb   | Dom         |
| ------------ | ---------- | ---------- | ---------- | ---------- | ---------- | ----- | ----------- |
| **Semana 1** | G1:D, G2:N | G1:D, G2:N | G1:N, G3:D | G1:N, G3:D | G2:D, G3:N | G2:MJ | Todos libre |
| **Semana 2** | G2:D, G3:N | G2:D, G3:N | G1:D, G2:N | G1:D, G2:N | G1:N, G3:D | G3:MJ | Todos libre |
| **Semana 3** | G1:N, G3:D | G1:N, G3:D | G2:D, G3:N | G2:D, G3:N | G1:D, G2:N | G1:MJ | Todos libre |

**D**: Diurno (6am-6pm), **N**: Nocturno (6pm-6am), **MJ**: Media Jornada (6am-1pm)

TN trabaja diurno (7am-4pm) de lunes a viernes, descansa sábado y domingo.

## Comandos

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev

# Iniciar desarrollo exponiendo el host
npx vite --host

# Build para producción
npm run build

# Preview build
npm run preview

# Lint
npm run lint

# Tests (una corrida)
npm test

# Tests en modo watch
npm run test:watch
```

## Tests

Tests unitarios con **Vitest** sobre helpers puros y services críticos con Firestore mockeado:

- `src/helpers/normalize.test.ts`, `src/helpers/rotation.test.ts`
- `src/services/suppliesService.test.ts`, `reservationsService.test.ts`, `eppRequestsService.test.ts`
- `src/lib/firestore.test.ts` (límite de lectura de Firestore), `src/lib/validation.test.ts` (esquemas Zod), `src/lib/monitoring.test.ts` (registro de errores)

El CI (`.github/workflows/ci.yml`) corre `lint`, `test` y `build` en cada push y pull request.

## Operación en producción

### Backups de Firestore

La base de datos es la fuente de verdad de la operación: un borrado o un fallo de esquema no se revierten solos. El workflow **Firestore backup** (`.github/workflows/firestore-backup.yml`) exporta toda la base a un bucket de Google Cloud Storage una vez por día (05:00 UTC) y también bajo demanda desde la pestaña *Actions*.

Configuración única en el repositorio de GitHub:

1. Service account con `roles/datastore.importExportAdmin` y `roles/storage.admin` (o permisos de objeto sobre el bucket).
2. Clave JSON de esa cuenta guardada como secret `GCP_SERVICE_ACCOUNT_KEY`.
3. Variables del repositorio: `FIRESTORE_BACKUP_BUCKET` y `GCP_PROJECT_ID`.
4. Variable `ENABLE_FIRESTORE_BACKUPS` con valor `true`. Mientras no exista, el job queda **skipped** y el workflow no marca en rojo.

La exportación queda en `gs://BUCKET/firestore-backups/AAAA/MM/DD-HHMM`. Restauración con el mismo `gcloud`:

```bash
gcloud firestore import "gs://BUCKET/firestore-backups/2026/11/09-0500" --project=PROJECT_ID
```

### Monitoreo de errores

Todo error inesperado pasa por `src/lib/monitoring.ts` (`logError`):

- `console.error` estructurado (siempre).
- Buffer en memoria con los últimos 20 errores (`getRecentErrors()`), útil para soporte.
- Handlers globales de `window.error` y `unhandledrejection` instalados en `main.tsx`.
- Con la variable opcional `VITE_FIREBASE_MEASUREMENT_ID` (propiedad GA4 del proyecto), además se reporta como evento `exception` a Firebase Analytics. Sin esa variable, el reporte a Analytics queda desactivado y solo se registra en consola.

Los errores de render quedan visibles en pantalla gracias al `ErrorBoundary` global (`src/components/ErrorBoundary.tsx`): uno en la raíz de la app y otro por vista (dentro de `DashboardLayout`), así una página rota no tumba el resto del layout.

### Validación de datos (Zod)

`src/lib/validation.ts` valida cada documento leído de Firestore contra un esquema por colección (12 colecciones cubiertas, las que se leen vía `lib/firestore.ts`). La semántica es **registrar y conservar**: un documento que no cumple su esquema se reporta vía `logError` con colección, id e incidencias, pero se devuelve igual — la validación nunca hace desaparecer datos de las listas o reportes. Los esquemas están anclados a los tipos de dominio (`defineSchema<T>`), así que una deriva entre esquema y tipo rompe el build.

## Notas

- **Firebase**: copiá `.env.template` a `.env` y completá las variables `VITE_FIREBASE_*`
- **Reglas de Firestore**: `firestore.rules` define el acceso; se despliegan con Firebase CLI
- **Path aliases**: `@/` mapea a `src/`
- **Sidebar**: dinámico según rol del usuario
- **Rutas**: protegidas por rol en `App.tsx`; las páginas se cargan con `React.lazy` (code-splitting)
- **EPPs**: las claves en el trabajador se generan con `epp.code` (el código definido en el tipo de EPP)
- **IDs de líneas/máquinas**: se generan con `generateIdFromName(name)` (3 letras + `-` + 3 dígitos)

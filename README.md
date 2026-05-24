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
- **bcryptjs** para hash de contraseñas
- **sweetalert2** para notificaciones y diálogos

## Estructura del Proyecto

```
gestion-mtto-sanitario/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx    # Layout principal con sidebar + header
│   │   │   ├── Header.tsx              # Header con notificaciones, theme toggle y usuario
│   │   │   └── Sidebar.tsx             # Navegación lateral (responsive por rol)
│   │   ├── ui/                         # Componentes shadcn/ui
│   │   ├── Login.tsx                   # Formulario de inicio de sesión (Firebase Auth)
│   │   └── ProtectedRoute.tsx          # Protección de rutas por rol
│   ├── helpers/
│   │   ├── normalize.ts                # normalizeName, generateIdFromName, eppNameToKey
│   │   ├── rotation.ts                 # Lógica de rotación de grupos
│   │   └── seedMockReport.ts           # Generación de reportes mock
│   ├── hooks/
│   │   └── useAppTheme.tsx             # Hook para inicializar tema
│   ├── lib/
│   │   ├── crypto.ts                   # hashPassword / verifyPassword (bcryptjs)
│   │   ├── firebase.ts                 # Inicialización Firebase (auth + firestore)
│   │   ├── firestore.ts                # CRUD genérico para Firestore
│   │   └── utils.ts                    # Función cn() para clases
│   ├── services/                       # Capa de acceso a Firestore
│   │   ├── authService.ts              # Firebase Auth + Firestore users CRUD
│   │   ├── calendarService.ts
│   │   ├── eppRequestsService.ts
│   │   ├── eppReservationsService.ts
│   │   ├── eppTypesService.ts
│   │   ├── inventoryService.ts
│   │   ├── nightlyTasksService.ts
│   │   ├── productionLinesService.ts
│   │   ├── requestsService.ts
│   │   ├── reservationsService.ts
│   │   ├── suppliesService.ts
│   │   └── workersService.ts
│   ├── store/
│   │   ├── index.ts                    # Configuración del store
│   │   ├── hooks.ts                    # useAppDispatch, useAppSelector
│   │   └── slices/
│   │       ├── authSlice.ts            # Firebase Auth + initializing state
│   │       ├── calendarSlice.ts
│   │       ├── eppSlice.ts             # Filtros de búsqueda EPPs
│   │       ├── eppRequestsSlice.ts     # Solicitudes de EPPs (Firestore)
│   │       ├── eppReservationsSlice.ts # Reservas de EPPs (Firestore)
│   │       ├── eppTypesSlice.ts        # Tipos de EPP dinámicos (Firestore)
│   │       ├── inventorySlice.ts       # Inventario (Firestore)
│   │       ├── mantenimientosSlice.ts  # Filtros de búsqueda líneas
│   │       ├── nightlyTasksSlice.ts    # Tareas nocturnas (Firestore)
│   │       ├── productionLinesSlice.ts # Líneas de producción + async thunks Firestore
│   │       ├── requestsSlice.ts        # Solicitudes de insumos (Firestore)
│   │       ├── reservationsSlice.ts    # Reservas de insumos (Firestore)
│   │       ├── suppliesSlice.ts        # Insumos (Firestore)
│   │       ├── themeSlice.ts           # Tema claro/oscuro
│   │       ├── workerCredentialsSlice.ts
│   │       └── workersSlice.ts         # Trabajadores + async thunks Firestore
│   ├── mock-data/                      # Datos de semilla (solo tipos/seed)
│   │   ├── workers.ts                  # Interface EPPs, Worker; seed data
│   │   ├── inventory.ts
│   │   ├── productionLines.ts
│   │   └── users.ts
│   ├── pages/
│   │   ├── DashboardPage.tsx           # Dashboard con indicadores (Redux)
│   │   ├── EquiposPage.tsx
│   │   ├── MantenimientosPage.tsx      # Insumos por línea (desde Firestore)
│   │   ├── GruposDeTrabajoPage.tsx
│   │   ├── GrupoDetallePage.tsx        # Cambio de rol/grupo persiste en Firestore
│   │   ├── GestionEPPSPage.tsx         # Gestión de EPPs dinámicos
│   │   ├── InventariosPage.tsx
│   │   ├── CalendarioPage.tsx          # Calendario semanal (Redux)
│   │   ├── ReservasPage.tsx            # Reservas de insumos (admin/encargado)
│   │   ├── ReservasEPPsPage.tsx        # Reservas de EPPs
│   │   ├── NuevosRegistrosPage.tsx     # CRUD: trabajadores, insumos, EPPs, líneas
│   │   └── ReportesTareasNocturnasPage.tsx
│   ├── App.tsx                         # Firebase Auth listener + DataInitializer
│   ├── main.tsx
│   └── index.css
├── tailwind.config.js
├── components.json
├── .env                                # VITE_FIREBASE_API_KEY, etc.
└── package.json
```

## Autenticación

### Sistema
- **Firebase Auth** con patrón de email interno: `{cedula}@gestion-mtto.app`
- **Firestore `users/{uid}`** almacena: `email`, `name`, `role`, `username`, `password` (hasheado con bcryptjs)
- **`initializing: true`** en `authSlice` suprime el flash de login al recargar
- **Admin auto-bootstrap**: al iniciar sesión con `admin` / `123456` se crea automáticamente el usuario en Firebase Auth si no existe

### Roles

| Rol | Acceso |
|-----|--------|
| **admin** | Dashboard, Equipos, Mantenimientos, Calendario, Grupos, Inventarios, EPPs, Nuevos Registros |
| **encargado** | Calendario, Grupos (solo su grupo), Inventarios (solo su grupo), EPPs (solo su grupo) |
| **general** | Calendario, Grupos (solo su grupo), Inventarios (solo su grupo), EPPs (solo su grupo) |

### Credenciales

- **Admin**: `admin` / `123456`
- **Trabajadores**: cédula sin prefijo `V-` / `123456` (ej: `12345678`)

### Rutas por Rol

| Rol | Ruta Base | Página Inicial |
|-----|-----------|----------------|
| admin | `/` | Dashboard |
| encargado | `/encargado` | Calendario |
| general | `/general` | Calendario |

## Persistencia

**Firebase Firestore** es la fuente de datos principal (no localStorage):

| Colección | Uso |
|-----------|-----|
| `users` | Usuarios y perfiles (`{uid}`) |
| `workers` | Trabajadores (`{cedula}`, contiene `uid`, `epps`) |
| `supplies` | Insumos registrados |
| `eppTypes` | Tipos de EPP con `name`, `code`, `renewalTime` |
| `productionLines` | Líneas de producción con máquinas e insumos |
| `inventory` | Inventario por grupo |
| `requests` | Solicitudes de insumos |
| `reservations` | Reservas de insumos |
| `eppRequests` | Solicitudes de EPPs |
| `eppReservations` | Reservas de EPPs |
| `calendar` | Mantenimientos del calendario |
| `nightlyTasks` | Tareas nocturnas |

## Funcionalidades Clave

### NuevosRegistrosPage (admin)
CRUD completo con persistencia a Firestore y notificaciones sweetalert2:
- **Trabajadores**: crea usuario Firebase Auth sin auto-login (REST API), asigna contraseña, persiste en Firestore
- **Insumos**: alta/baja/modificación de insumos
- **EPPs**: tipos de EPP dinámicos; al crear uno nuevo, se agrega automáticamente `{lastRenewal: "", nextRenewal: "", notOwned: true}` a todos los trabajadores existentes
- **Líneas de Producción**: auto-generación de IDs (formato `LAM-001`), IDs de máquinas compuestos (`LAM-001-MAQ-002`), persistencia en Firestore

### EPPs Dinámicos
- Los tipos de EPP se gestionan desde la pestaña EPPs de NuevosRegistrosPage
- Cada EPP tiene: `name`, `code`, `renewalTime` (meses)
- La clave en el mapa `epps` del trabajador se deriva del nombre (`eppNameToKey`)
- La página GestionEPPSPage usa `eppTypes` del store para mostrar etiquetas e íconos dinámicos

### GrupoDetallePage
- Cambio de rol y equipo persiste en `users/{uid}` (via `updateUserProfile`) y `workers/{cedula}` (via `patchWorker`)

### Renovación Automática de EPPs
Cuando un trabajador marca una reserva de EPPs como recibida:
- **Recibida completa**: todas las fechas de EPPs se actualizan
- **Recibida parcial**: solo los EPPs recibidos actualizan sus fechas
- `lastRenewal` se establece a la fecha actual
- `nextRenewal` se establece según `renewalTime` del tipo de EPP

## Funcionalidades por Página

### DashboardPage
Indicadores desde Redux: trabajadores, líneas, equipos, mantenimientos en curso, EPPs vencidos, inventario en 0.

### CalendarioPage
Semana con turnos de todos los grupos. Registro/eliminación de mantenimientos (admin).

### MantenimientosPage
Líneas de producción con máquinas e insumos requeridos, búsqueda por nombre. Datos desde `productionLines` Firestore.

### GestionEPPSPage
Trabajadores con sus EPPs, búsqueda/filtro por grupo. Muestra etiquetas e íconos desde `eppTypes` + fallbacks estáticos. Estados: vigente/por vencer/vencido.

### NuevosRegistrosPage
CRUD completo con Firestore. Incluye validaciones, modales de confirmación y notificaciones sweetalert2.

## Comandos

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev

# Build para producción
npm run build

# Preview build
npm run preview
```

## Notas

- **Firebase**: requiere archivo `.env` con `VITE_FIREBASE_API_KEY` y demás variables de Firebase
- **Contraseñas**: se hashean con bcryptjs antes de almacenar en Firestore
- **Admin bootstrap**: al primer login con `admin` / `123456` se crea el usuario en Firebase Auth automáticamente
- **Path aliases**: `@/` mapea a `src/`
- **Sidebar**: dinámico según rol del usuario
- **Rutas**: protegidas por `ProtectedRoute.tsx`, redirigen según rol
- **EPPs**: las claves en el trabajador se generan con `eppNameToKey(name)` (lowercase, spaces → underscores)
- **IDs de líneas/máquinas**: se generan con `generateIdFromName(name)` (3 letras + `-` + 3 dígitos)

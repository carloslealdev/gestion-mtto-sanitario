# Gestion MTTO Sanitario

Sistema de gestion de mantenimiento sanitario para equipos, trabajadores y turnos de trabajo.

## Tecnologias

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v3** para estilos
- **shadcn/ui** para componentes base
- **React Router** para navegacion
- **date-fns** para manejo de fechas
- **Lucide React** para iconos
- **Redux Toolkit** para estado global con persistencia

## Estructura del Proyecto

```
gestion-mtto-sanitario/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx    # Layout principal con sidebar + header
│   │   │   ├── Header.tsx              # Header con notificaciones, theme toggle y usuario
│   │   │   └── Sidebar.tsx             # Navegacion lateral (responsive)
│   │   ├── ui/                         # Componentes shadcn/ui
│   │   ├── Login.tsx                   # Formulario de inicio de sesion
│   │   └── ProtectedRoute.tsx          # Proteccion de rutas por rol
│   ├── store/
│   │   ├── index.ts                    # Configuracion del store
│   │   ├── hooks.ts                     # useAppDispatch, useAppSelector
│   │   └── slices/
│   │       ├── authSlice.ts            # Autenticacion y roles de usuario
│   │       ├── calendarSlice.ts         # Mantenimientos del calendario
│   │       ├── eppSlice.ts              # Filtros de busqueda EPPs
│   │       ├── mantenimientosSlice.ts   # Filtros de busqueda lineas
│   │       ├── themeSlice.ts             # Tema claro/oscuro
│   │       └── workersSlice.ts           # Datos de trabajadores (rol/grupo)
│   ├── helpers/
│   │   ├── rotation.ts                  # Logica de rotacion de grupos
│   │   └── normalize.ts                 # Normalizacion de nombres
│   ├── hooks/
│   │   └── useAppTheme.tsx              # Hook para inicializar tema
│   ├── lib/
│   │   └── utils.ts                     # Funcion cn() para clases
│   ├── mock-data/
│   │   ├── workers.ts                   # Datos de trabajadores con EPPs
│   │   ├── inventory.ts                 # Inventario de insumos por grupo
│   │   ├── productionLines.ts          # Lineas de produccion y maquinas
│   │   └── users.ts                     # Usuarios para autenticacion
│   ├── pages/
│   │   ├── DashboardPage.tsx            # Dashboard con indicadores
│   │   ├── EquiposPage.tsx              # Gestion de equipos
│   │   ├── MantenimientosPage.tsx       # Insumos requeridos por linea
│   │   ├── GruposDeTrabajoPage.tsx      # Lista de grupos de trabajo
│   │   ├── GrupoDetallePage.tsx        # Detalle de grupo (click derecho para admin)
│   │   ├── GestionEPPSPage.tsx         # Gestion de EPPs por trabajador
│   │   ├── InventariosPage.tsx          # Inventario de insumos por grupo
│   │   └── CalendarioPage.tsx           # Calendario semanal de turnos y mantenimientos
│   ├── App.tsx                          # Configuracion de rutas
│   ├── main.tsx                         # Entry point
│   └── index.css                        # Estilos Tailwind + variables CSS
├── tailwind.config.js
├── components.json                      # Configuracion shadcn/ui
└── package.json
```

## Sistema de Autenticacion

### Roles de Usuario

| Rol | Acceso |
|-----|--------|
| **admin** | Dashboard, Equipos, Mantenimientos, Calendario, Grupos, Inventarios, EPPs |
| **encargado** | Calendario, Grupos (solo su grupo), Inventarios (solo su grupo), EPPs (solo su grupo) |
| **general** | Calendario, Grupos (solo su grupo), Inventarios (solo su grupo), EPPs (solo su grupo) |

### Credenciales de Prueba

- **Admin**: `admin` / `123456`
- **Encargado**: `[cedula]` / `123456` (ej: `12345678`)
- **General**: `[cedula]` / `123456` (ej: `23456789`)

### Rutas por Rol

| Rol | Ruta Base | Pagina Inicial |
|-----|-----------|----------------|
| admin | `/` | Dashboard |
| encargad | `/encargado` | Calendario |
| general | `/general` | Calendario |

### Persistencia

Todos los estados se persisten en localStorage:
- `authState` - Sesion de usuario
- `calendarState` - Mantenimientos del calendario
- `mantenimientosState` - Filtro de busqueda
- `eppState` - Filtros de busqueda EPPs
- `theme` - Tema claro/oscuro
- `workersState` - Modificaciones de trabajadores

## Mock Data

### Workers (workers.ts)
- 16 trabajadores en 4 grupos (G1, G2, G3, TN)
- Cada grupo tiene 1 encargado + 3 generales
- EPPs: casco, lentes, botas, auditivo, fullFace
- Fechas con estados: vigente, por vencer, vencido

### Production Lines (productionLines.ts)
- 15 lineas de produccion: Laminacion 1-6, Molienda 1-6, Desgerminacion 1-3
- 4 maquinas por linea con insumos requeridos
- Insumos: traje_antiderrame, guantes, esponjas, gerdex

### Users (users.ts)
- 17 usuarios: 1 admin + 16 trabajadores
- Username: cedula sin prefijo "V-" (ej: 12345678)
- Password: 123456 para todos

### Inventory (inventory.ts)
- 7 items por grupo: trajes_anti_derrame, guantes, esponjas, gerdex, espatulas, manguera_aire_comprimido, manguera_de_agua
- Estados: optimo, bajo, sin_stock

### Rotacion (rotation.ts)
Logica de turnos:
- **TN**: Lunes-viernes 7am-4pm, sab/dom descanso
- **G1, G2, G3**: Rotacion de 3 semanas
  - DIURNO: 6am - 6pm
  - NOCTURNO: 6pm - 6am
  - MEDIA_JORNADA: 6am - 1pm
  - LIBRE/DESCANSO

## Funcionalidades por Pagina

### DashboardPage
Indicadores:
- Trabajadores registrados
- Lineas de produccion
- Equipos en planta
- Mantenimiento en curso (grupos que intervienen)
- EPPs vencidos
- Grupos con inventario en 0

### CalendarioPage
- Semana con turnos de todos los grupos
- Registro de mantenimientos (solo admin)
- Eliminacion de mantenimientos (solo admin)
- Mantenimientos de hoy resaltados

### GruposDeTrabajoPage
- Lista de grupos (admin: todos, encargado/general: solo su grupo)
- Boton "Mas info" para ver detalle
- workers: rol, nombre, cantidad

### GrupoDetallePage
- Cards de trabajadores del grupo
- Click derecho para modificar (solo admin)
- Cambiar rol: trabajador-encargado / trabajador-general
- Cambiar grupo: G1, G2, G3, TN

### InventariosPage
- Inventario por grupo (admin: todos, encargado/general: solo su grupo)
- Items con indicadores de estado (optimo/bajo/sin_stock)

### GestionEPPSPage
- Trabajadoress con EPPs (admin: todos, encargado/general: solo su grupo)
- Busqueda por cedula/nombre
- Filtro por grupo (admin)
- Grid de EPPs con estado: vigente/por vencer/vencido

### MantenimientosPage
- Lista de lineas de produccion con sus maquinas
- Insumos requeridos por cada maquina
- Busqueda por nombre de linea

## Comandos

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev

# Build para produccion
npm run build

# Preview build
npm run preview
```

## Notas

- El proyecto usa variables CSS para theming (shadcn/ui default)
- Las modificaciones de trabajadores persisten en localStorage
- Las fechas de EPPs tienen como referencia el 11 mayo 2026
- Configuracion de TypeScript con path aliases (@/)
- Sidebar es dinamico segun el rol del usuario
- Las rutas estan protegidas y redirigen segun el rol
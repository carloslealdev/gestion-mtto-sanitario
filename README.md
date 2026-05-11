# Gestion MTTO Sanitario

Sistema de gestion de mantenimiento sanitario para equipos, trabajadores y turnos de trabajo.

## Tecnologias

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v3** para estilos
- **shadcn/ui** para componentes base
- **React Router** para navegacion
- **date-fns** para manejo de fechas
- **Lucide React** para iconos

## Estructura del Proyecto

```
gestion-mtto-sanitario/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx    # Layout principal con sidebar + header
│   │   │   ├── Header.tsx              # Header con notificaciones y theme toggle
│   │   │   └── Sidebar.tsx             # Navegacion lateral (responsive)
│   │   └── ui/                         # Componentes shadcn/ui
│   ├── helpers/
│   │   └── rotation.ts                 # Logica de rotacion de grupos
│   ├── hooks/
│   │   └── useTheme.tsx                # Provider para modo oscuro/claro
│   ├── lib/
│   │   └── utils.ts                    # Funcion cn() para clases
│   ├── mock-data/
│   │   ├── workers.ts                  # Datos de trabajadores con EPPs
│   │   └── inventory.ts               # Inventario de insumos por grupo
│   ├── pages/
│   │   ├── DashboardPage.tsx           # Dashboard principal
│   │   ├── EquiposPage.tsx             # Gestion de equipos
│   │   ├── MantenimientosPage.tsx      # Ordenes de mantenimiento
│   │   ├── GruposDeTrabajoPage.tsx    # Lista de grupos de trabajo
│   │   ├── GrupoDetallePage.tsx       # Detalle de grupo (click derecho para editar)
│   │   ├── GestionEPPSPage.tsx        # Gestion de EPPs por trabajador
│   │   ├── InventariosPage.tsx       # Inventario de insumos por grupo
│   │   └── CalendarioPage.tsx         # Calendario semanal de turnos
│   ├── App.tsx                         # Configuracion de rutas
│   ├── main.tsx                        # Entry point
│   └── index.css                       # Estilos Tailwind + variables CSS
├── tailwind.config.js
├── components.json                     # Configuracion shadcn/ui
└── package.json
```

## Rutas del Sistema

| Ruta | Descripcion |
|------|-------------|
| `/` | Dashboard principal |
| `/equipos` | Gestion de equipos |
| `/mantenimientos` | Ordenes de trabajo |
| `/calendario` | Calendario semanal de turnos |
| `/grupos-de-trabajo` | Lista de grupos (G1, G2, G3, TN) |
| `/grupos-de-trabajo/:teamId` | Detalle de grupo especifico |
| `/gestion-epps-trabajadores` | Control de EPPs por trabajador |
| `/inventarios-de-grupos` | Inventario de insumos |

## Mock Data

### Workers (workers.ts)
- 16 trabajadores en 4 grupos (G1, G2, G3, TN)
- Cada grupo tiene 1 encargado + 3 generales
- EPPs: casco, lentes, botas, auditivo, fullFace
- Fechas con estados: vigente, por vencer, vencido

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

## Componentes Importantes

### Sidebar
- Navegacion con iconos Lucide
- Responsive: fijo en desktop, Sheet (drawer) en mobile
- Items: Dashboard, Calendario, Grupos de Trabajo, Inventarios, EPPs, Mantenimientos

### Header
- Theme toggle (switch light/dark)
- Dropdown de notificaciones (3 items)
- Avatar de usuario

### GrupoDetallePage
- Cards de trabajadores con click derecho
- Menu contextual para cambiar rol y grupo
- Restricciones: solo 1 encargado por grupo

### GestionEPPSPage
- Busqueda por cedula, nombre o grupo
- Filtro por grupo
- Grid 2x2 de EPPs con iconos y badges de estado

### InventariosPage
- Cards por grupo con todos los items
- Indicadores de estado: verde/amarillo/rojo

### CalendarioPage
- Semana actual con navegacion
- Cards diarios con horarios de todos los grupos
- Hoy resaltado
- Leyenda de turnos

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
- Las modificaciones enGrupoDetallePage son en memoria (no persisten)
- Las fechas de EPPs都以 11 mayo 2026 como referencia
- Configuracion de TypeScript con path aliases (@/)
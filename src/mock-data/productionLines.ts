export interface SupplyRequired {
  supply: string
  quantity: number
  unit: string
}

export interface Machine {
  machineId: string
  name: string
  supplies_required: SupplyRequired[]
}

export interface ProductionLine {
  id: number
  name: string
  machines: Machine[]
}

const laminacionMachines: Machine[] = [
  {
    machineId: "M-LAM-001",
    name: "sinfines_transportadores",
    supplies_required: [
      { supply: "traje_antiderrame", quantity: 2, unit: "piezas" },
      { supply: "guantes", quantity: 2, unit: "par" },
      { supply: "esponjas", quantity: 5, unit: "unidades" },
      { supply: "gerdex", quantity: 1, unit: "litro" },
    ],
  },
  {
    machineId: "M-LAM-002",
    name: "rodillos_laminadores",
    supplies_required: [
      { supply: "traje_antiderrame", quantity: 1, unit: "piezas" },
      { supply: "guantes", quantity: 1, unit: "par" },
      { supply: "esponjas", quantity: 3, unit: "unidades" },
      { supply: "gerdex", quantity: 0.5, unit: "litro" },
    ],
  },
  {
    machineId: "M-LAM-003",
    name: "tolvas_alimentadoras",
    supplies_required: [
      { supply: "traje_antiderrame", quantity: 2, unit: "piezas" },
      { supply: "guantes", quantity: 2, unit: "par" },
      { supply: "esponjas", quantity: 4, unit: "unidades" },
      { supply: "gerdex", quantity: 2, unit: "litro" },
    ],
  },
  {
    machineId: "M-LAM-004",
    name: "cabinas_encapsulado",
    supplies_required: [
      { supply: "traje_antiderrame", quantity: 1, unit: "piezas" },
      { supply: "guantes", quantity: 2, unit: "par" },
      { supply: "esponjas", quantity: 2, unit: "unidades" },
      { supply: "gerdex", quantity: 1, unit: "litro" },
    ],
  },
]

const moliendaMachines: Machine[] = [
  {
    machineId: "M-MOL-001",
    name: "molinos_primarios",
    supplies_required: [
      { supply: "traje_antiderrame", quantity: 3, unit: "piezas" },
      { supply: "guantes", quantity: 3, unit: "par" },
      { supply: "esponjas", quantity: 6, unit: "unidades" },
      { supply: "gerdex", quantity: 2, unit: "litro" },
    ],
  },
  {
    machineId: "M-MOL-002",
    name: "alimentadores_tornillo",
    supplies_required: [
      { supply: "traje_antiderrame", quantity: 2, unit: "piezas" },
      { supply: "guantes", quantity: 2, unit: "par" },
      { supply: "esponjas", quantity: 4, unit: "unidades" },
      { supply: "gerdex", quantity: 1.5, unit: "litro" },
    ],
  },
  {
    machineId: "M-MOL-003",
    name: "clasificadores_cribas",
    supplies_required: [
      { supply: "traje_antiderrame", quantity: 2, unit: "piezas" },
      { supply: "guantes", quantity: 2, unit: "par" },
      { supply: "esponjas", quantity: 3, unit: "unidades" },
      { supply: "gerdex", quantity: 1, unit: "litro" },
    ],
  },
  {
    machineId: "M-MOL-004",
    name: "desempolvadores",
    supplies_required: [
      { supply: "traje_antiderrame", quantity: 1, unit: "piezas" },
      { supply: "guantes", quantity: 1, unit: "par" },
      { supply: "esponjas", quantity: 2, unit: "unidades" },
      { supply: "gerdex", quantity: 0.5, unit: "litro" },
    ],
  },
]

const desgerminacionMachines: Machine[] = [
  {
    machineId: "M-DES-001",
    name: "centrifugas_separadoras",
    supplies_required: [
      { supply: "traje_antiderrame", quantity: 3, unit: "piezas" },
      { supply: "guantes", quantity: 3, unit: "par" },
      { supply: "esponjas", quantity: 5, unit: "unidades" },
      { supply: "gerdex", quantity: 3, unit: "litro" },
    ],
  },
  {
    machineId: "M-DES-002",
    name: "filtros_prensas",
    supplies_required: [
      { supply: "traje_antiderrame", quantity: 2, unit: "piezas" },
      { supply: "guantes", quantity: 2, unit: "par" },
      { supply: "esponjas", quantity: 4, unit: "unidades" },
      { supply: "gerdex", quantity: 2, unit: "litro" },
    ],
  },
  {
    machineId: "M-DES-003",
    name: "mezcladoras_industriales",
    supplies_required: [
      { supply: "traje_antiderrame", quantity: 2, unit: "piezas" },
      { supply: "guantes", quantity: 2, unit: "par" },
      { supply: "esponjas", quantity: 3, unit: "unidades" },
      { supply: "gerdex", quantity: 1.5, unit: "litro" },
    ],
  },
  {
    machineId: "M-DES-004",
    name: "bombas_centrifugas",
    supplies_required: [
      { supply: "traje_antiderrame", quantity: 1, unit: "piezas" },
      { supply: "guantes", quantity: 1, unit: "par" },
      { supply: "esponjas", quantity: 2, unit: "unidades" },
      { supply: "gerdex", quantity: 1, unit: "litro" },
    ],
  },
]

export const productionLines: ProductionLine[] = [
  { id: 1, name: "Laminación 1", machines: laminacionMachines },
  { id: 2, name: "Laminación 2", machines: laminacionMachines },
  { id: 3, name: "Laminación 3", machines: laminacionMachines },
  { id: 4, name: "Laminación 4", machines: laminacionMachines },
  { id: 5, name: "Laminación 5", machines: laminacionMachines },
  { id: 6, name: "Laminación 6", machines: laminacionMachines },
  { id: 7, name: "Molienda 1", machines: moliendaMachines },
  { id: 8, name: "Molienda 2", machines: moliendaMachines },
  { id: 9, name: "Molienda 3", machines: moliendaMachines },
  { id: 10, name: "Molienda 4", machines: moliendaMachines },
  { id: 11, name: "Molienda 5", machines: moliendaMachines },
  { id: 12, name: "Molienda 6", machines: moliendaMachines },
  { id: 13, name: "Desgerminación 1", machines: desgerminacionMachines },
  { id: 14, name: "Desgerminación 2", machines: desgerminacionMachines },
  { id: 15, name: "Desgerminación 3", machines: desgerminacionMachines },
]
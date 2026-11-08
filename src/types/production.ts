export interface SupplyRequired {
  supplyId: string
  supplyName: string
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
  lineId: string
  machines: Machine[]
}

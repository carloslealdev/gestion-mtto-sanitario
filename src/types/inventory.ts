export interface InventoryItem {
  quantity: number
}

export interface GroupInventory {
  trajes_anti_derrame: InventoryItem
  guantes: InventoryItem
  esponjas: InventoryItem
  gerdex: InventoryItem
  espatulas: InventoryItem
  manguera_aire_comprimido: InventoryItem
  manguera_de_agua: InventoryItem
}

export type InventoryStatus = "optimo" | "bajo" | "sin_stock"

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

export interface Inventory {
  G1: GroupInventory
  G2: GroupInventory
  G3: GroupInventory
  TN: GroupInventory
}

export const inventory: Inventory = {
  G1: {
    trajes_anti_derrame: { quantity: 15 },
    guantes: { quantity: 150 },
    esponjas: { quantity: 60 },
    gerdex: { quantity: 25 },
    espatulas: { quantity: 35 },
    manguera_aire_comprimido: { quantity: 5 },
    manguera_de_agua: { quantity: 3 }
  },
  G2: {
    trajes_anti_derrame: { quantity: 8 },
    guantes: { quantity: 30 },
    esponjas: { quantity: 12 },
    gerdex: { quantity: 5 },
    espatulas: { quantity: 18 },
    manguera_aire_comprimido: { quantity: 1 },
    manguera_de_agua: { quantity: 0 }
  },
  G3: {
    trajes_anti_derrame: { quantity: 0 },
    guantes: { quantity: 0 },
    esponjas: { quantity: 0 },
    gerdex: { quantity: 0 },
    espatulas: { quantity: 0 },
    manguera_aire_comprimido: { quantity: 0 },
    manguera_de_agua: { quantity: 0 }
  },
  TN: {
    trajes_anti_derrame: { quantity: 20 },
    guantes: { quantity: 200 },
    esponjas: { quantity: 80 },
    gerdex: { quantity: 40 },
    espatulas: { quantity: 50 },
    manguera_aire_comprimido: { quantity: 8 },
    manguera_de_agua: { quantity: 7 }
  }
}

export const inventoryLabels: Record<string, string> = {
  trajes_anti_derrame: "Trajes Anti-Derrame",
  guantes: "Guantes",
  esponjas: "Esponjas",
  gerdex: "Gerdex",
  espatulas: "Espátulas",
  manguera_aire_comprimido: "Manguera de Aire Comprimido",
  manguera_de_agua: "Manguera de Agua"
}

export type InventoryStatus = "optimo" | "bajo" | "sin_stock"

export function getInventoryStatus(quantity: number, itemKey: string): InventoryStatus {
  const lowThreshold: Record<string, number> = {
    trajes_anti_derrame: 5,
    guantes: 40,
    esponjas: 20,
    gerdex: 10,
    espatulas: 12,
    manguera_aire_comprimido: 2,
    manguera_de_agua: 2
  }

  if (quantity === 0) return "sin_stock"
  if (quantity <= lowThreshold[itemKey]) return "bajo"
  return "optimo"
}
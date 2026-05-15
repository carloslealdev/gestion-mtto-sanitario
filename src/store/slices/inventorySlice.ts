import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { inventory as initialInventory } from "@/mock-data/inventory"
import type { Inventory, GroupInventory } from "@/mock-data/inventory"

interface InventoryState {
  inventory: Inventory
}

const loadState = (): InventoryState => {
  try {
    const stored = localStorage.getItem("inventoryState")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error("Error loading inventory state:", e)
  }
  return { inventory: initialInventory }
}

const initialState: InventoryState = loadState()

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    addToInventory: (
      state,
      action: PayloadAction<{ team: keyof Inventory; item: keyof GroupInventory; quantity: number }>
    ) => {
      const { team, item, quantity } = action.payload
      if (state.inventory[team] && state.inventory[team][item]) {
        state.inventory[team][item].quantity += quantity
        saveState(state)
      }
    },
    subtractFromInventory: (
      state,
      action: PayloadAction<{ team: keyof Inventory; item: keyof GroupInventory; quantity: number }>
    ) => {
      const { team, item, quantity } = action.payload
      if (state.inventory[team] && state.inventory[team][item]) {
        state.inventory[team][item].quantity = Math.max(
          0,
          state.inventory[team][item].quantity - quantity
        )
        saveState(state)
      }
    },
    resetInventory: (state) => {
      state.inventory = initialInventory
      saveState(state)
    },
  },
})

function saveState(state: InventoryState) {
  try {
    localStorage.setItem("inventoryState", JSON.stringify(state))
  } catch (e) {
    console.error("Error saving inventory state:", e)
  }
}

export const { addToInventory, subtractFromInventory, resetInventory } = inventorySlice.actions
export default inventorySlice.reducer
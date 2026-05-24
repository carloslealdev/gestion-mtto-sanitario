import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import * as inventoryService from "@/services/inventoryService"

interface InventoryState {
  inventory: Record<string, Record<string, { quantity: number }>>
  loading: boolean
  error: string | null
}

const initialState: InventoryState = {
  inventory: {},
  loading: false,
  error: null,
}

export const fetchInventory = createAsyncThunk("inventory/fetch", async () => {
  const docs = await inventoryService.getAllInventories()
  const result: Record<string, Record<string, { quantity: number }>> = {}
  for (const doc of docs) {
    const group: Record<string, { quantity: number }> = {}
    for (const item of doc.items) {
      group[item.item] = { quantity: item.quantity }
    }
    result[doc.groupId] = group
  }
  return result
})

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    addToInventory(
      state,
      action: PayloadAction<{ team: string; item: string; quantity: number }>
    ) {
      const { team, item, quantity } = action.payload
      if (!state.inventory[team]) {
        state.inventory[team] = {}
      }
      if (!state.inventory[team][item]) {
        state.inventory[team][item] = { quantity: 0 }
      }
      state.inventory[team][item].quantity += quantity
    },
    subtractFromInventory(
      state,
      action: PayloadAction<{ team: string; item: string; quantity: number }>
    ) {
      const { team, item, quantity } = action.payload
      if (state.inventory[team]?.[item]) {
        state.inventory[team][item].quantity = Math.max(
          0,
          state.inventory[team][item].quantity - quantity
        )
      }
    },
    setGroupInventory(
      state,
      action: PayloadAction<{ groupId: string; items: Record<string, { quantity: number }> }>
    ) {
      state.inventory[action.payload.groupId] = action.payload.items
    },
    resetInventory(state) {
      state.inventory = {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false
        state.inventory = action.payload
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al cargar inventario"
      })
  },
})

export const { addToInventory, subtractFromInventory, setGroupInventory, resetInventory } =
  inventorySlice.actions
export default inventorySlice.reducer

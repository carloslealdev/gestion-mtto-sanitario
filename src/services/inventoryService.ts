import { getAllDocuments, getDocument, setDocument, deleteDocument, getDocRef, runTransaction } from "@/lib/firestore"

const COLLECTION = "inventory"

export interface InventoryItem {
  item: string
  quantity: number
}

export interface GroupInventoryData {
  groupId: string
  items: InventoryItem[]
}

export async function getAllInventories(): Promise<(GroupInventoryData & { id: string })[]> {
  return getAllDocuments<GroupInventoryData>(COLLECTION)
}

export async function getInventory(groupId: string): Promise<(GroupInventoryData & { id: string }) | null> {
  return getDocument<GroupInventoryData>(COLLECTION, groupId)
}

export async function setInventory(groupId: string, data: GroupInventoryData): Promise<void> {
  await setDocument(COLLECTION, groupId, data)
}

export async function deleteInventory(groupId: string): Promise<void> {
  await deleteDocument(COLLECTION, groupId)
}

export async function updateInventoryItem(
  groupId: string,
  itemKey: string,
  quantity: number
): Promise<void> {
  await runTransaction(async (tx) => {
    const ref = getDocRef(COLLECTION, groupId)
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error("Inventory not found")
    const existing = snap.data() as GroupInventoryData
    const items = existing.items.map((i) =>
      i.item === itemKey ? { ...i, quantity: Math.max(0, i.quantity + quantity) } : i
    )
    if (!items.find((i) => i.item === itemKey)) {
      items.push({ item: itemKey, quantity: Math.max(0, quantity) })
    }
    tx.set(ref, { groupId, items })
  })
}

export async function addItemsToInventory(
  groupId: string,
  newItems: { item: string; quantity: number }[]
): Promise<GroupInventoryData> {
  const result = await runTransaction(async (tx) => {
    const ref = getDocRef(COLLECTION, groupId)
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error("Inventory not found")
    const existing = snap.data() as GroupInventoryData
    const items = [...existing.items]
    for (const { item, quantity } of newItems) {
      const idx = items.findIndex((i) => i.item === item)
      if (idx >= 0) {
        items[idx] = { ...items[idx], quantity: Math.max(0, items[idx].quantity + quantity) }
      } else {
        items.push({ item, quantity: Math.max(0, quantity) })
      }
    }
    tx.set(ref, { groupId, items })
    return { groupId, items }
  })
  return result
}
